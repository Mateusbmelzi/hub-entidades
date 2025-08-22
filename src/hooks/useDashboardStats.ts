import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalDemonstracoes: number;
  totalEventos: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDemonstracoes: 0,
    totalEventos: 0,
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Buscar total de demonstrações
      const { count: totalDemonstracoes, error: demonstracoesError } = await supabase
        .from('demonstracoes_interesse')
        .select('*', { count: 'exact', head: true });

      if (demonstracoesError) {
        console.error('Erro ao buscar demonstrações:', demonstracoesError);
        throw demonstracoesError;
      }

      // Buscar total de eventos
      const { count: totalEventos, error: eventosError } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      if (eventosError) {
        console.error('Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('📊 Estatísticas carregadas:', { totalDemonstracoes, totalEventos });

      setStats({
        totalDemonstracoes: totalDemonstracoes || 0,
        totalEventos: totalEventos || 0,
        loading: false,
        error: null
      });

    } catch (err: any) {
      console.error('Erro ao buscar estatísticas do dashboard:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Erro ao carregar estatísticas'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    ...stats,
    refetch: fetchStats
  };
};
