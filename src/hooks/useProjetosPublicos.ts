import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ProjetoPublico = Tables<'projetos'> & {
  entidades?: {
    id: number;
    nome: string;
    foto_perfil_url?: string | null;
    area_atuacao?: string[] | null;
  };
};

interface UseProjetosPublicosOptions {
  entidadeId?: number;
  pageSize?: number;
  enablePagination?: boolean;
}

export const useProjetosPublicos = (options: UseProjetosPublicosOptions = {}) => {
  const { 
    entidadeId,
    pageSize = 10000,
    enablePagination = false
  } = options;
  
  const [projetos, setProjetos] = useState<ProjetoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProjetos = useCallback(async (page = 0, append = false) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const from = page * pageSize;
      const to = enablePagination ? from + pageSize - 1 : 999999;

      let query = supabase
        .from('projetos')
        .select(`
          *,
          entidades(id, nome, foto_perfil_url, area_atuacao)
        `)
        .eq('visivel', true) // Apenas projetos visíveis
        .order('created_at', { ascending: false });
      
      // Filtrar por entidade se especificado
      if (entidadeId) {
        query = query.eq('entidade_id', entidadeId);
      }
      
      if (enablePagination) {
        query = query.range(from, to);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (append) {
        setProjetos(prev => [...prev, ...(data || [])]);
      } else {
        setProjetos(data || []);
      }

      setHasMore(enablePagination ? (data?.length || 0) === pageSize : false);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar projetos';
      setError(errorMessage);
      console.error('Erro ao buscar projetos públicos:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [entidadeId, pageSize, enablePagination]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && enablePagination) {
      fetchProjetos(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, enablePagination, fetchProjetos]);

  useEffect(() => {
    fetchProjetos(0, false);
  }, [fetchProjetos]);

  return {
    projetos,
    loading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch: () => fetchProjetos(0, false)
  };
};

