import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Permissao } from '@/types/membro-entidade';

interface UsePermissoesUsuarioOptions {
  entidadeId?: number;
  enabled?: boolean;
}

export function usePermissoesUsuario(options: UsePermissoesUsuarioOptions = {}) {
  const { entidadeId, enabled = true } = options;
  const { user } = useAuth();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissoes = useCallback(async () => {
    if (!user || !entidadeId || !enabled) {
      setPermissoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_user_entity_permissions', {
          _user_id: user.id,
          _entidade_id: entidadeId,
        });

      if (rpcError) throw rpcError;

      setPermissoes(data?.map((item: { permissao: Permissao }) => item.permissao) || []);
    } catch (err) {
      console.error('Erro ao buscar permissões:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar permissões');
      setPermissoes([]);
    } finally {
      setLoading(false);
    }
  }, [user, entidadeId, enabled]);

  useEffect(() => {
    fetchPermissoes();
  }, [fetchPermissoes]);

  const hasPermission = useCallback(
    (permissao: Permissao): boolean => {
      return permissoes.includes(permissao);
    },
    [permissoes]
  );

  const hasAnyPermission = useCallback(
    (permissoesRequeridas: Permissao[]): boolean => {
      return permissoesRequeridas.some((p) => permissoes.includes(p));
    },
    [permissoes]
  );

  const hasAllPermissions = useCallback(
    (permissoesRequeridas: Permissao[]): boolean => {
      return permissoesRequeridas.every((p) => permissoes.includes(p));
    },
    [permissoes]
  );

  // Verifica se o usuário é membro ativo da entidade
  const isMembroAtivo = useCallback(async (): Promise<boolean> => {
    if (!user || !entidadeId) return false;

    try {
      const { data, error } = await supabase
        .from('membros_entidade')
        .select('id')
        .eq('user_id', user.id)
        .eq('entidade_id', entidadeId)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Erro ao verificar membro ativo:', err);
      return false;
    }
  }, [user, entidadeId]);

  // Verifica uma permissão específica (faz chamada RPC)
  const checkPermission = useCallback(
    async (permissao: Permissao): Promise<boolean> => {
      if (!user || !entidadeId) return false;

      try {
        const { data, error } = await supabase.rpc('check_entity_permission', {
          _user_id: user.id,
          _entidade_id: entidadeId,
          _permissao: permissao,
        });

        if (error) throw error;
        return data === true;
      } catch (err) {
        console.error('Erro ao verificar permissão:', err);
        return false;
      }
    },
    [user, entidadeId]
  );

  return {
    permissoes,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isMembroAtivo,
    checkPermission,
    refetch: fetchPermissoes,
  };
}

// Hook simplificado para verificar uma única permissão
export function useHasPermission(
  entidadeId: number | undefined,
  permissao: Permissao
): { hasPermission: boolean; loading: boolean } {
  const { hasPermission, loading } = usePermissoesUsuario({
    entidadeId,
    enabled: !!entidadeId,
  });

  return {
    hasPermission: hasPermission(permissao),
    loading,
  };
}

