import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalAlunos: number;
  totalEntidades: number;
  loading: boolean;
  error: string | null;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    totalEntidades: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Buscar total de alunos (profiles)
        const { count: alunosCount, error: alunosError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (alunosError) {
          throw new Error(`Erro ao buscar alunos: ${alunosError.message}`);
        }

        // Buscar total de entidades
        const { count: entidadesCount, error: entidadesError } = await supabase
          .from('entidades')
          .select('*', { count: 'exact', head: true });

        if (entidadesError) {
          throw new Error(`Erro ao buscar entidades: ${entidadesError.message}`);
        }

        setStats({
          totalAlunos: alunosCount || 0,
          totalEntidades: entidadesCount || 0,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}; 