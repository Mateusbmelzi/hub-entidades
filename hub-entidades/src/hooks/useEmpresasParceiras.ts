import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { EmpresaParceira, CreateEmpresaParceiraData, UpdateEmpresaParceiraData } from '@/types/empresa-parceira';

export const useEmpresasParceiras = () => {
  const [empresas, setEmpresas] = useState<EmpresaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('empresas_parceiras')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setEmpresas(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar empresas parceiras';
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

  const createEmpresa = async (empresaData: CreateEmpresaParceiraData): Promise<EmpresaParceira | null> => {
    try {
      console.log('🚀 Iniciando criação de empresa:', empresaData);
      setError(null);

      const { data, error: createError } = await supabase
        .from('empresas_parceiras')
        .insert([empresaData])
        .select()
        .single();

      console.log('📤 Resposta da API:', { data, error: createError });

      if (createError) {
        console.error('❌ Erro na API:', createError);
        throw createError;
      }

      if (data) {
        console.log('✅ Empresa criada com sucesso:', data);
        setEmpresas(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
        toast({
          title: 'Sucesso',
          description: 'Empresa parceira criada com sucesso!',
        });
        return data;
      }

      console.warn('⚠️ Nenhum dado retornado da API');
      return null;
    } catch (err) {
      console.error('💥 Erro geral na criação:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa parceira';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEmpresa = async (id: number, empresaData: UpdateEmpresaParceiraData): Promise<EmpresaParceira | null> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('empresas_parceiras')
        .update(empresaData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setEmpresas(prev => 
          prev.map(empresa => 
            empresa.id === id ? data : empresa
          ).sort((a, b) => a.nome.localeCompare(b.nome))
        );
        toast({
          title: 'Sucesso',
          description: 'Empresa parceira atualizada com sucesso!',
        });
        return data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar empresa parceira';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteEmpresa = async (id: number): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('empresas_parceiras')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setEmpresas(prev => prev.filter(empresa => empresa.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira removida com sucesso!',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover empresa parceira';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return {
    empresas,
    loading,
    error,
    refetch: fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  };
};
