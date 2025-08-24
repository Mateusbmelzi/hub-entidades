import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoPorOrganizacao {
  entidade_id: number;
  entidade_nome: string;
  total_eventos: number;
}

export const useEventosPorOrganizacao = () => {
  const [eventosPorOrganizacao, setEventosPorOrganizacao] = useState<EventoPorOrganizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventosPorOrganizacao = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Buscando eventos por organização...');

      // Buscar eventos com JOIN para entidades
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          entidade_id,
          status_aprovacao,
          entidades!inner(
            id,
            nome
          )
        `)
        .eq('status_aprovacao', 'aprovado'); // Apenas eventos aprovados

      if (eventosError) {
        console.error('❌ Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('✅ Eventos com entidades carregados:', eventosData?.length || 0, 'eventos encontrados');

      // Processar os dados para contar eventos por organização
      const organizacaoCount: { [key: number]: { nome: string; total: number } } = {};
      
      eventosData?.forEach(evento => {
        if (evento.entidade_id && evento.entidades) {
          const entidadeId = evento.entidade_id;
          const entidadeNome = evento.entidades.nome;
          
          if (!organizacaoCount[entidadeId]) {
            organizacaoCount[entidadeId] = {
              nome: entidadeNome,
              total: 0
            };
          }
          organizacaoCount[entidadeId].total += 1;
        }
      });

      // Converter para array e ordenar por total
      const eventosPorOrganizacaoArray = Object.entries(organizacaoCount)
        .map(([entidadeId, data]) => ({
          entidade_id: parseInt(entidadeId),
          entidade_nome: data.nome,
          total_eventos: data.total
        }))
        .sort((a, b) => b.total_eventos - a.total_eventos)
        .slice(0, 5); // Top 5 organizações

      setEventosPorOrganizacao(eventosPorOrganizacaoArray);
      console.log('📊 Top 5 organizações por eventos processadas:', eventosPorOrganizacaoArray);

    } catch (err) {
      console.error('❌ Erro ao buscar eventos por organização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosPorOrganizacao();
  }, []);

  const refetch = () => {
    fetchEventosPorOrganizacao();
  };

  return {
    eventosPorOrganizacao,
    loading,
    error,
    refetch
  };
};
