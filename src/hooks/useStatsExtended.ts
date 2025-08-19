import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatsExtended {
  totalAlunos: number;
  totalEntidades: number;
  totalEventos: number;
  totalProcessosSeletivos: number;
  loading: boolean;
  error: string | null;
}

export const useStatsExtended = () => {
  const [stats, setStats] = useState<StatsExtended>({
    totalAlunos: 0,
    totalEntidades: 0,
    totalEventos: 0,
    totalProcessosSeletivos: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Buscar todas as estatísticas em paralelo
        const [alunosResult, entidadesResult, eventosResult, processosResult] = await Promise.all([
          // Total de alunos (profiles)
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          
          // Total de entidades
          supabase
            .from('entidades')
            .select('*', { count: 'exact', head: true }),
          
          // Total de eventos
          supabase
            .from('eventos')
            .select('*', { count: 'exact', head: true }),
          
          // Total de processos seletivos (demonstrações de interesse)
          supabase
            .from('demonstracoes_interesse')
            .select('entidade_id', { count: 'exact', head: true })
        ]);

        // Verificar erros
        if (alunosResult.error) {
          throw new Error(`Erro ao buscar alunos: ${alunosResult.error.message}`);
        }
        if (entidadesResult.error) {
          throw new Error(`Erro ao buscar entidades: ${entidadesResult.error.message}`);
        }
        if (eventosResult.error) {
          throw new Error(`Erro ao buscar eventos: ${eventosResult.error.message}`);
        }
        if (processosResult.error) {
          throw new Error(`Erro ao buscar processos seletivos: ${processosResult.error.message}`);
        }

        setStats({
          totalAlunos: alunosResult.count || 0,
          totalEntidades: entidadesResult.count || 0,
          totalEventos: eventosResult.count || 0,
          totalProcessosSeletivos: processosResult.count || 0,
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
