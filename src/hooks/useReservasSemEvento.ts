import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva } from '@/types/reserva';

export function useReservasSemEvento(entidadeId?: number) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservasSemEvento = async () => {
    if (!entidadeId) {
      setReservas([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reservas')
        .select('*')
        .eq('entidade_id', entidadeId)
        .eq('status_reserva', 'aprovada')
        .is('evento_id', null)
        .order('data_reserva', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar reservas sem evento:', fetchError);
        throw fetchError;
      }

      setReservas(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reservas';
      setError(errorMessage);
      console.error('Erro ao buscar reservas sem evento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasSemEvento();
  }, [entidadeId]);

  return { 
    reservas, 
    loading, 
    error, 
    refetch: fetchReservasSemEvento 
  };
}

