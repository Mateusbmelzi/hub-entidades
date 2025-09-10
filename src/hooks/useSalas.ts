import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Sala {
  id: number;
  predio: string;
  sala: string;
  andar: string;
  capacidade: number;
  reserva_id?: string;
  created_at: string;
  updated_at: string;
}

export const useSalas = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('salas')
        .select('*')
        .order('predio', { ascending: true })
        .order('andar', { ascending: true })
        .order('sala', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setSalas(data || []);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getSalasDisponiveis = (quantidadePessoas: number, predio?: string) => {
    return salas.filter(sala => {
      // Verificar se a sala tem capacidade suficiente
      if (sala.capacidade < quantidadePessoas) {
        return false;
      }

      // Verificar se a sala não está ocupada (sem reserva_id)
      if (sala.reserva_id) {
        return false;
      }

      // Filtrar por prédio se especificado
      if (predio && sala.predio !== predio) {
        return false;
      }

      return true;
    });
  };

  const getSalasPorPredio = () => {
    const salasPorPredio: Record<string, Sala[]> = {};
    
    salas.forEach(sala => {
      if (!salasPorPredio[sala.predio]) {
        salasPorPredio[sala.predio] = [];
      }
      salasPorPredio[sala.predio].push(sala);
    });

    return salasPorPredio;
  };

  const associarSalaReserva = async (salaId: number, reservaId: string) => {
    try {
      const { error } = await supabase
        .from('salas')
        .update({ reserva_id: reservaId })
        .eq('id', salaId);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setSalas(prev => 
        prev.map(sala => 
          sala.id === salaId 
            ? { ...sala, reserva_id: reservaId }
            : sala
        )
      );

      return true;
    } catch (err) {
      console.error('Erro ao associar sala à reserva:', err);
      setError(err instanceof Error ? err.message : 'Erro ao associar sala');
      return false;
    }
  };

  const desassociarSalaReserva = async (salaId: number) => {
    try {
      const { error } = await supabase
        .from('salas')
        .update({ reserva_id: null })
        .eq('id', salaId);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setSalas(prev => 
        prev.map(sala => 
          sala.id === salaId 
            ? { ...sala, reserva_id: undefined }
            : sala
        )
      );

      return true;
    } catch (err) {
      console.error('Erro ao desassociar sala da reserva:', err);
      setError(err instanceof Error ? err.message : 'Erro ao desassociar sala');
      return false;
    }
  };

  useEffect(() => {
    fetchSalas();
  }, []);

  return {
    salas,
    loading,
    error,
    refetch: fetchSalas,
    getSalasDisponiveis,
    getSalasPorPredio,
    associarSalaReserva,
    desassociarSalaReserva
  };
};
