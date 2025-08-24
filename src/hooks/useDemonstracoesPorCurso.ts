import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DemonstracaoPorCurso {
  curso: string;
  total_demonstracoes: number;
}

export const useDemonstracoesPorCurso = () => {
  const [demonstracoesPorCurso, setDemonstracoesPorCurso] = useState<DemonstracaoPorCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemonstracoesPorCurso = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar demonstrações de interesse agrupadas por curso_estudante
      const { data, error: queryError } = await supabase
        .from('demonstracoes_interesse')
        .select('curso_estudante')
        .not('curso_estudante', 'is', null);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Processar os dados para agrupar por curso
        const cursoCounts: { [key: string]: number } = {};
        
        data.forEach((item) => {
          const curso = item.curso_estudante;
          if (curso) {
            cursoCounts[curso] = (cursoCounts[curso] || 0) + 1;
          }
        });

        // Converter para array e ordenar por total (decrescente)
        const processedData = Object.entries(cursoCounts)
          .map(([curso, total_demonstracoes]) => ({
            curso,
            total_demonstracoes
          }))
          .sort((a, b) => b.total_demonstracoes - a.total_demonstracoes);

        setDemonstracoesPorCurso(processedData);
      }
    } catch (err) {
      console.error('Erro ao buscar demonstrações por curso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemonstracoesPorCurso();
  }, []);

  const refetch = () => {
    fetchDemonstracoesPorCurso();
  };

  return {
    demonstracoesPorCurso,
    loading,
    error,
    refetch
  };
};
