import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  horario?: string;
  capacidade?: number;
  link_evento?: string;
  status: string;
  status_aprovacao?: string;
  comentario_aprovacao?: string;
  data_aprovacao?: string;
  aprovador_email?: string;
  entidade_id: number;
  created_at: string;
  updated_at: string;
}

export const useEventosEntidade = (entidadeId?: number, isEntityOwner: boolean = false) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    if (!entidadeId) {
      console.log('⚠️ useEventosEntidade: entidadeId não fornecido');
      return;
    }
    
    try {
      console.log('🔄 useEventosEntidade: buscando eventos para entidade:', entidadeId);
      console.log('🔍 useEventosEntidade: é proprietário da entidade?', isEntityOwner);
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('eventos')
        .select('*')
        .eq('entidade_id', entidadeId);
      
      // Se não for o proprietário da entidade, filtrar apenas eventos aprovados
      if (!isEntityOwner) {
        console.log('🔒 useEventosEntidade: filtrando apenas eventos aprovados para usuário comum');
        query = query.eq('status_aprovacao', 'aprovado');
      } else {
        console.log('👑 useEventosEntidade: mostrando todos os eventos para proprietário da entidade');
      }
      
      const { data, error } = await query
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        console.error('❌ useEventosEntidade: erro na busca:', error);
        throw error;
      }
      
      console.log('✅ useEventosEntidade: eventos carregados:', data?.length || 0);
      if (!isEntityOwner) {
        console.log('📊 useEventosEntidade: eventos aprovados encontrados:', data?.length || 0);
      } else {
        const aprovados = data?.filter(e => e.status_aprovacao === 'aprovado')?.length || 0;
        const pendentes = data?.filter(e => e.status_aprovacao === 'pendente')?.length || 0;
        const rejeitados = data?.filter(e => e.status_aprovacao === 'rejeitado')?.length || 0;
        console.log('📊 useEventosEntidade: status dos eventos:', { aprovados, pendentes, rejeitados });
      }
      
      setEventos(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ useEventosEntidade: erro:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Função refetch que pode ser chamada externamente
  const refetch = useCallback(async () => {
    console.log('🔄 useEventosEntidade: refetch solicitado');
    await fetchEventos();
  }, [entidadeId, isEntityOwner]);

  useEffect(() => {
    fetchEventos();
  }, [entidadeId, isEntityOwner]);

  return { eventos, loading, error, refetch };
};