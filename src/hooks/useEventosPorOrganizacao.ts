import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isEventoPublicamenteVisivel } from '@/lib/evento-visibility';

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

      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          entidade_id,
          status_aprovacao,
          reserva_id,
          entidades!inner(id, nome),
          reservas!left(id, status_reserva)
        `)
        .eq('status_aprovacao', 'aprovado')
        .neq('status', 'cancelado');

      if (eventosError) throw eventosError;

      const normalized = (eventosData || []).map((row) => ({
        ...row,
        reservas: Array.isArray(row.reservas) ? row.reservas : row.reservas ? [row.reservas] : [],
      }));
      const visibleEventos = normalized.filter((row) => {
        try {
          return isEventoPublicamenteVisivel(row);
        } catch {
          return false;
        }
      });

      const organizacaoCount: { [key: number]: { nome: string; total: number } } = {};
      
      visibleEventos.forEach(evento => {
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

    } catch (err) {
      console.error('useEventosPorOrganizacao:', err);
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
