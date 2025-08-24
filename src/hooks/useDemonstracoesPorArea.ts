import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DemonstracaoPorArea {
  area_atuacao: string;
  total_demonstracoes: number;
}

export const useDemonstracoesPorArea = () => {
  const [demonstracoesPorArea, setDemonstracoesPorArea] = useState<DemonstracaoPorArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemonstracoesPorArea = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query simples: contar demonstrações por área de atuação das entidades
      const { data, error: queryError } = await supabase
        .from('demonstracoes_interesse')
        .select(`
          entidades!inner(
            area_atuacao
          )
        `);

      if (queryError) {
        throw queryError;
      }

      console.log('📊 Total de demonstrações retornadas:', data?.length || 0);

      if (data) {
        // Processar os dados para agrupar por área de atuação
        const areaCounts: { [key: string]: number } = {};
        
        console.log('📊 Primeiras 5 demonstrações:', data.slice(0, 5));
        
        data.forEach((item, index) => {
          const area = item.entidades.area_atuacao;
          if (area) {
            areaCounts[area] = (areaCounts[area] || 0) + 1;
          } else {
            console.log('⚠️ Demonstração sem área:', item, 'Índice:', index);
          }
        });

        console.log('📊 Áreas encontradas:', Object.keys(areaCounts));
        console.log('📊 Contagem por área:', areaCounts);
        console.log('📊 Total de itens processados:', data.length);
        console.log('📊 Total de áreas com contagem:', Object.keys(areaCounts).length);

        // Converter para array e ordenar por total
        const processedData = Object.entries(areaCounts)
          .map(([area_atuacao, total_demonstracoes]) => ({
            area_atuacao,
            total_demonstracoes
          }))
          .sort((a, b) => b.total_demonstracoes - a.total_demonstracoes)
          .slice(0, 10); // Top 10 áreas

        const totalProcessado = processedData.reduce((sum, item) => sum + item.total_demonstracoes, 0);
        console.log('📊 Total processado:', totalProcessado);
        console.log('📊 Diferença encontrada:', data.length - totalProcessado);

        setDemonstracoesPorArea(processedData);
      }
    } catch (err) {
      console.error('Erro ao buscar demonstrações por área:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemonstracoesPorArea();
  }, []);

  const refetch = () => {
    fetchDemonstracoesPorArea();
  };

  return {
    demonstracoesPorArea,
    loading,
    error,
    refetch
  };
};
