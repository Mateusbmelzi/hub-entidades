import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';

export type Entidade = Tables<'entidades'>;

interface UseEntidadesOptions {
  pageSize?: number;
  enablePagination?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number;
}

// Cache global para entidades
const entidadesCache = new Map<string, {
  data: Entidade[];
  timestamp: number;
  page: number;
}>();

// Cache para busca global
const searchCache = new Map<string, {
  data: Entidade[];
  timestamp: number;
}>();

export const useEntidades = (options: UseEntidadesOptions = {}) => {
  const { 
    pageSize = 12, 
    enablePagination = true, 
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000 // 5 minutos
  } = options;
  
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Estados para busca global
  const [searchResults, setSearchResults] = useState<Entidade[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Refs para evitar re-renders desnecessários
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Função para gerar chave do cache
  const getCacheKey = useCallback((page: number) => {
    return `entidades_page_${page}_size_${pageSize}`;
  }, [pageSize]);

  // Função para gerar chave do cache de busca
  const getSearchCacheKey = useCallback((searchTerm: string) => {
    return `search_${searchTerm.toLowerCase().trim()}`;
  }, []);

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((cacheKey: string) => {
    if (!enableCache) return false;
    
    const cached = entidadesCache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cacheTimeout;
  }, [enableCache, cacheTimeout]);

  // Função para verificar se o cache de busca é válido
  const isSearchCacheValid = useCallback((cacheKey: string) => {
    if (!enableCache) return false;
    
    const cached = searchCache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cacheTimeout;
  }, [enableCache, cacheTimeout]);

  // Função para limpar cache antigo
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of entidadesCache.entries()) {
      if ((now - value.timestamp) > cacheTimeout) {
        entidadesCache.delete(key);
      }
    }
    for (const [key, value] of searchCache.entries()) {
      if ((now - value.timestamp) > cacheTimeout) {
        searchCache.delete(key);
      }
    }
  }, [cacheTimeout]);

  // Função de busca global
  const searchEntidades = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo controller para esta requisição
    abortControllerRef.current = new AbortController();

    try {
      setIsSearching(true);
      setSearchError(null);
      
      const cacheKey = getSearchCacheKey(searchTerm);
      
      // Verificar cache primeiro
      if (isSearchCacheValid(cacheKey)) {
        const cached = searchCache.get(cacheKey);
        if (cached) {
          console.log(`📦 Usando cache para busca: "${searchTerm}"`);
          setSearchResults(cached.data);
          return;
        }
      }
      
      console.log(`🔍 Buscando entidades: "${searchTerm}"`);
      
      const searchTermLower = searchTerm.toLowerCase();
      
      const query = supabase
        .from('entidades')
        .select('*')
        .or(`nome.ilike.%${searchTermLower}%,descricao_curta.ilike.%${searchTermLower}%,area_atuacao.ilike.%${searchTermLower}%`)
        .order('nome')
        .limit(50); // Limitar resultados da busca
      
      const { data, error } = await supabaseWithRetry<Entidade[]>(
        () => query,
        { maxRetries: 2, delay: 500 }
      );

      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (error) throw error;

      console.log(`📥 Resultados da busca "${searchTerm}":`, data?.length || 0);
      
      // Salvar no cache
      if (enableCache && data) {
        searchCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }
      
      setSearchResults(data || []);
      
    } catch (err) {
      // Não mostrar erro se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('❌ Erro ao buscar entidades:', err);
      setSearchError(err instanceof Error ? err.message : 'Erro ao buscar entidades');
    } finally {
      setIsSearching(false);
    }
  }, [enableCache, getSearchCacheKey, isSearchCacheValid]);

  const fetchEntidades = useCallback(async (page = 0, append = false) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo controller para esta requisição
    abortControllerRef.current = new AbortController();
    
    // Evitar requisições duplicadas
    const now = Date.now();
    if (now - lastFetchRef.current < 100) {
      return;
    }
    lastFetchRef.current = now;

    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const cacheKey = getCacheKey(page);
      
      // Verificar cache primeiro
      if (isCacheValid(cacheKey)) {
        const cached = entidadesCache.get(cacheKey);
        if (cached) {
          console.log(`📦 Usando cache para página ${page}`);
          if (append) {
            setEntidades(prev => [...prev, ...cached.data]);
          } else {
            setEntidades(cached.data);
          }
          setHasMore(cached.data.length === pageSize);
          setCurrentPage(page);
          return;
        }
      }
      
      console.log(`🔄 Buscando entidades página ${page}...`);
      
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const query = supabase
        .from('entidades')
        .select('*')
        .order('nome')
        .range(from, to);
      
      const { data, error } = await supabaseWithRetry<Entidade[]>(
        () => query,
        { maxRetries: 2, delay: 500 }
      );

      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (error) throw error;

      console.log(`📥 Entidades recebidas página ${page}:`, data?.length || 0);
      
      // Salvar no cache
      if (enableCache && data) {
        entidadesCache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
          page: page
        });
      }
      
      if (append) {
        setEntidades(prev => [...prev, ...(data || [])]);
      } else {
        setEntidades(data || []);
      }
      
      // Verificar se há mais dados
      setHasMore((data?.length || 0) === pageSize);
      setCurrentPage(page);
      
    } catch (err) {
      // Não mostrar erro se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('❌ Erro ao carregar entidades:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar entidades');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [pageSize, enableCache, getCacheKey, isCacheValid]);

  const loadMore = useCallback(() => {
    if (!enablePagination || isLoadingMore || !hasMore) return;
    fetchEntidades(currentPage + 1, true);
  }, [enablePagination, isLoadingMore, hasMore, currentPage, fetchEntidades]);

  const refresh = useCallback(() => {
    // Limpar cache ao fazer refresh
    if (enableCache) {
      cleanupCache();
    }
    setCurrentPage(0);
    setHasMore(true);
    setSearchResults([]);
    fetchEntidades(0, false);
  }, [fetchEntidades, enableCache, cleanupCache]);

  // Limpar cache periodicamente
  useEffect(() => {
    if (!enableCache) return;
    
    const interval = setInterval(cleanupCache, cacheTimeout);
    return () => clearInterval(interval);
  }, [enableCache, cleanupCache, cacheTimeout]);

  useEffect(() => {
    fetchEntidades(0, false);
    
    // Cleanup ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEntidades]);

  return { 
    entidades, 
    loading, 
    error, 
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
    currentPage,
    // Funções de busca global
    searchEntidades,
    searchResults,
    isSearching,
    searchError
  };
};