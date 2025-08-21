import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoPendente {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data_evento: string;
  capacidade?: number;
  status: string;
  entidade_id: number;
  created_at: string;
  entidade_nome?: string;
}

export const useEventosPendentes = () => {
  const [eventos, setEventos] = useState<EventoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0
  });

  const fetchEventosPendentes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar eventos pendentes com JOIN para obter o nome da entidade
      const { data: pendentes, error: errorPendentes } = await supabase
        .from('eventos')
        .select(`
          id, nome, descricao, local, data_evento, capacidade, status, entidade_id, created_at,
          entidades(nome)
        `)
        .eq('status_aprovacao', 'pendente')
        .order('created_at', { ascending: false })
        .limit(5); // Limitar a 5 para o dashboard

      if (errorPendentes) {
        throw errorPendentes;
      }

      // Buscar contadores de todos os status
      const { data: countsData, error: errorCounts } = await supabase
        .from('eventos')
        .select('status_aprovacao');

      if (errorCounts) {
        throw errorCounts;
      }

      // Calcular contadores
      const counts = {
        pendentes: countsData?.filter(e => e.status_aprovacao === 'pendente').length || 0,
        aprovados: countsData?.filter(e => e.status_aprovacao === 'aprovado').length || 0,
        rejeitados: countsData?.filter(e => e.status_aprovacao === 'rejeitado').length || 0
      };

      // Transformar os dados para incluir o nome da entidade
      const eventosComEntidade = (pendentes || []).map((item: any) => ({
        ...item,
        entidade_nome: item.entidades?.nome || 'Entidade não encontrada'
      }));

      setEventos(eventosComEntidade);
      setCounts(counts);
    } catch (err: any) {
      console.error('Error fetching eventos pendentes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosPendentes();
  }, []);

  return { 
    eventos, 
    loading, 
    error, 
    counts,
    refetch: fetchEventosPendentes 
  };
};
