import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmpresaParceira } from '@/types/empresa-parceira';

export const useProjetoEmpresasParceiras = (projetoId: number | string | undefined) => {
  const [empresasAssociadas, setEmpresasAssociadas] = useState<EmpresaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmpresasAssociadas = async () => {
    if (!projetoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar os registros de associação
      const { data: associacoes, error: fetchError } = await supabase
        .from('projeto_empresa_parceira')
        .select('empresa_parceira_id')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar empresas parceiras:', fetchError);
        
        // Tratamento específico para diferentes tipos de erro
        if (fetchError.code === 'PGRST116' || fetchError.code === '42501') {
          // Erro de permissão ou formato de ID inválido
          const errorMessage = 'Sem permissão para acessar empresas parceiras ou formato de ID inválido';
          setError(errorMessage);
          toast({
            title: 'Erro de Permissão',
            description: 'Não foi possível carregar as empresas parceiras. Verifique as permissões.',
            variant: 'destructive',
          });
          setEmpresasAssociadas([]);
          return;
        }
        
        // Erro PGRST200: relationship not found (tabela pode não ter foreign key configurada)
        // Erro PGRST202: tabela não existe
        if (fetchError.code === 'PGRST200' || fetchError.code === 'PGRST202' || 
            fetchError.message?.includes('relationship') || 
            fetchError.message?.includes('does not exist')) {
          console.warn('Tabela projeto_empresa_parceira pode não existir ou não ter foreign key configurada');
          setEmpresasAssociadas([]);
          return;
        }
        
        // Para outros erros, lançar normalmente
        throw fetchError;
      }

      // Se não há associações, retornar array vazio
      if (!associacoes || associacoes.length === 0) {
        setEmpresasAssociadas([]);
        return;
      }

      // Extrair os IDs das empresas
      const empresaIds = associacoes
        .map(assoc => assoc.empresa_parceira_id)
        .filter(Boolean);

      if (empresaIds.length === 0) {
        setEmpresasAssociadas([]);
        return;
      }

      // Buscar as empresas separadamente
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas_parceiras')
        .select('*')
        .in('id', empresaIds);

      if (empresasError) {
        console.error('Erro ao buscar dados das empresas:', empresasError);
        throw empresasError;
      }

      // Ordenar as empresas na mesma ordem das associações
      const empresasOrdenadas = empresaIds
        .map(id => empresasData?.find(emp => emp.id === id))
        .filter(Boolean) as EmpresaParceira[];

      setEmpresasAssociadas(empresasOrdenadas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar empresas parceiras do projeto';
      setError(errorMessage);
      
      // Não mostrar toast para erros já tratados acima
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as any).code;
        if (errorCode === 'PGRST116' || errorCode === '42501' || 
            errorCode === 'PGRST200' || errorCode === 'PGRST202') {
          return; // Já foi tratado acima
        }
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      setEmpresasAssociadas([]);
    } finally {
      setLoading(false);
    }
  };

  const associarEmpresa = async (empresaId: number): Promise<boolean> => {
    if (!projetoId) return false;

    try {
      setError(null);

      const { error: associateError } = await supabase
        .from('projeto_empresa_parceira')
        .insert([{
          projeto_id: projetoId,
          empresa_parceira_id: empresaId,
        }]);

      if (associateError) {
        throw associateError;
      }

      // Recarregar a lista de empresas associadas
      await fetchEmpresasAssociadas();
      
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira associada ao projeto com sucesso!',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao associar empresa parceira ao projeto';
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
    if (!projetoId) return false;

    try {
      setError(null);

      const { error: disassociateError } = await supabase
        .from('projeto_empresa_parceira')
        .delete()
        .eq('projeto_id', projetoId)
        .eq('empresa_parceira_id', empresaId);

      if (disassociateError) {
        throw disassociateError;
      }

      // Recarregar a lista de empresas associadas
      await fetchEmpresasAssociadas();
      
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira desassociada do projeto com sucesso!',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desassociar empresa parceira do projeto';
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
    if (projetoId) {
      fetchEmpresasAssociadas();
    }
  }, [projetoId]);

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

