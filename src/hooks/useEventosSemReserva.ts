import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoSemReserva {
  id: string;
  nome: string;
  descricao?: string;
  data_evento: string;
  local?: string;
  capacidade?: number;
  status_aprovacao: string;
  entidade_id: number;
}

export function useEventosSemReserva(entidadeId?: number) {
  const [eventos, setEventos] = useState<EventoSemReserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventosSemReserva = async () => {
    if (!entidadeId) {
      setEventos([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('eventos')
        .select('id, nome, descricao, data_evento, local, capacidade, status_aprovacao, entidade_id')
        .eq('entidade_id', entidadeId)
        .eq('status_aprovacao', 'aprovado')
        .is('reserva_id', null)
        .order('data_evento', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar eventos sem reserva:', fetchError);
        throw fetchError;
      }

      setEventos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      setError(errorMessage);
      console.error('Erro ao buscar eventos sem reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosSemReserva();
  }, [entidadeId]);

  return { 
    eventos, 
    loading, 
    error, 
    refetch: fetchEventosSemReserva 
  };
}

