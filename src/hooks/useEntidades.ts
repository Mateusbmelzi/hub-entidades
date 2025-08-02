import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseWithRetry } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';

export type Entidade = Tables<'entidades'>;

export const useEntidades = () => {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntidades = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Buscando lista de entidades...');
      
      const { data, error } = await supabaseWithRetry<Entidade[]>(
        () => supabase
          .from('entidades')
          .select('*')
          .order('nome'),
        { maxRetries: 3, delay: 1000 }
      );

      if (error) throw error;

      console.log('📥 Entidades recebidas:', data?.length || 0);
      setEntidades(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar entidades:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar entidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntidades();
  }, []);

  return { entidades, loading, error, refetch: fetchEntidades };
};