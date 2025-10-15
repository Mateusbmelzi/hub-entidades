import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaxaConversaoEntidade {
  nome: string;
  total_demonstracoes: number;
  total_participantes_eventos: number;
  taxa_conversao: number;
}

export const useTaxaConversaoEntidades = () => {
  const [entidades, setEntidades] = useState<TaxaConversaoEntidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxaConversao = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('taxa_conversao_entidades')
        .select('*')
        .order('taxa_conversao', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setEntidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar taxa de conversão das entidades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxaConversao();
  }, []);

  return {
    entidades,
    loading,
    error,
    refetch: fetchTaxaConversao
  };
};
