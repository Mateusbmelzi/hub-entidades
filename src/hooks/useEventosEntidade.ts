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
  entidade_id: number;
  created_at: string;
  updated_at: string;
}

export const useEventosEntidade = (entidadeId?: number) => {
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
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) {
        console.error('❌ useEventosEntidade: erro na busca:', error);
        throw error;
      }
      
      console.log('✅ useEventosEntidade: eventos carregados:', data?.length || 0);
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
  }, [entidadeId]);

  useEffect(() => {
    fetchEventos();
  }, [entidadeId]);

  return { eventos, loading, error, refetch };
};