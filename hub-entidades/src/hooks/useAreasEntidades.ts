import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AreaEntidade {
  area_atuacao: string;
  total_entidades: number;
}

export const useAreasEntidades = () => {
  const [areasEntidades, setAreasEntidades] = useState<AreaEntidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreasEntidades = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar entidades agrupadas por área de atuação
      const { data, error: queryError } = await supabase
        .from('entidades')
        .select('area_atuacao')
        .not('area_atuacao', 'is', null);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Processar os dados para agrupar por área de atuação
        const areaCounts: { [key: string]: number } = {};
        
        data.forEach((item) => {
          const area = item.area_atuacao;
          if (area) {
            areaCounts[area] = (areaCounts[area] || 0) + 1;
          }
        });

        // Converter para array e ordenar por total
        const processedData = Object.entries(areaCounts)
          .map(([area_atuacao, total_entidades]) => ({
            area_atuacao,
            total_entidades
          }))
          .sort((a, b) => b.total_entidades - a.total_entidades);

        setAreasEntidades(processedData);
      }
    } catch (err) {
      console.error('Erro ao buscar áreas das entidades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreasEntidades();
  }, []);

  const refetch = () => {
    fetchAreasEntidades();
  };

  return {
    areasEntidades,
    loading,
    error,
    refetch
  };
};
