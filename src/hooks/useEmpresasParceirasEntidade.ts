import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { EmpresaParceira } from '../types/empresa-parceira';

export function useEmpresasParceirasEntidade(entidadeId: number) {
  const [empresas, setEmpresas] = useState<EmpresaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entidadeId) {
      setEmpresas([]);
      setLoading(false);
      return;
    }

    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('empresas_parceiras')
          .select('*')
          .eq('entidade_id', entidadeId)
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(3); // Limitar a 3 empresas para exibição no card

        if (fetchError) {
          throw fetchError;
        }

        setEmpresas(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar empresas parceiras');
        console.error('Erro ao buscar empresas parceiras:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [entidadeId]);

  return { empresas, loading, error };
}
