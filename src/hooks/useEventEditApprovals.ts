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

      const { data, error } = await supabase
        .from('event_edit_requests')
        .select(`
          *,
          eventos(id, nome, descricao, local, data, horario_inicio, horario_termino, capacidade, link_evento, area_atuacao),
          entidades(id, nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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
        .from('event_edit_requests')
        .update({ status, comentario_aprovacao: comment || null })
        .eq('id', requestId);
      if (error) throw error;

      // If approved, apply changes to event
      if (approve) {
        const req = requests.find(r => r.id === requestId);
        if (req) {
          const { error: updError } = await supabase
            .from('eventos')
            .update(req.changes)
            .eq('id', req.evento_id);
          if (updError) throw updError;
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


