import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCheckInterestDemonstration = (entidadeId: number | undefined) => {
  const [hasDemonstratedInterest, setHasDemonstratedInterest] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const { user } = useAuth();

  const checkInterestDemonstration = useCallback(async () => {
    if (!entidadeId || !user?.email) {
      setHasDemonstratedInterest(false);
      setLoading(false);
      return;
    }

    // Criar uma chave única para esta verificação
    const checkKey = `${entidadeId}-${user.email}`;
    
    // Evitar verificações duplicadas
    if (lastChecked === checkKey && hasDemonstratedInterest !== null) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Verificando interesse para entidade:', entidadeId, 'e usuário:', user.email);
      const { data, error: queryError } = await supabase
        .from('demonstracoes_interesse')
        .select('id')
        .eq('entidade_id', entidadeId)
        .eq('email_estudante', user.email)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected when user hasn't demonstrated interest
        setError(queryError.message);
        setHasDemonstratedInterest(false);
      } else {
        setHasDemonstratedInterest(!!data);
      }
      
      setLastChecked(checkKey);
    } catch (err) {
      console.error('Error checking interest demonstration:', err);
      setError('Erro ao verificar demonstração de interesse');
      setHasDemonstratedInterest(false);
    } finally {
      setLoading(false);
    }
  }, [entidadeId, user?.email, lastChecked, hasDemonstratedInterest]);

  useEffect(() => {
    checkInterestDemonstration();
  }, [checkInterestDemonstration]);

  return {
    hasDemonstratedInterest,
    loading,
    error
  };
}; 