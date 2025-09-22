import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: number;
  user_email: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  related_entity_id?: number;
  related_demonstration_id?: number;
}

export const useNotificationSystem = () => {
  const createNotification = async (
    userEmail: string,
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    relatedEntityId?: number,
    relatedDemonstrationId?: number
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_email: userEmail,
          title,
          message,
          type,
          read: false,
          related_entity_id: relatedEntityId,
          related_demonstration_id: relatedDemonstrationId
        });

      if (error) {
        console.error('Erro ao criar notificação:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return false;
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  const getNotifications = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  };

  const getUnreadCount = async (userEmail: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', userEmail)
        .eq('read', false);

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
    const title = status === 'aprovada' 
      ? 'Reserva Aprovada! ✅' 
      : 'Reserva Não Aprovada';

    const typeLabel = reservationType === 'auditorio' ? 'Auditório' : 'Sala';
    const message = status === 'aprovada'
      ? `Sua reserva de ${typeLabel} foi aprovada! ${comment ? `Comentário: ${comment}` : ''}`
      : `Sua reserva de ${typeLabel} não foi aprovada. ${comment ? `Motivo: ${comment}` : 'Entre em contato para mais informações.'}`;

    const type = status === 'aprovada' ? 'success' : 'warning';

    const success = await createNotification(
      userEmail,
      title,
      message,
      type
    );

    if (success) {
      console.log(`Notificação de reserva enviada para ${userEmail} sobre status ${status}`);
    }

    return success;
  };

  return {
    createNotification,
    markAsRead,
    getNotifications,
    getUnreadCount,
    notifyDemonstrationStatusChange,
    notifyReservationStatusChange
  };
}; 