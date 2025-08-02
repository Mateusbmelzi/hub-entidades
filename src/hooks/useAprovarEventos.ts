import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSystem } from './useNotificationSystem';

export interface EventoParaAprovacao {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data_evento: string;
  capacidade?: number;
  status: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  comentario_aprovacao?: string;
  data_aprovacao?: string;
  aprovador_email?: string;
  entidade_id: number;
  created_at: string;
  updated_at: string;
  entidade_nome?: string;
}

export const useAprovarEventos = () => {
  const [eventos, setEventos] = useState<EventoParaAprovacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifyDemonstrationStatusChange } = useNotificationSystem();

  const fetchEventosParaAprovacao = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar eventos com JOIN para obter o nome da entidade
      const { data, error: fetchError } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(nome, email_contato)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transformar os dados para incluir o nome da entidade
      const eventosComEntidade = (data || []).map((item: any) => ({
        ...item,
        entidade_nome: item.entidades?.nome || 'Entidade não encontrada'
      }));

      setEventos(eventosComEntidade);
    } catch (err: any) {
      console.error('Error fetching eventos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aprovarEvento = async (
    eventoId: string, 
    status: 'aprovado' | 'rejeitado', 
    comentario?: string
  ) => {
    try {
      // Buscar o evento para obter informações da entidade
      const evento = eventos.find(e => e.id === eventoId);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      // Chamar função RPC para aprovar/rejeitar
      const { error } = await supabase.rpc('aprovar_evento', {
        _evento_id: eventoId,
        _status_aprovacao: status,
        _comentario_aprovacao: comentario
      });

      if (error) {
        throw error;
      }

      // Enviar notificação para a entidade
      const entityEmail = evento.entidades?.email_contato;
      if (entityEmail) {
        await notifyEventStatusChange(
          entityEmail,
          evento.nome,
          status,
          evento.entidade_id,
          eventoId,
          comentario
        );
      }

      // Atualizar a lista local
      setEventos(prev => 
        prev.map(e => e.id === eventoId ? { 
          ...e, 
          status_aprovacao: status,
          comentario_aprovacao: comentario,
          data_aprovacao: new Date().toISOString()
        } : e)
      );

      console.log(`Evento ${status} com sucesso e notificação enviada para ${entityEmail}`);

      return { success: true };
    } catch (err: any) {
      console.error('Error approving event:', err);
      return { success: false, error: err.message };
    }
  };

  const notifyEventStatusChange = async (
    entityEmail: string,
    eventName: string,
    status: 'aprovado' | 'rejeitado',
    entityId: number,
    eventId: string,
    comentario?: string
  ) => {
    const title = status === 'aprovado' 
      ? 'Evento Aprovado! 🎉' 
      : 'Evento Não Aprovado';

    const message = status === 'aprovado'
      ? `Seu evento "${eventName}" foi aprovado e está agora visível na plataforma.`
      : `Seu evento "${eventName}" não foi aprovado.${comentario ? ` Motivo: ${comentario}` : ''}`;

    const type = status === 'aprovado' ? 'success' : 'warning';

    // Usar o sistema de notificações existente
    const { createNotification } = useNotificationSystem();
    
    return await createNotification(
      entityEmail,
      title,
      message,
      type,
      entityId
    );
  };

  useEffect(() => {
    fetchEventosParaAprovacao();
  }, []);

  return {
    eventos,
    loading,
    error,
    refetch: fetchEventosParaAprovacao,
    aprovarEvento
  };
}; 