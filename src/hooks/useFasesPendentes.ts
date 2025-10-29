import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { InscricaoFasePS, FaseProcessoSeletivo } from '@/types/processo-seletivo';

export interface FasePendente {
  inscricaoFaseId: string;
  inscricaoId: string;
  fase: FaseProcessoSeletivo;
  entidadeNome: string;
  entidadeId: number;
  created_at: string;
}

export function useFasesPendentes() {
  const [fasesPendentes, setFasesPendentes] = useState<FasePendente[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFasesPendentes = useCallback(async () => {
    if (!user?.id) {
      setFasesPendentes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Buscar todas as inscrições do usuário no processo seletivo
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('id, entidade_id, status')
        .eq('user_id', user.id)
        .in('status', ['pendente', 'aprovado']); // Apenas inscrições ativas

      if (inscricoesError) throw inscricoesError;

      if (!inscricoes || inscricoes.length === 0) {
        setFasesPendentes([]);
        return;
      }

      const inscricaoIds = inscricoes.map(i => i.id);

      // 2. Buscar inscrições nas fases com formulário não preenchido
      const { data: inscricoesFases, error: fasesError } = await supabase
        .from('inscricoes_fases_ps')
        .select(`
          id,
          inscricao_id,
          fase_id,
          formulario_preenchido,
          status,
          created_at,
          fase:processos_seletivos_fases(*)
        `)
        .in('inscricao_id', inscricaoIds)
        .eq('status', 'pendente')
        .eq('formulario_preenchido', false);

      if (fasesError) throw fasesError;

      if (!inscricoesFases || inscricoesFases.length === 0) {
        setFasesPendentes([]);
        return;
      }

      // 3. Filtrar apenas fases que têm template vinculado
      const fasesComTemplate = inscricoesFases.filter(
        (if: any) => if.fase?.template_formulario_id
      );

      // 4. Buscar nomes das entidades
      const entidadeIds = [...new Set(inscricoes.map(i => i.entidade_id))];
      const { data: entidades, error: entidadesError } = await supabase
        .from('entidades')
        .select('id, nome')
        .in('id', entidadeIds);

      if (entidadesError) throw entidadesError;

      const entidadesMap = new Map(entidades?.map(e => [e.id, e.nome]) || []);

      // 5. Montar array de fases pendentes
      const pendentes: FasePendente[] = fasesComTemplate.map((if: any) => {
        const inscricao = inscricoes.find(i => i.id === if.inscricao_id);
        return {
          inscricaoFaseId: if.id,
          inscricaoId: if.inscricao_id,
          fase: if.fase as FaseProcessoSeletivo,
          entidadeNome: entidadesMap.get(inscricao?.entidade_id || 0) || 'Organização',
          entidadeId: inscricao?.entidade_id || 0,
          created_at: if.created_at,
        };
      });

      setFasesPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao buscar fases pendentes:', error);
      setFasesPendentes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFasesPendentes();
  }, [fetchFasesPendentes]);

  return {
    fasesPendentes,
    loading,
    refetch: fetchFasesPendentes,
  };
}

