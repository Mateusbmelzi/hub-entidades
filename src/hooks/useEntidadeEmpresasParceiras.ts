import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmpresaParceira, EntidadeEmpresaParceira } from '@/types/empresa-parceira';

export const useEntidadeEmpresasParceiras = (entidadeId: number) => {
  const [empresasAssociadas, setEmpresasAssociadas] = useState<EmpresaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmpresasAssociadas = async () => {
    if (!entidadeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('entidade_empresa_parceira')
        .select(`
          *,
          empresas_parceiras (*)
        `)
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const empresas = data?.map(item => item.empresas_parceiras).filter(Boolean) as EmpresaParceira[] || [];
      setEmpresasAssociadas(empresas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar empresas parceiras da entidade';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const associarEmpresa = async (empresaId: number): Promise<boolean> => {
    try {
      setError(null);

      const { error: associateError } = await supabase
        .from('entidade_empresa_parceira')
        .insert([{
          entidade_id: entidadeId,
          empresa_parceira_id: empresaId,
        }]);

      if (associateError) {
        throw associateError;
      }

      // Buscar a empresa associada para adicionar à lista
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas_parceiras')
        .select('*')
        .eq('id', empresaId)
        .single();

      if (empresaError) {
        throw empresaError;
      }

      if (empresaData) {
        setEmpresasAssociadas(prev => [...prev, empresaData]);
        toast({
          title: 'Sucesso',
          description: 'Empresa parceira associada com sucesso!',
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao associar empresa parceira';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const desassociarEmpresa = async (empresaId: number): Promise<boolean> => {
    try {
      setError(null);

      const { error: disassociateError } = await supabase
        .from('entidade_empresa_parceira')
        .delete()
        .eq('entidade_id', entidadeId)
        .eq('empresa_parceira_id', empresaId);

      if (disassociateError) {
        throw disassociateError;
      }

      setEmpresasAssociadas(prev => prev.filter(empresa => empresa.id !== empresaId));
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira desassociada com sucesso!',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desassociar empresa parceira';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const isEmpresaAssociada = (empresaId: number): boolean => {
    return empresasAssociadas.some(empresa => empresa.id === empresaId);
  };

  useEffect(() => {
    if (entidadeId) {
      fetchEmpresasAssociadas();
    }
  }, [entidadeId]);

  return {
    empresasAssociadas,
    loading,
    error,
    refetch: fetchEmpresasAssociadas,
    associarEmpresa,
    desassociarEmpresa,
    isEmpresaAssociada,
  };
};
