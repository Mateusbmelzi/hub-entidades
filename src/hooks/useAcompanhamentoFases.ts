import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ensureMembroEntidade } from '@/lib/membro-entidade';
import type {
  FaseProcessoSeletivo,
  InscricaoProcessoUsuario,
  MetricasFases,
} from '@/types/acompanhamento-processo';

export function useAcompanhamentoFases(entidadeId: number) {
  const [candidatosPorFase, setCandidatosPorFase] = useState<Map<string, InscricaoProcessoUsuario[]>>(new Map());
  const [fases, setFases] = useState<FaseProcessoSeletivo[]>([]);
  const [metricas, setMetricas] = useState<MetricasFases | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acaoEmProgressoId, setAcaoEmProgressoId] = useState<string | null>(null);

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

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, curso, email')
        .in('id', estudanteIds);

      if (profilesError) {
        console.warn('Erro ao buscar perfis:', profilesError);
      }

      // Criar mapa de perfis para busca rápida
      const profilesMap = new Map();
      (profiles || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Preparar mapa da inscrição_fase atual (para buscar atribuições)
      const inscricaoFaseAtualPorInscricao: Record<string, string | null> = {};

      // Processar dados das inscrições
      const candidatosBase: InscricaoProcessoUsuario[] = (inscricoes || []).map(inscricao => {
        // Pegar a fase mais recente (ordenar por created_at descendente)
        const fasesOrdenadas = (inscricao.inscricao_fase || []).sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const faseAtual = fasesOrdenadas[0]?.fase;
        const statusFase = fasesOrdenadas[0]?.status || 'pendente';
        const inscricaoFaseAtualId = fasesOrdenadas[0]?.id || null;
        inscricaoFaseAtualPorInscricao[inscricao.id] = inscricaoFaseAtualId;
        const profile = profilesMap.get(inscricao.user_id);

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
          historico_fases: fasesOrdenadas,
          reserva_atribuida: null,
          inscricao_fase_atual_id: inscricaoFaseAtualId
        };
      });

      // Buscar atribuições de reservas para as inscrições_fases atuais
      const inscricaoFaseIds = Object.values(inscricaoFaseAtualPorInscricao).filter(Boolean) as string[];
      let reservasAtribuidasPorInscricao: Record<string, any> = {};

      if (inscricaoFaseIds.length > 0) {
        const { data: atribs, error: atribsError } = await supabase
          .from('candidatos_reservas')
          .select('inscricao_fase_id, reserva_id')
          .in('inscricao_fase_id', inscricaoFaseIds);

        if (!atribsError && atribs && atribs.length > 0) {
          const reservaIds = [...new Set(atribs.map(a => a.reserva_id))];
          const { data: reservas, error: reservasError } = await supabase
            .from('reservas')
            .select('id, data_reserva, horario_inicio, horario_termino, sala_id')
            .in('id', reservaIds);

          if (!reservasError && reservas) {
            // Buscar informações das salas através da tabela salas
            const reservasComSalaId = reservas.filter(r => r.sala_id).map(r => r.sala_id);
            const { data: salas, error: salasError } = await supabase
              .from('salas')
              .select('id, reserva_id, predio, sala, andar, capacidade')
              .in('reserva_id', reservaIds);

            // Criar mapa de salas por reserva_id
            const salasMap = new Map();
            if (!salasError && salas) {
              salas.forEach(sala => {
                if (sala.reserva_id) {
                  salasMap.set(sala.reserva_id, sala);
                }
              });
            }

            // Combinar dados de reserva com dados da sala
            const reservasCompletas = reservas.map(r => {
              const sala = salasMap.get(r.id);
              return {
                ...r,
                sala_nome: sala?.sala || null,
                sala_predio: sala?.predio || null,
                sala_andar: sala?.andar || null,
                sala_capacidade: sala?.capacidade || null,
              };
            });

            const reservaMap = new Map(reservasCompletas.map(r => [r.id, r]));
            const atribMap: Record<string, any> = {};
            atribs.forEach(a => {
              const r = reservaMap.get(a.reserva_id);
              if (r) atribMap[a.inscricao_fase_id] = r;
            });
            reservasAtribuidasPorInscricao = atribMap;
          }
        }
      }

      // Anexar reserva_atribuida aos candidatos
      const candidatosProcessados: InscricaoProcessoUsuario[] = candidatosBase.map(c => {
        const faseIdAtual = inscricaoFaseAtualPorInscricao[c.id];
        const reserva = faseIdAtual ? reservasAtribuidasPorInscricao[faseIdAtual] : null;
        return {
          ...c,
          reserva_atribuida: reserva
            ? {
                id: reserva.id,
                data_reserva: reserva.data_reserva,
                horario_inicio: reserva.horario_inicio,
                horario_termino: reserva.horario_termino,
                sala_nome: reserva.sala_nome,
                sala_predio: reserva.sala_predio,
                sala_andar: reserva.sala_andar,
              }
            : null,
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

  const ehUltimaFase = useCallback(async (entidadeId: number, ordemFase: number): Promise<boolean> => {
    const { data: entidade, error: entidadeError } = await supabase
      .from('entidades')
      .select('numero_total_fases')
      .eq('id', entidadeId)
      .maybeSingle();

    if (!entidadeError && entidade?.numero_total_fases != null) {
      return ordemFase === entidade.numero_total_fases;
    }
    const { data: fasesAtivas } = await supabase
      .from('processos_seletivos_fases')
      .select('ordem')
      .eq('entidade_id', entidadeId)
      .eq('ativa', true);
    const maxOrdem = fasesAtivas?.length
      ? Math.max(...fasesAtivas.map((f: { ordem: number }) => f.ordem))
      : 0;
    return ordemFase === maxOrdem;
  }, []);

  const moverCandidatoParaFase = useCallback(async (
    candidatoId: string,
    faseDestinoId: string
  ) => {
    try {
      const { data: existente } = await supabase
        .from('inscricoes_fases_ps')
        .select('id')
        .eq('inscricao_id', candidatoId)
        .eq('fase_id', faseDestinoId)
        .maybeSingle();

      if (existente) {
        await fetchCandidatos();
        return { success: true };
      }

      const { error } = await supabase
        .from('inscricoes_fases_ps')
        .insert({
          inscricao_id: candidatoId,
          fase_id: faseDestinoId,
          status: 'pendente',
          respostas_formulario: {}
        });

      if (error) throw error;

      await fetchCandidatos();
      return { success: true };
    } catch (err) {
      console.error('Erro ao mover candidato:', err);
      setError('Erro ao mover candidato');
      return { success: false, error: err };
    }
  }, [fetchCandidatos]);

  const adicionarCandidatoComoMembro = useCallback(async (candidatoId: string) => {
    const { data: inscricao, error: inscricaoError } = await supabase
      .from('inscricoes_processo_seletivo')
      .select('user_id, entidade_id')
      .eq('id', candidatoId)
      .maybeSingle();

    if (inscricaoError || !inscricao) return false;

    const result = await ensureMembroEntidade({
      user_id: inscricao.user_id,
      entidade_id: inscricao.entidade_id,
    });
    return result.success;
  }, []);

  const aprovarCandidato = useCallback(async (candidatoId: string, feedback?: string) => {
    setAcaoEmProgressoId(candidatoId);
    try {
      const { data: rowsAtualizadas, error: faseError } = await supabase
        .from('inscricoes_fases_ps')
        .update({
          status: 'aprovado',
          feedback: feedback ?? null
        })
        .eq('inscricao_id', candidatoId)
        .eq('status', 'pendente')
        .select('id, fase_id');

      if (faseError) throw faseError;

      const faseAtualizada = rowsAtualizadas?.[0] ?? null;
      if (!faseAtualizada) {
        await fetchCandidatos();
        return { success: true, ehUltimaFase: false };
      }

      const { data: inscricao, error: inscricaoErr } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('entidade_id')
        .eq('id', candidatoId)
        .maybeSingle();

      if (inscricaoErr || !inscricao) {
        await fetchCandidatos();
        return { success: true, ehUltimaFase: false };
      }

      const { data: fase, error: faseErr } = await supabase
        .from('processos_seletivos_fases')
        .select('id, ordem')
        .eq('id', faseAtualizada.fase_id)
        .maybeSingle();

      if (faseErr || !fase) {
        await fetchCandidatos();
        return { success: true, ehUltimaFase: false };
      }

      const ultimaFase = await ehUltimaFase(inscricao.entidade_id, fase.ordem);

      if (ultimaFase) {
        const { error: candidatoError } = await supabase
          .from('inscricoes_processo_seletivo')
          .update({ status: 'aprovado' })
          .eq('id', candidatoId);

        if (candidatoError) throw candidatoError;
        await adicionarCandidatoComoMembro(candidatoId);
      } else {
        const proximaFase = fases.find(f => f.ordem === fase.ordem + 1);
        if (proximaFase) {
          await moverCandidatoParaFase(candidatoId, proximaFase.id);
        }
      }

      await fetchCandidatos();
      return { success: true, ehUltimaFase: ultimaFase };
    } catch (err) {
      console.error('Erro ao aprovar candidato:', err);
      setError('Erro ao aprovar candidato');
      return { success: false, error: err, ehUltimaFase: false };
    } finally {
      setAcaoEmProgressoId(null);
    }
  }, [fases, ehUltimaFase, moverCandidatoParaFase, fetchCandidatos, adicionarCandidatoComoMembro]);

  const reprovarCandidato = useCallback(async (candidatoId: string, feedback?: string) => {
    setAcaoEmProgressoId(candidatoId);
    try {
      const { data: rowsAtualizadas, error: faseError } = await supabase
        .from('inscricoes_fases_ps')
        .update({
          status: 'reprovado',
          feedback: feedback ?? null
        })
        .eq('inscricao_id', candidatoId)
        .eq('status', 'pendente')
        .select('id');

      if (faseError) throw faseError;

      if (rowsAtualizadas && rowsAtualizadas.length > 0) {
        const { error: candidatoError } = await supabase
          .from('inscricoes_processo_seletivo')
          .update({ status: 'reprovado' })
          .eq('id', candidatoId);

        if (candidatoError) throw candidatoError;
      }

      await fetchCandidatos();
      return { success: true };
    } catch (err) {
      console.error('Erro ao reprovar candidato:', err);
      setError('Erro ao reprovar candidato');
      return { success: false, error: err };
    } finally {
      setAcaoEmProgressoId(null);
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
    acaoEmProgressoId,
    fetchCandidatos,
    moverCandidatoParaFase,
    aprovarCandidato,
    reprovarCandidato,
    adicionarNota
  };
}
