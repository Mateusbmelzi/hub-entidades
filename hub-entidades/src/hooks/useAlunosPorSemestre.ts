import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AlunoPorSemestre {
  semestre: number;
  total_alunos: number;
}

export const useAlunosPorSemestre = () => {
  const [alunosPorSemestre, setAlunosPorSemestre] = useState<AlunoPorSemestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunosPorSemestre = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar perfis agrupados por semestre
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('semestre')
        .not('semestre', 'is', null);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Processar os dados para agrupar por semestre
        const semestreCounts: { [key: number]: number } = {};
        
        data.forEach((item) => {
          const semestre = item.semestre;
          if (semestre !== null && semestre !== undefined) {
            semestreCounts[semestre] = (semestreCounts[semestre] || 0) + 1;
          }
        });

        // Converter para array e ordenar por semestre (crescente)
        const processedData = Object.entries(semestreCounts)
          .map(([semestre, total_alunos]) => ({
            semestre: parseInt(semestre),
            total_alunos
          }))
          .sort((a, b) => a.semestre - b.semestre);

        setAlunosPorSemestre(processedData);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos por semestre:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosPorSemestre();
  }, []);

  const refetch = () => {
    fetchAlunosPorSemestre();
  };

  return {
    alunosPorSemestre,
    loading,
    error,
    refetch
  };
};
