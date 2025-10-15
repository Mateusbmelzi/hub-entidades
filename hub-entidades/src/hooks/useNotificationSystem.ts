import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: number;
  user_email: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  archived: boolean;
  created_at: string;
  related_entity_id?: number;
  related_demonstration_id?: number;
  related_reservation_id?: string;
}

export const useNotificationSystem = () => {
  const createNotification = async (
    userEmail: string,
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    relatedEntityId?: number,
    relatedDemonstrationId?: number,
    relatedReservationId?: string
  ) => {
    try {
      console.log('💾 Inserindo notificação no banco:', {
        userEmail,
        title,
        message,
        type,
        relatedEntityId,
        relatedDemonstrationId,
        relatedReservationId
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_email: userEmail,
          title,
          message,
          type,
          read: false,
          related_entity_id: relatedEntityId,
          related_demonstration_id: relatedDemonstrationId,
          related_reservation_id: relatedReservationId
        })
        .select();

      console.log('📊 Resultado da inserção:', { data, error });

      if (error) {
        console.error('❌ Erro ao criar notificação:', error);
        return false;
      }

      console.log('✅ Notificação criada com sucesso:', data);
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      return false;
    }
  };

  const markAsRead = async (notificationId: number | string) => {
    try {
      console.log('🔔 useNotificationSystem - Marcando como lida:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      console.log('🔔 useNotificationSystem - Resultado da atualização:', { error });

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return false;
      }

      console.log('✅ Notificação marcada como lida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  const archiveNotification = async (notificationId: number | string) => {
    try {
      console.log('🔔 useNotificationSystem - Arquivando notificação:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ archived: true })
        .eq('id', notificationId);

      console.log('🔔 useNotificationSystem - Resultado do arquivamento:', { error });

      if (error) {
        console.error('Erro ao arquivar notificação:', error);
        return false;
      }

      console.log('✅ Notificação arquivada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao arquivar notificação:', error);
      return false;
    }
  };

  const archiveAllNotifications = async (userKey: string | string[] | null) => {
    try {
      console.log('🔔 useNotificationSystem - Arquivando todas as notificações para:', userKey);
      
      let query = supabase
        .from('notifications')
        .update({ archived: true })
        .eq('archived', false);

      if (Array.isArray(userKey) && userKey.length > 0) {
        query = query.in('user_email', userKey);
      } else if (typeof userKey === 'string' && userKey) {
        query = query.eq('user_email', userKey);
      }

      const { error } = await query;

      if (error) {
        console.error('Erro ao arquivar todas as notificações:', error);
        return false;
      }

      console.log('✅ Todas as notificações foram arquivadas com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao arquivar todas as notificações:', error);
      return false;
    }
  };

  const getNotifications = async (userKey: string | string[] | null) => {
    try {
      console.log('🔔 useNotificationSystem - getNotifications chamado com:', userKey);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('archived', false) // Apenas notificações não arquivadas
        .order('created_at', { ascending: false });

      if (Array.isArray(userKey) && userKey.length > 0) {
        console.log('🔔 useNotificationSystem - Filtrando por qualquer identificador (IN):', userKey);
        query = query.in('user_email', userKey);
      } else if (typeof userKey === 'string' && userKey) {
        console.log('🔔 useNotificationSystem - Filtrando por user_email:', userKey);
        query = query.eq('user_email', userKey);
      } else {
        console.log('🔔 useNotificationSystem - Buscando todas as notificações (userEmail é null)');
      }

      const { data, error } = await query;
      console.log('🔔 useNotificationSystem - Resultado da query:', { 
        dataCount: data?.length || 0, 
        error,
        userKey,
        queryDetails: {
          archived: false,
          orderBy: 'created_at desc',
          filterBy: Array.isArray(userKey) ? userKey : [userKey]
        }
      });

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        return [];
      }

      console.log('✅ Notificações carregadas:', { 
        count: data?.length || 0,
        notifications: data?.map(n => ({ 
          id: n.id, 
          user_email: n.user_email, 
          title: n.title,
          archived: n.archived,
          read: n.read
        }))
      });
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  };

  const getUnreadCount = async (userKey: string | string[] | null) => {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
        .eq('archived', false); // Apenas notificações não arquivadas

      if (Array.isArray(userKey) && userKey.length > 0) {
        query = query.in('user_email', userKey);
      } else if (typeof userKey === 'string' && userKey) {
        query = query.eq('user_email', userKey);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Erro ao buscar contagem de notificações:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
      return 0;
    }
  };

  const notifyDemonstrationStatusChange = async (
    studentEmail: string,
    entityName: string,
    status: 'aprovada' | 'rejeitada',
    entityId: number,
    demonstrationId: number
  ) => {
    const title = status === 'aprovada' 
      ? 'Demonstração Aprovada! 🎉' 
      : 'Demonstração Não Aprovada';

    const message = status === 'aprovada'
      ? `Parabéns! Sua demonstração de interesse para ${entityName} foi aprovada. Entre em contato com a entidade para próximos passos.`
      : `Sua demonstração de interesse para ${entityName} não foi aprovada. Você pode tentar novamente ou buscar outras entidades.`;

    const type = status === 'aprovada' ? 'success' : 'warning';

    const success = await createNotification(
      studentEmail,
      title,
      message,
      type,
      entityId,
      demonstrationId
    );

    if (success) {
      console.log(`Notificação enviada para ${studentEmail} sobre status ${status}`);
    }

    return success;
  };

  const notifyReservationStatusChange = async (
    userEmail: string,
    reservationType: string,
    status: 'aprovada' | 'rejeitada',
    reservationId: string,
    comment?: string
  ) => {
    console.log('🔔 Criando notificação de reserva:', {
      userEmail,
      reservationType,
      status,
      reservationId,
      comment
    });

    const title = status === 'aprovada' 
      ? 'Reserva Aprovada! ✅' 
      : 'Reserva Não Aprovada';

    const typeLabel = reservationType === 'auditorio' ? 'Auditório' : 'Sala';
    const message = status === 'aprovada'
      ? `Sua reserva de ${typeLabel} foi aprovada! ${comment ? `Comentário: ${comment}` : ''}`
      : `Sua reserva de ${typeLabel} não foi aprovada. ${comment ? `Motivo: ${comment}` : 'Entre em contato para mais informações.'}`;

    const type = status === 'aprovada' ? 'success' : 'warning';

    console.log('📝 Dados da notificação:', {
      title,
      message,
      type,
      userEmail,
      reservationId
    });

    const success = await createNotification(
      userEmail,
      title,
      message,
      type,
      undefined,
      undefined,
      reservationId
    );

    console.log('📤 Resultado da criação da notificação:', success);

    if (success) {
      console.log(`✅ Notificação de reserva enviada para ${userEmail} sobre status ${status}`);
    } else {
      console.error(`❌ Falha ao enviar notificação para ${userEmail}`);
    }

    return success;
  };

  const debugAllNotifications = async () => {
    try {
      // Limpar console primeiro
      console.clear();
      console.log('🔍 ===== DEBUG NOTIFICAÇÕES =====');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ERRO:', error);
        return [];
      }

      console.log(`📊 TOTAL DE NOTIFICAÇÕES: ${data?.length || 0}`);
      console.log('📋 NOTIFICAÇÕES:');
      
      data?.forEach((n, index) => {
        console.log(`${index + 1}. ID: ${n.id}`);
        console.log(`   📧 User Email: "${n.user_email}"`);
        console.log(`   📝 Título: "${n.title}"`);
        console.log(`   📁 Arquived: ${n.archived}`);
        console.log(`   👁️ Read: ${n.read}`);
        console.log(`   📅 Criada: ${n.created_at}`);
        console.log('   ---');
      });

      console.log('🔍 ===== FIM DEBUG =====');
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar todas as notificações:', error);
      return [];
    }
  };

  return {
    createNotification,
    markAsRead,
    archiveNotification,
    archiveAllNotifications,
    getNotifications,
    getUnreadCount,
    debugAllNotifications,
    notifyDemonstrationStatusChange,
    notifyReservationStatusChange
  };
}; 