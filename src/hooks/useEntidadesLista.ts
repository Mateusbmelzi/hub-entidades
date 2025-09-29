import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EntidadeLista {
  id: number;
  nome: string;
}

export const useEntidadesLista = () => {
  const [entidades, setEntidades] = useState<EntidadeLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntidades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('entidades')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;
      
      setEntidades(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar lista de entidades:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar entidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntidades();
  }, []);

  return {
    entidades,
    loading,
    error,
    refetch: fetchEntidades
  };
};
