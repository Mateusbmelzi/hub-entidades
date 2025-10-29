import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  FaseProcessoSeletivo, 
  InscricaoProcessoUsuario, 
  MetricasFases, 
  InscricaoFasePS 
} from '@/types/acompanhamento-processo';

export function useAcompanhamentoFases(entidadeId: number) {
  const [candidatosPorFase, setCandidatosPorFase] = useState<Map<string, InscricaoProcessoUsuario[]>>(new Map());
  const [fases, setFases] = useState<FaseProcessoSeletivo[]>([]);
  const [metricas, setMetricas] = useState<MetricasFases | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFases = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('processos_seletivos_fases')
        .select('*')
        .eq('entidade_id', entidadeId)
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setFases(data || []);
    } catch (err) {
      console.error('Erro ao buscar fases:', err);
      setError('Erro ao carregar fases');
    }
  }, [entidadeId]);

  const fetchCandidatos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todas as inscrições com suas fases atuais
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from('inscricoes_processo_seletivo')
        .select(`
          *,
          inscricao_fase:inscricoes_fases_ps(
            *,
            fase:processos_seletivos_fases(*)
          )
        `)
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });

      if (inscricoesError) throw inscricoesError;

      // Buscar dados dos perfis separadamente
      const estudanteIds = (inscricoes || []).map(inscricao => inscricao.user_id).filter(Boolean);
      console.log('🔍 IDs dos estudantes encontrados:', estudanteIds);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, curso, email')
        .in('id', estudanteIds);
        
      console.log('👤 Perfis encontrados:', profiles);

      if (profilesError) {
        console.warn('Erro ao buscar perfis:', profilesError);
      }

      // Criar mapa de perfis para busca rápida
      const profilesMap = new Map();
      (profiles || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Processar dados das inscrições
      const candidatosProcessados: InscricaoProcessoUsuario[] = (inscricoes || []).map(inscricao => {
        // Pegar a fase mais recente (ordenar por created_at descendente)
        const fasesOrdenadas = (inscricao.inscricao_fase || []).sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        const faseAtual = fasesOrdenadas[0]?.fase;
        const statusFase = fasesOrdenadas[0]?.status || 'pendente';
        const profile = profilesMap.get(inscricao.user_id);
        
        console.log(`📋 Candidato ${inscricao.nome_estudante}: fase atual = ${faseAtual?.nome}, status = ${statusFase}`);
        
        return {
          id: inscricao.id,
          entidade_id: inscricao.entidade_id,
          estudante_id: inscricao.user_id,
          status: inscricao.status,
          created_at: inscricao.created_at,
          updated_at: inscricao.updated_at,
          nome_estudante: profile?.nome || inscricao.nome_estudante || 'Nome não disponível',
          email_estudante: profile?.email || inscricao.email_estudante || 'Email não disponível',
          curso_estudante: profile?.curso || inscricao.curso_estudante || 'Curso não disponível',
          semestre_estudante: inscricao.semestre_estudante || 1,
          respostas_formulario: inscricao.respostas_formulario || {},
          fase_atual: faseAtual,
          status_fase: statusFase,
          historico_fases: fasesOrdenadas
        };
      });

      // Agrupar candidatos por fase
      const grouped = new Map<string, InscricaoProcessoUsuario[]>();
      
      // Inicializar todas as fases
      fases.forEach(fase => {
        grouped.set(fase.id, []);
      });
      
      // Adicionar candidatos sem fase em uma categoria especial
      grouped.set('sem-fase', []);
      
      candidatosProcessados.forEach(candidato => {
        if (candidato.fase_atual) {
          const faseId = candidato.fase_atual.id;
          if (grouped.has(faseId)) {
            grouped.get(faseId)!.push(candidato);
          }
        } else {
          grouped.get('sem-fase')!.push(candidato);
        }
      });

      setCandidatosPorFase(grouped);
      
      // Calcular métricas
      const metricas = calcularMetricas(candidatosProcessados, fases);
      setMetricas(metricas);
      
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
      setError('Erro ao carregar candidatos');
    } finally {
      setLoading(false);
    }
  }, [entidadeId, fases]);

  const calcularMetricas = (candidatos: InscricaoProcessoUsuario[], fases: FaseProcessoSeletivo[]): MetricasFases => {
    const totalCandidatos = candidatos.length;
    const emProcesso = candidatos.filter(c => c.status === 'pendente').length;
    const aprovados = candidatos.filter(c => c.status === 'aprovado').length;
    const taxaAprovacao = totalCandidatos > 0 ? (aprovados / totalCandidatos) * 100 : 0;
    
    // Calcular tempo médio (simplificado)
    const tempoMedio = candidatos.length > 0 
      ? candidatos.reduce((acc, c) => {
          const dias = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return acc + dias;
        }, 0) / candidatos.length
      : 0;

    // Candidatos por fase
    const candidatosPorFase: Record<string, number> = {};
    fases.forEach(fase => {
      candidatosPorFase[fase.id] = candidatos.filter(c => c.fase_atual?.id === fase.id).length;
    });

    // Status por fase
    const statusPorFase: Record<string, { pendentes: number; aprovados: number; reprovados: number }> = {};
    fases.forEach(fase => {
      const candidatosFase = candidatos.filter(c => c.fase_atual?.id === fase.id);
      statusPorFase[fase.id] = {
        pendentes: candidatosFase.filter(c => c.status_fase === 'pendente').length,
        aprovados: candidatosFase.filter(c => c.status_fase === 'aprovado').length,
        reprovados: candidatosFase.filter(c => c.status_fase === 'reprovado').length
      };
    });

    return {
      totalCandidatos,
      emProcesso,
      taxaAprovacao,
      tempoMedio,
      candidatosPorFase,
      statusPorFase
    };
  };

  const moverCandidatoParaFase = useCallback(async (
    candidatoId: string,
    faseDestinoId: string
  ) => {
    try {
      // Criar nova inscrição na fase destino
      const { error } = await supabase
        .from('inscricoes_fases_ps')
        .insert({
          inscricao_id: candidatoId,
          fase_id: faseDestinoId,
          status: 'pendente',
          respostas_formulario: {}
        });

      if (error) throw error;

      // Atualizar dados
      await fetchCandidatos();
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao mover candidato:', err);
      setError('Erro ao mover candidato');
      return { success: false, error: err };
    }
  }, [fetchCandidatos]);

  const aprovarCandidato = useCallback(async (candidatoId: string, feedback?: string) => {
    try {
      // Atualizar status da fase atual
      const { error: faseError } = await supabase
        .from('inscricoes_fases_ps')
        .update({ 
          status: 'aprovado',
          feedback: feedback || null
        })
        .eq('inscricao_id', candidatoId)
        .eq('status', 'pendente');

      if (faseError) throw faseError;

      // Se for a última fase, aprovar o candidato
      const candidato = Array.from(candidatosPorFase.values())
        .flat()
        .find(c => c.id === candidatoId);

      if (candidato?.fase_atual) {
        const faseAtual = candidato.fase_atual;
        const proximaFase = fases.find(f => f.ordem === faseAtual.ordem + 1);
        
        console.log(`📊 Fase atual: ${faseAtual.nome} (ordem ${faseAtual.ordem})`);
        console.log(`🔍 Próxima fase: ${proximaFase ? `${proximaFase.nome} (ordem ${proximaFase.ordem})` : 'Nenhuma (última fase)'}`);
        
        if (!proximaFase) {
          // É a última fase, aprovar candidato definitivamente
          console.log('✅ Última fase - Aprovando candidato definitivamente');
          const { error: candidatoError } = await supabase
            .from('inscricoes_processo_seletivo')
            .update({ status: 'aprovado' })
            .eq('id', candidatoId);

          if (candidatoError) throw candidatoError;
        } else {
          // Mover para próxima fase
          console.log(`🚀 Movendo candidato para: ${proximaFase.nome}`);
          await moverCandidatoParaFase(candidatoId, proximaFase.id);
        }
      } else {
        console.warn('⚠️ Candidato sem fase atual - não pode ser movido para próxima fase');
      }

      await fetchCandidatos();
      return { success: true };
    } catch (err) {
      console.error('Erro ao aprovar candidato:', err);
      setError('Erro ao aprovar candidato');
      return { success: false, error: err };
    }
  }, [candidatosPorFase, fases, moverCandidatoParaFase, fetchCandidatos]);

  const reprovarCandidato = useCallback(async (candidatoId: string, feedback?: string) => {
    try {
      // Atualizar status da fase atual
      const { error: faseError } = await supabase
        .from('inscricoes_fases_ps')
        .update({ 
          status: 'reprovado',
          feedback: feedback || null
        })
        .eq('inscricao_id', candidatoId)
        .eq('status', 'pendente');

      if (faseError) throw faseError;

      // Reprovar candidato
      const { error: candidatoError } = await supabase
        .from('inscricoes_processo_seletivo')
        .update({ status: 'reprovado' })
        .eq('id', candidatoId);

      if (candidatoError) throw candidatoError;

      await fetchCandidatos();
      return { success: true };
    } catch (err) {
      console.error('Erro ao reprovar candidato:', err);
      setError('Erro ao reprovar candidato');
      return { success: false, error: err };
    }
  }, [fetchCandidatos]);

  const adicionarNota = useCallback(async (
    candidatoId: string,
    nota: number,
    comentario?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notas_avaliacao_ps')
        .insert({
          candidato_id: candidatoId,
          avaliador_id: (await supabase.auth.getUser()).data.user?.id,
          nota,
          comentario
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
      setError('Erro ao adicionar nota');
      return { success: false, error: err };
    }
  }, []);

  useEffect(() => {
    fetchFases();
  }, [fetchFases]);

  useEffect(() => {
    if (fases.length > 0) {
      fetchCandidatos();
    }
  }, [fetchCandidatos, fases.length]);

  return {
    candidatosPorFase,
    fases,
    metricas,
    loading,
    error,
    fetchCandidatos,
    moverCandidatoParaFase,
    aprovarCandidato,
    reprovarCandidato,
    adicionarNota
  };
}
