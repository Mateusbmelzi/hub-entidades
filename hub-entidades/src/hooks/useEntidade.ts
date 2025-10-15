import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';

export type Entidade = Tables<'entidades'>;

export const useEntidade = (id: string | undefined, onUpdate?: () => void) => {
  const [entidade, setEntidade] = useState<Entidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchEntidade = useCallback(async (forceRefresh = false) => {
    if (!id) {
      setError('ID da entidade não fornecido');
      setLoading(false);
      return;
    }

    // Evitar fetch duplicado para o mesmo ID, a menos que seja forçado
    const now = Date.now();
    if (!forceRefresh && lastFetchedId === id && entidade && (now - lastFetchTime) < 5000) {
      setLoading(false);
      return;
    }

    const entidadeId = parseInt(id);
    if (isNaN(entidadeId)) {
      setError('ID da entidade inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Buscando dados da entidade ID:', entidadeId, forceRefresh ? '(forçado)' : '');
      
      const { data, error } = await supabaseWithRetry<Entidade>(
        async () => {
          const result = await supabase
            .from('entidades')
            .select('*')
            .eq('id', entidadeId)
            .maybeSingle();
          return result;
        },
        { maxRetries: 3, delay: 1000 }
      );

      if (error) {
        throw error;
      }

      console.log('📥 Dados da entidade recebidos:', data);
      setEntidade(data);
      setLastFetchedId(id);
      setLastFetchTime(now);
      
      // Notificar sobre a atualização se for um refresh forçado
      if (forceRefresh && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('❌ Erro ao carregar entidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar entidade');
    } finally {
      setLoading(false);
    }
  }, [id, lastFetchedId, entidade, lastFetchTime, onUpdate]);

  useEffect(() => {
    fetchEntidade();
  }, [fetchEntidade]);

  // Função para forçar refresh dos dados
  const refetch = useCallback(() => {
    console.log('🔄 Refetch forçado solicitado');
    fetchEntidade(true);
  }, [fetchEntidade]);

  return { entidade, loading, error, refetch };
};

// Hook para buscar áreas de interesse de uma entidade
export const useAreasInteresse = (entidadeId: number | undefined) => {
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAreas = async () => {
    if (!entidadeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Por enquanto, usar áreas padrão até a função RPC estar disponível
      // TODO: Implementar busca no banco quando a função RPC estiver pronta
      const areasPadrao = [
        'consultoria e negócios',
        'tecnologia',
        'finanças',
        'direito',
        'educação',
        'cultura',
        'entretenimento',
        'marketing',
        'recursos humanos',
        'sustentabilidade',
        'inovação',
        'empreendedorismo'
      ];

      setAreas(areasPadrao);
      
      // TODO: Descomentar quando a função RPC estiver disponível
      /*
      const { data, error } = await supabase
        .rpc('buscar_areas_interesse_entidade', {
          p_entidade_id: entidadeId
        });

      if (error) {
        console.error('Erro ao buscar áreas de interesse:', error);
        setAreas(areasPadrao);
      } else {
        setAreas(Array.isArray(data) ? data : areasPadrao);
      }
      */
    } catch (err) {
      console.error('Erro ao carregar áreas de interesse:', err);
      // Em caso de erro, usar áreas padrão
      setAreas([
        'consultoria e negócios',
        'tecnologia',
        'finanças',
        'direito',
        'educação',
        'cultura',
        'entretenimento'
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [entidadeId]);

  return { areas, loading };
};