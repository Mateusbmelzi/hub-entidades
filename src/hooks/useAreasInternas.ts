import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAreasInternas(entidadeId: number) {
  const [areasInternas, setAreasInternas] = useState<string[]>([]);
  const [areasPS, setAreasPS] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    if (!entidadeId) {
      setAreasInternas([]);
      setAreasPS([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entidades')
        .select('areas_estrutura_organizacional, areas_processo_seletivo')
        .eq('id', entidadeId)
        .single();

      if (error) throw error;
      setAreasInternas(data?.areas_estrutura_organizacional || []);
      setAreasPS(data?.areas_processo_seletivo || []);
    } catch (err) {
      console.error('Erro ao buscar áreas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAreasInternas([]);
      setAreasPS([]);
    } finally {
      setLoading(false);
    }
  }, [entidadeId]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return { areasInternas, areasPS, loading, error, refetch: fetchAreas };
}

