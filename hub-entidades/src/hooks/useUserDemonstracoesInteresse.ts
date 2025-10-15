import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserDemonstracaoInteresse {
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
  entidade_nome: string;
  entidade_local_feira?: string;
  entidade_local_apresentacao?: string;
  entidade_horario_apresentacao?: string;
}

export const useUserDemonstracoesInteresse = () => {
  const [demonstracoes, setDemonstracoes] = useState<UserDemonstracaoInteresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedEmail, setLastFetchedEmail] = useState<string>('');
  const { user } = useAuth();

  const fetchUserDemonstracoes = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    // Evitar fetch duplicado para o mesmo email
    if (lastFetchedEmail === user.email && demonstracoes.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching demonstrations for email:', user.email);

      // Consulta simplificada e otimizada
      const { data, error: fetchError } = await supabase
        .from('demonstracoes_interesse')
        .select(`
          *,
          entidades(
            nome,
            local_feira,
            local_apresentacao,
            horario_apresentacao
          )
        `)
        .eq('email_estudante', user.email)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching demonstrations:', fetchError);
        throw fetchError;
      }

      // Processar os dados
      const processedData = (data || []).map((item: any) => ({
        ...item,
        entidade_nome: item.entidades?.nome || 'Entidade não encontrada',
        entidade_local_feira: item.entidades?.local_feira,
        entidade_local_apresentacao: item.entidades?.local_apresentacao,
        entidade_horario_apresentacao: item.entidades?.horario_apresentacao
      }));

      console.log(`✅ Found ${processedData.length} demonstrations for user`);

      setDemonstracoes(processedData);
      setLastFetchedEmail(user.email);
    } catch (err: any) {
      console.error('❌ Error fetching user demonstracoes:', err);
      setError(err.message || 'Erro ao buscar demonstrações de interesse');
    } finally {
      setLoading(false);
    }
  }, [user?.email, lastFetchedEmail, demonstracoes.length]);

  useEffect(() => {
    fetchUserDemonstracoes();
  }, [fetchUserDemonstracoes]);

  return {
    demonstracoes,
    loading,
    error,
    refetch: fetchUserDemonstracoes
  };
}; 