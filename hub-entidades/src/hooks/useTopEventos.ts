import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopEvento {
  total_inscricoes: number;
  nome_evento: string;
}

export const useTopEventos = () => {
  const [eventos, setEventos] = useState<TopEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopEventos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('top_eventos')
        .select('*')
        .order('total_inscricoes', { ascending: false })
        .limit(10);

      if (supabaseError) {
        throw supabaseError;
      }

      setEventos(data || []);
    } catch (err) {
      console.error('Erro ao buscar top eventos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    refetch: fetchTopEventos
  };
};
