import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCheckProcessoSeletivo = (entidadeId: number | undefined) => {
  const [hasInscricaoProcesso, setHasInscricaoProcesso] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkProcessoSeletivo = useCallback(async () => {
    if (!entidadeId || !user?.id) {
      setHasInscricaoProcesso(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Verificando inscrição no processo seletivo para entidade:', entidadeId, 'e usuário:', user.email);
      const { data, error: queryError } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('id')
        .eq('entidade_id', entidadeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected when user hasn't applied
        setError(queryError.message);
        setHasInscricaoProcesso(false);
      } else {
        setHasInscricaoProcesso(!!data);
      }
    } catch (err) {
      console.error('Error checking processo seletivo:', err);
      setError('Erro ao verificar inscrição no processo seletivo');
      setHasInscricaoProcesso(false);
    } finally {
      setLoading(false);
    }
  }, [entidadeId, user?.id, user?.email]);

  useEffect(() => {
    checkProcessoSeletivo();
  }, [checkProcessoSeletivo]);

  // Função para forçar refresh do estado
  const refresh = useCallback(() => {
    checkProcessoSeletivo();
  }, [checkProcessoSeletivo]);

  return { hasInscricaoProcesso, loading, error, refresh };
};
