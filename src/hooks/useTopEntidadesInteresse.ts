import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopEntidadeInteresse {
  nome_entidade: string;
  total_demonstracoes: number;
}

export const useTopEntidadesInteresse = () => {
  const [entidades, setEntidades] = useState<TopEntidadeInteresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopEntidades = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('top_entidades_interesse')
        .select('nome_entidade, total_demonstracoes')
        .order('total_demonstracoes', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      setEntidades(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar top entidades com interesse:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTopEntidades();
  };

  useEffect(() => {
    fetchTopEntidades();
  }, []);

  return { entidades, loading, error, refetch };
};
