import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { EmpresaParceira, CreateEmpresaParceiraData, UpdateEmpresaParceiraData } from '../types/empresa-parceira';

export function useEmpresasParceiras(entidadeId?: number) {
  const [empresas, setEmpresas] = useState<EmpresaParceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('empresas_parceiras')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (entidadeId) {
        query = query.eq('entidade_id', entidadeId);
      }

      const { data, error: fetchError } = await query;

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

  const createEmpresa = async (empresaData: CreateEmpresaParceiraData) => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('empresas_parceiras')
        .insert([empresaData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setEmpresas(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa parceira';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEmpresa = async (id: number, empresaData: UpdateEmpresaParceiraData) => {
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

      setEmpresas(prev => 
        prev.map(empresa => empresa.id === id ? data : empresa)
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar empresa parceira';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEmpresa = async (id: number) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('empresas_parceiras')
        .update({ ativo: false })
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setEmpresas(prev => prev.filter(empresa => empresa.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir empresa parceira';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getEmpresasByArea = async (area: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('empresas_parceiras')
        .select('*')
        .contains('area_atuacao', [area])
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar empresas por área';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [entidadeId]);

  return {
    empresas,
    loading,
    error,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    getEmpresasByArea,
  };
}
