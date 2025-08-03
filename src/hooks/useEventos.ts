import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';

export type Evento = Tables<'eventos'> & {
  entidades?: {
    id: number;
    nome: string;
  };
};

interface UseEventosOptions {
  pageSize?: number;
  enablePagination?: boolean;
  statusAprovacao?: 'pendente' | 'aprovado' | 'rejeitado';
  entidadeId?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

// Cache global para eventos
const eventosCache = new Map<string, {
  data: Evento[];
  timestamp: number;
  page: number;
}>();

export const useEventos = (options: UseEventosOptions = {}) => {
  const { 
    pageSize = 8, 
    enablePagination = true, 
    statusAprovacao = 'aprovado',
    entidadeId,
    enableCache = true,
    cacheTimeout = 3 * 60 * 1000 // 3 minutos (eventos mudam mais frequentemente)
  } = options;
  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Refs para evitar re-renders desnecessários
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Função para gerar chave do cache
  const getCacheKey = useCallback((page: number) => {
    return `eventos_page_${page}_size_${pageSize}_status_${statusAprovacao}_entidade_${entidadeId || 'all'}`;
  }, [pageSize, statusAprovacao, entidadeId]);

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((cacheKey: string) => {
    if (!enableCache) return false;
    
    const cached = eventosCache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < cacheTimeout;
  }, [enableCache, cacheTimeout]);

  // Função para limpar cache antigo
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of eventosCache.entries()) {
      if ((now - value.timestamp) > cacheTimeout) {
        eventosCache.delete(key);
      }
    }
  }, [cacheTimeout]);

  const fetchEventos = useCallback(async (page = 0, append = false) => {
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
        const cached = eventosCache.get(cacheKey);
        if (cached) {
          console.log(`📦 Usando cache para eventos página ${page}`);
          if (append) {
            setEventos(prev => [...prev, ...cached.data]);
          } else {
            setEventos(cached.data);
          }
          setHasMore(cached.data.length === pageSize);
          setCurrentPage(page);
          return;
        }
      }
      
      console.log(`🔄 Buscando eventos página ${page}...`);
      
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome)
        `)
        .eq('status_aprovacao', statusAprovacao)
        .order('data_evento', { ascending: true })
        .range(from, to);
      
      // Filtrar por entidade se especificado
      if (entidadeId) {
        query = query.eq('entidade_id', entidadeId);
      }
      
      const { data, error } = await supabaseWithRetry<Evento[]>(
        () => query,
        { maxRetries: 2, delay: 500 }
      );

      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (error) throw error;

      console.log(`📥 Eventos recebidos página ${page}:`, data?.length || 0);
      
      // Salvar no cache
      if (enableCache && data) {
        eventosCache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
          page: page
        });
      }
      
      if (append) {
        setEventos(prev => [...prev, ...(data || [])]);
      } else {
        setEventos(data || []);
      }
      
      // Verificar se há mais dados
      setHasMore((data?.length || 0) === pageSize);
      setCurrentPage(page);
      
    } catch (err) {
      // Não mostrar erro se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('❌ Erro ao carregar eventos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [pageSize, statusAprovacao, entidadeId, enableCache, getCacheKey, isCacheValid]);

  const loadMore = useCallback(() => {
    if (!enablePagination || isLoadingMore || !hasMore) return;
    fetchEventos(currentPage + 1, true);
  }, [enablePagination, isLoadingMore, hasMore, currentPage, fetchEventos]);

  const refresh = useCallback(() => {
    // Limpar cache ao fazer refresh
    if (enableCache) {
      cleanupCache();
    }
    setCurrentPage(0);
    setHasMore(true);
    fetchEventos(0, false);
  }, [fetchEventos, enableCache, cleanupCache]);

  // Limpar cache periodicamente
  useEffect(() => {
    if (!enableCache) return;
    
    const interval = setInterval(cleanupCache, cacheTimeout);
    return () => clearInterval(interval);
  }, [enableCache, cleanupCache, cacheTimeout]);

  useEffect(() => {
    fetchEventos(0, false);
    
    // Cleanup ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEventos]);

  return { 
    eventos, 
    loading, 
    error, 
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
    currentPage
  };
}; 