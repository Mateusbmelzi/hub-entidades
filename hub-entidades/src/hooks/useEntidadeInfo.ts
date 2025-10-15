import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEntityAuth } from './useEntityAuth';

interface EntidadeInfo {
  id: number;
  nome: string;
  descricao_curta: string;
  descricao_detalhada: string;
  area_atuacao: string;
  email_contato: string;
  contato: string;
  site_url: string;
  instagram_url: string;
  linkedin_url: string;
  username: string;
  last_login: string | null;
}

export const useEntidadeInfo = () => {
  const { entidadeId, isAuthenticated } = useEntityAuth();
  const [entidadeInfo, setEntidadeInfo] = useState<EntidadeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntidadeInfo = async () => {
    if (!entidadeId || !isAuthenticated) {
      setEntidadeInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_authenticated_entity_info', {
        _entidade_id: entidadeId
      });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setEntidadeInfo(data[0]);
      } else {
        setEntidadeInfo(null);
        setError('Informações da entidade não encontradas');
      }
    } catch (err) {
      console.error('Erro ao buscar informações da entidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar informações da entidade');
      setEntidadeInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const updateEntidadeInfo = async (updates: Partial<EntidadeInfo>) => {
    if (!entidadeId) {
      throw new Error('Entidade não autenticada');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('entidades')
        .update(updates)
        .eq('id', entidadeId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        // Atualizar informações locais
        setEntidadeInfo(prev => prev ? { ...prev, ...data } : null);
      }

      return data;
    } catch (err) {
      console.error('Erro ao atualizar informações da entidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar informações da entidade');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!entidadeId) {
      throw new Error('Entidade não autenticada');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase.rpc('update_entity_password', {
        _entidade_id: entidadeId,
        _current_password: currentPassword,
        _new_password: newPassword
      });

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        const result = data[0];
        if (!result.success) {
          throw new Error(result.message);
        }
        return result;
      }

      throw new Error('Erro desconhecido ao atualizar senha');
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar informações quando a entidade for autenticada
  useEffect(() => {
    if (isAuthenticated && entidadeId) {
      fetchEntidadeInfo();
    } else {
      setEntidadeInfo(null);
      setError(null);
    }
  }, [isAuthenticated, entidadeId]);

  return {
    entidadeInfo,
    loading,
    error,
    fetchEntidadeInfo,
    updateEntidadeInfo,
    updatePassword,
    refresh: fetchEntidadeInfo
  };
}; 