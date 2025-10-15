import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndicadoresGerais {
  total_alunos: number;
  total_entidades: number;
  total_demonstracoes: number;
  total_eventos: number;
}

export const useIndicadoresGerais = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresGerais | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('indicadores_gerais')
        .select('*')
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setIndicadores(data);
    } catch (err) {
      console.error('Erro ao buscar indicadores gerais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicadores();
  }, []);

  return {
    indicadores,
    loading,
    error,
    refetch: fetchIndicadores
  };
};
