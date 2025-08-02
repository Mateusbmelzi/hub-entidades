import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Projeto = Tables<'projetos'>;

export const useProjetos = (entidadeId: number | undefined) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjetos = async () => {
    if (!entidadeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjetos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, [entidadeId]);

  return { projetos, loading, error, refetch: fetchProjetos };
};