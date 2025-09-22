import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Evento {
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
      
      // Query básica para testar
      console.log('🔍 Testando query básica para entidade:', entidadeId);
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('entidade_id', entidadeId);
      
      console.log('📊 Resultado da query básica:', { 
        dataCount: data?.length || 0, 
        error: error?.message || 'Nenhum erro',
        firstEvent: data?.[0]
      });
      
      // Se não for o proprietário da entidade, filtrar apenas eventos aprovados
      let filteredData = data;
      if (!isEntityOwner) {
        console.log('🔒 useEventosEntidade: filtrando apenas eventos aprovados para usuário comum');
        filteredData = data?.filter(e => e.status_aprovacao === 'aprovado') || [];
      } else {
        console.log('👑 useEventosEntidade: mostrando todos os eventos para proprietário da entidade');
      }

      if (error) {
        console.error('❌ useEventosEntidade: erro na busca:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ useEventosEntidade: eventos carregados:', filteredData?.length || 0);
      console.log('📊 Primeiro evento (exemplo):', filteredData?.[0]);
      if (!isEntityOwner) {
        console.log('📊 useEventosEntidade: eventos aprovados encontrados:', filteredData?.length || 0);
      } else {
        const aprovados = filteredData?.filter(e => e.status_aprovacao === 'aprovado')?.length || 0;
        const pendentes = filteredData?.filter(e => e.status_aprovacao === 'pendente')?.length || 0;
        const rejeitados = filteredData?.filter(e => e.status_aprovacao === 'rejeitado')?.length || 0;
        console.log('📊 useEventosEntidade: status dos eventos:', { aprovados, pendentes, rejeitados });
      }
      
      setEventos(filteredData || []);
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
  }, []);

  useEffect(() => {
    if (entidadeId) {
      fetchEventos();
    }
  }, [entidadeId, isEntityOwner]);

  return { eventos, loading, error, refetch };
};