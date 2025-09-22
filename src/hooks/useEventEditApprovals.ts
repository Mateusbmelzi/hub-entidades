import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventEditRequest {
  id: string;
  created_at: string;
  updated_at: string;
  evento_id: string;
  entidade_id: number;
  requested_by: string;
  changes: any;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  comentario_aprovacao?: string | null;
  eventos?: { 
    id: string;
    nome: string;
    descricao?: string;
    local?: string;
    data: string;
    horario_inicio?: string | null;
    horario_termino?: string | null;
    capacidade?: number;
    link_evento?: string;
    area_atuacao?: string[];
  } | null;
  entidades?: { nome: string } | null;
}

export const useEventEditApprovals = () => {
  const [requests, setRequests] = useState<EventEditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar solicitações de edição
      const { data: requestsData, error: requestsError } = await supabase
        .from('event_edit_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }

      // Buscar detalhes dos eventos e entidades
      const eventoIds = requestsData.map((r: any) => r.evento_id);
      const entidadeIds = requestsData.map((r: any) => r.entidade_id);

      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('id, nome, descricao, local, data, horario_inicio, horario_termino, capacidade, link_evento, area_atuacao')
        .in('id', eventoIds);

      const { data: entidadesData, error: entidadesError } = await supabase
        .from('entidades')
        .select('id, nome')
        .in('id', entidadeIds);

      if (eventosError) throw eventosError;
      if (entidadesError) throw entidadesError;

      // Combinar os dados
      const requestsWithDetails: EventEditRequest[] = requestsData.map((request: any) => {
        const evento = eventosData?.find(e => e.id === request.evento_id);
        const entidade = entidadesData?.find(ent => ent.id === request.entidade_id);

        return {
          ...request,
          eventos: evento || null,
          entidades: entidade || null
        };
      });

      setRequests(requestsWithDetails);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string, approve: boolean, comment?: string) => {
    try {
      const status = approve ? 'aprovada' : 'rejeitada';
      const { error } = await supabase
        .from('event_edit_requests' as any)
        .update({ status, comentario_aprovacao: comment || null })
        .eq('id', requestId);
      if (error) throw error;

      // If approved, apply changes to event and sync with reservations
      if (approve) {
        const req = requests.find(r => r.id === requestId);
        if (req) {
          // Update the event
          const { error: updError } = await supabase
            .from('eventos')
            .update(req.changes)
            .eq('id', req.evento_id);
          if (updError) throw updError;

          // If the event name changed, update the associated reservations
          if (req.changes.nome) {
            console.log('🔄 Sincronizando nome do evento com reservas...');
            
            // Find all reservations linked to this event
            const { data: reservas, error: reservasError } = await supabase
              .from('reservas')
              .select('id, titulo_evento_capacitacao')
              .eq('evento_id', req.evento_id);

            if (reservasError) {
              console.error('❌ Erro ao buscar reservas:', reservasError);
            } else if (reservas && reservas.length > 0) {
              // Update titulo_evento_capacitacao in all associated reservations
              const { error: updateReservasError } = await supabase
                .from('reservas')
                .update({ titulo_evento_capacitacao: req.changes.nome } as any)
                .eq('evento_id', req.evento_id);

              if (updateReservasError) {
                console.error('❌ Erro ao atualizar reservas:', updateReservasError);
              } else {
                console.log('✅ Reservas sincronizadas com sucesso');
              }
            }
          }
        }
      }

      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, error, fetchRequests, approveRequest };
};


