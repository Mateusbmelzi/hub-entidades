import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventosAprovacaoStats {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  taxaAprovacao: number;
  eventosHoje: number;
  eventosSemana: number;
}

export interface EventoPendente {
  id: string;
  nome: string;
  entidade_nome: string;
  data_evento: string;
  created_at: string;
}

export const useEventosAprovacaoStats = () => {
  const [stats, setStats] = useState<EventosAprovacaoStats>({
    total: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    taxaAprovacao: 0,
    eventosHoje: 0,
    eventosSemana: 0
  });
  
  const [eventosPendentes, setEventosPendentes] = useState<EventoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      console.log('🔄 Iniciando busca de estatísticas de aprovação...');
      setLoading(true);
      setError(null);

      // Buscar estatísticas básicas
      console.log('📊 Buscando dados básicos dos eventos...');
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('id, status_aprovacao, data_evento, created_at');

      if (eventosError) {
        console.error('❌ Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('✅ Eventos carregados:', eventosData?.length || 0, 'eventos encontrados');

      // Calcular estatísticas
      const total = eventosData?.length || 0;
      const pendentes = eventosData?.filter(e => e.status_aprovacao === 'pendente').length || 0;
      const aprovados = eventosData?.filter(e => e.status_aprovacao === 'aprovado').length || 0;
      const rejeitados = eventosData?.filter(e => e.status_aprovacao === 'rejeitado').length || 0;
      
      const taxaAprovacao = total > 0 ? aprovados / total : 0;

      console.log('📈 Estatísticas calculadas:', {
        total,
        pendentes,
        aprovados,
        rejeitados,
        taxaAprovacao: (taxaAprovacao * 100).toFixed(1) + '%'
      });

      // Calcular eventos de hoje e desta semana
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);

      const eventosHoje = eventosData?.filter(e => {
        const dataEvento = new Date(e.data_evento);
        return dataEvento.toDateString() === hoje.toDateString();
      }).length || 0;

      const eventosSemana = eventosData?.filter(e => {
        const dataEvento = new Date(e.data_evento);
        return dataEvento >= inicioSemana && dataEvento <= hoje;
      }).length || 0;

      const newStats: EventosAprovacaoStats = {
        total,
        pendentes,
        aprovados,
        rejeitados,
        taxaAprovacao,
        eventosHoje,
        eventosSemana
      };

      setStats(newStats);
      console.log('✅ Estatísticas atualizadas no estado');

      // Buscar eventos pendentes com detalhes
      console.log('🔍 Buscando eventos pendentes com detalhes...');
      const { data: pendentesData, error: pendentesError } = await supabase
        .from('eventos')
        .select(`
          id,
          nome,
          data_evento,
          created_at,
          entidades(nome)
        `)
        .eq('status_aprovacao', 'pendente')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendentesError) {
        console.warn('⚠️ Erro ao buscar eventos pendentes:', pendentesError);
      } else {
        console.log('✅ Eventos pendentes carregados:', pendentesData?.length || 0);
        
        const eventosPendentesFormatted = (pendentesData || []).map((item: any) => ({
          id: item.id,
          nome: item.nome,
          entidade_nome: item.entidades?.nome || 'Entidade não encontrada',
          data_evento: item.data_evento,
          created_at: item.created_at
        }));
        
        setEventosPendentes(eventosPendentesFormatted);
        console.log('✅ Eventos pendentes formatados e atualizados no estado');
      }

    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas de aprovação:', err);
      setError(err.message || 'Erro desconhecido ao carregar dados');
    } finally {
      setLoading(false);
      console.log('🏁 Busca de estatísticas finalizada');
    }
  };

  useEffect(() => {
    console.log('🚀 Hook useEventosAprovacaoStats inicializado');
    fetchStats();
  }, []);

  return {
    stats,
    eventosPendentes,
    loading,
    error,
    refetch: fetchStats
  };
};
