import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AlunoPorCurso {
  curso: string;
  total_alunos: number;
}

export const useAlunosPorCurso = () => {
  const [alunosPorCurso, setAlunosPorCurso] = useState<AlunoPorCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunosPorCurso = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar perfis agrupados por curso
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('curso')
        .not('curso', 'is', null);

      if (queryError) {
        throw queryError;
      }

      if (data) {
        // Processar os dados para agrupar por curso
        const cursoCounts: { [key: string]: number } = {};
        
        data.forEach((item) => {
          const curso = item.curso;
          if (curso) {
            cursoCounts[curso] = (cursoCounts[curso] || 0) + 1;
          }
        });

        // Converter para array e ordenar por total
        const processedData = Object.entries(cursoCounts)
          .map(([curso, total_alunos]) => ({
            curso,
            total_alunos
          }))
          .sort((a, b) => b.total_alunos - a.total_alunos);

        setAlunosPorCurso(processedData);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos por curso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosPorCurso();
  }, []);

  const refetch = () => {
    fetchAlunosPorCurso();
  };

  return {
    alunosPorCurso,
    loading,
    error,
    refetch
  };
};
