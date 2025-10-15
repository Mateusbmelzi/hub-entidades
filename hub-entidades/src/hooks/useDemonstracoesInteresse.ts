import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSystem } from './useNotificationSystem';

export interface DemonstracaoInteresse {
  id: number;
  entidade_id: number;
  nome_estudante: string;
  email_estudante: string;
  curso_estudante: string;
  semestre_estudante: number;
  area_interesse: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  created_at: string;
  updated_at: string;
  entidade_nome?: string; // Nome da entidade para exibição
}

export const useDemonstracoesInteresse = (entidadeId: number | undefined) => {
  const [demonstracoes, setDemonstracoes] = useState<DemonstracaoInteresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifyDemonstrationStatusChange } = useNotificationSystem();

  const fetchDemonstracoes = async () => {
    if (!entidadeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar demonstrações com JOIN para obter o nome da entidade
      console.log('Buscando demonstrações para entidade:', entidadeId);
      const { data, error: fetchError } = await supabase
        .from('demonstracoes_interesse')
        .select(`
          *,
          entidades(nome)
        `)
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transformar os dados para incluir o nome da entidade
      const demonstracoesComEntidade = (data || []).map((item: any) => ({
        ...item,
        entidade_nome: item.entidades?.nome || 'Entidade não encontrada'
      }));

      setDemonstracoes(demonstracoesComEntidade);
    } catch (err: any) {
      console.error('Error fetching demonstracoes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'aprovada' | 'rejeitada') => {
    try {
      // Buscar a demonstração para obter informações do aluno
      const demonstracao = demonstracoes.find(d => d.id === id);
      if (!demonstracao) {
        throw new Error('Demonstração não encontrada');
      }

      // Atualizar o status no banco
      const { error } = await supabase
        .from('demonstracoes_interesse')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Enviar notificação para o aluno
      await notifyDemonstrationStatusChange(
        demonstracao.email_estudante,
        demonstracao.entidade_nome || 'Entidade',
        status,
        demonstracao.entidade_id,
        id
      );

      // Atualizar a lista local
      setDemonstracoes(prev => 
        prev.map(d => d.id === id ? { ...d, status } : d)
      );

      console.log(`Status atualizado para ${status} e notificação enviada para ${demonstracao.email_estudante}`);

      return { success: true };
    } catch (err: any) {
      console.error('Error updating status:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchDemonstracoes();
  }, [entidadeId]);

  return {
    demonstracoes,
    loading,
    error,
    refetch: fetchDemonstracoes,
    updateStatus
  };
}; 