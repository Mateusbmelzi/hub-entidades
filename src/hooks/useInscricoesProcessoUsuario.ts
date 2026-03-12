import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { InscricaoProcessoSeletivo } from '@/types/processo-seletivo';

export interface InscricaoProcessoUsuario extends InscricaoProcessoSeletivo {
  entidade_nome: string;
  fase_atual?: {
    id: string;
    nome: string;
    ordem: number;
    status: 'pendente' | 'em_avaliacao' | 'aprovado' | 'reprovado';
  };
}

export function useInscricoesProcessoUsuario() {
  const [inscricoes, setInscricoes] = useState<InscricaoProcessoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInscricoes = useCallback(async () => {
    console.log('🔍 useInscricoesProcessoUsuario - fetchInscricoes chamado', { user: user?.id, email: user?.email });
    
    if (!user?.id) {
      console.log('⚠️ Usuário não autenticado, retornando array vazio');
      setInscricoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando inscrições do processo seletivo para usuário:', user.id);

      // Buscar inscrições do processo seletivo
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da consulta inscricoes_processo_seletivo:', { 
        inscricoesData, 
        inscricoesError,
        count: inscricoesData?.length || 0,
        user_id: user.id
      });

      // Teste: buscar todas as inscrições para debug
      const { data: todasInscricoes, error: todasError } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('*')
        .limit(5);
      
      console.log('🔍 Debug - Todas as inscrições (primeiras 5):', { todasInscricoes, todasError });

      // Buscar dados das entidades separadamente
      let entidadesData: any[] = [];
      if (inscricoesData && inscricoesData.length > 0) {
        const entidadeIds = [...new Set(inscricoesData.map((i: any) => i.entidade_id))];
        const { data: entidades, error: entidadesError } = await supabase
          .from('entidades')
          .select('id, nome')
          .in('id', entidadeIds);

        if (entidadesError) {
          console.warn('⚠️ Erro ao buscar entidades:', entidadesError);
        } else {
          entidadesData = entidades || [];
        }
      }

      if (inscricoesError) {
        console.error('❌ Erro ao buscar inscrições:', inscricoesError);
        throw inscricoesError;
      }

      // Buscar fases ativas para cada entidade
      const entidadeIds = [...new Set((inscricoesData || []).map((i: any) => i.entidade_id))];
      let fasesData: any[] = [];

      if (entidadeIds.length > 0) {
        const { data: fases, error: fasesError } = await supabase
          .from('processos_seletivos_fases')
          .select('*')
          .in('entidade_id', entidadeIds)
          .eq('ativa', true)
          .order('ordem', { ascending: true });

        if (fasesError) {
          console.warn('⚠️ Erro ao buscar fases:', fasesError);
        } else {
          fasesData = fases || [];
        }
      }

      // Buscar inscrições nas fases para cada inscrição
      const inscricaoIds = (inscricoesData || []).map((i: any) => i.id);
      let inscricoesFasesData: any[] = [];

      if (inscricaoIds.length > 0) {
        const { data: inscricoesFases, error: inscricoesFasesError } = await supabase
          .from('inscricoes_fases_ps')
          .select(`
            *,
            fase:processos_seletivos_fases(*)
          `)
          .in('inscricao_id', inscricaoIds)
          .order('created_at', { ascending: false });

        if (inscricoesFasesError) {
          console.warn('⚠️ Erro ao buscar inscrições das fases:', inscricoesFasesError);
        } else {
          inscricoesFasesData = inscricoesFases || [];
        }
      }

      // Criar mapa de entidades para lookup rápido
      const entidadesMap = new Map(entidadesData.map(entidade => [entidade.id, entidade]));

      // Processar os dados
      const inscricoesProcessadas: InscricaoProcessoUsuario[] = (inscricoesData || []).map((inscricao: any) => {
        // Encontrar a fase atual (mais recente)
        const inscricaoFaseAtual = inscricoesFasesData
          .filter((ifp: any) => ifp.inscricao_id === inscricao.id)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        const entidade = entidadesMap.get(inscricao.entidade_id);

        return {
          ...inscricao,
          entidade_nome: entidade?.nome || 'Entidade não encontrada',
          fase_atual: inscricaoFaseAtual ? {
            id: inscricaoFaseAtual.fase.id,
            nome: inscricaoFaseAtual.fase.nome,
            ordem: inscricaoFaseAtual.fase.ordem,
            status: inscricaoFaseAtual.status
          } : undefined
        };
      });

      console.log(`✅ Encontradas ${inscricoesProcessadas.length} inscrições do processo seletivo`);
      setInscricoes(inscricoesProcessadas);
    } catch (err) {
      console.error('❌ Erro ao buscar inscrições do processo seletivo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar inscrições');
      setInscricoes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInscricoes();
  }, [fetchInscricoes]);

  const cancelarInscricao = useCallback(async (inscricaoId: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Verificar se a inscrição existe, pertence ao usuário e está pendente
      const inscricao = inscricoes.find(i => i.id === inscricaoId);
      if (!inscricao) {
        throw new Error('Inscrição não encontrada');
      }

      if (inscricao.status !== 'pendente') {
        throw new Error('Só é possível cancelar inscrições com status pendente');
      }

      // Buscar inscrições de fases associadas
      const { data: inscricoesFases, error: fasesError } = await supabase
        .from('inscricoes_fases_ps')
        .select('id')
        .eq('inscricao_id', inscricaoId);

      if (fasesError) {
        throw fasesError;
      }

      const inscricaoFaseIds = (inscricoesFases || []).map((f: { id: string }) => f.id);

      // Remover vínculos de candidatos com reservas, se existirem
      if (inscricaoFaseIds.length > 0) {
        const { error: candidatosReservasError } = await supabase
          .from('candidatos_reservas')
          .delete()
          .in('inscricao_fase_id', inscricaoFaseIds);

        if (candidatosReservasError) {
          throw candidatosReservasError;
        }

        const { error: fasesDeleteError } = await supabase
          .from('inscricoes_fases_ps')
          .delete()
          .eq('inscricao_id', inscricaoId);

        if (fasesDeleteError) {
          throw fasesDeleteError;
        }
      }

      // Deletar inscrição principal
      const { error } = await supabase
        .from('inscricoes_processo_seletivo')
        .delete()
        .eq('id', inscricaoId)
        .eq('user_id', user.id); // Dupla verificação de segurança

      if (error) throw error;

      // Atualizar lista local
      setInscricoes(prev => prev.filter(i => i.id !== inscricaoId));

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao cancelar inscrição' 
      };
    }
  }, [user?.id, inscricoes]);

  return {
    inscricoes: inscricoes || [],
    loading,
    error,
    refetch: fetchInscricoes,
    cancelarInscricao
  };
}
