import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoCompleto {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  horario_inicio?: string | null;
  horario_termino?: string | null;
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
  entidades?: {
    id: number;
    nome: string;
    foto_perfil_url?: string | null;
  };
}

export const useTodosEventosAprovados = () => {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodosEventos = async () => {
    try {
      console.log('🔄 useTodosEventosAprovados: buscando todos os eventos aprovados');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome, foto_perfil_url)
        `)
        .eq('status_aprovacao', 'aprovado')
        .neq('status', 'cancelado')
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });
      
      if (error) {
        console.error('❌ useTodosEventosAprovados: erro na busca:', error);
        throw error;
      }
      
      console.log('✅ useTodosEventosAprovados: eventos carregados:', data?.length || 0);
      setEventos(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ useTodosEventosAprovados: erro:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    console.log('🔄 useTodosEventosAprovados: refetch solicitado');
    await fetchTodosEventos();
  }, []);

  useEffect(() => {
    fetchTodosEventos();
  }, []);

  return { eventos, loading, error, refetch };
};
