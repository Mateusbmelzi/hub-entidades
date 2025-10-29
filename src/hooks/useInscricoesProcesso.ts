import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { InscricaoProcessoSeletivo } from '@/types/processo-seletivo';

export function useInscricoesProcesso(entidadeId?: number) {
  const [inscricoes, setInscricoes] = useState<InscricaoProcessoSeletivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInscricoes = useCallback(async () => {
    if (!entidadeId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('inscricoes_processo_seletivo')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Buscar dados dos perfis para exibir informações completas
      const userIds = (data || []).map((inscricao: any) => inscricao.user_id);
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, curso, email')
          .in('id', userIds);
        
        if (profilesError) {
          console.warn('Erro ao buscar perfis para inscrições:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Criar mapa de perfis para lookup rápido
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Combinar dados das inscrições com perfis
      const inscricoesComPerfis = (data || []).map((inscricao: any) => ({
        ...inscricao,
        profile: profilesMap.get(inscricao.user_id) || undefined,
      }));

      setInscricoes(inscricoesComPerfis as InscricaoProcessoSeletivo[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar inscrições');
      setInscricoes([]);
    } finally {
      setLoading(false);
    }
  }, [entidadeId]);

  useEffect(() => { fetchInscricoes(); }, [fetchInscricoes]);

  const adicionarComoMembro = async (inscricao: InscricaoProcessoSeletivo) => {
    try {
      // Buscar o cargo padrão "Membro" da entidade
      const { data: cargoMembro, error: cargoError } = await supabase
        .from('cargos_entidade')
        .select('id')
        .eq('entidade_id', entidadeId)
        .eq('nome', 'Membro')
        .single();

      if (cargoError || !cargoMembro) {
        console.error('Erro ao buscar cargo Membro:', cargoError);
        return false;
      }

      // Verificar se já é membro
      const { data: membroExistente, error: checkError } = await supabase
        .from('membros_entidade')
        .select('id, ativo')
        .eq('user_id', inscricao.user_id)
        .eq('entidade_id', entidadeId)
        .maybeSingle();

      if (checkError) throw checkError;

      // Se já é membro ativo, não fazer nada
      if (membroExistente?.ativo) {
        console.log('Usuário já é membro ativo');
        return true;
      }

      // Se já foi membro mas está inativo, reativar
      if (membroExistente && !membroExistente.ativo) {
        const { error: updateError } = await supabase
          .from('membros_entidade')
          .update({
            cargo_id: cargoMembro.id,
            ativo: true,
            data_entrada: new Date().toISOString(),
          })
          .eq('id', membroExistente.id);

        if (updateError) throw updateError;
        console.log('Membro reativado com sucesso');
        return true;
      }

      // Criar novo membro
      const { error: insertError } = await supabase
        .from('membros_entidade')
        .insert({
          user_id: inscricao.user_id,
          entidade_id: entidadeId,
          cargo_id: cargoMembro.id,
          data_entrada: new Date().toISOString(),
          ativo: true,
        });

      if (insertError) throw insertError;
      console.log('Novo membro adicionado com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao adicionar como membro:', err);
      return false;
    }
  };

  const decidir = useCallback(
    async (inscricaoId: string, status: 'aprovado' | 'reprovado') => {
      try {
        // Buscar inscrição da fase atual
        const { data: inscricaoFase, error: faseError } = await supabase
          .from('inscricoes_fases_ps')
          .select(`
            *,
            fase:processos_seletivos_fases(*)
          `)
          .eq('inscricao_id', inscricaoId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (faseError && faseError.code !== 'PGRST116') {
          throw faseError;
        }

        if (inscricaoFase) {
          // Atualizar status da fase
          const { error: updateFaseError } = await supabase
            .from('inscricoes_fases_ps')
            .update({ 
              status, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', inscricaoFase.id);

          if (updateFaseError) throw updateFaseError;

          if (status === 'aprovado') {
            // Verificar se há próxima fase
            const { data: proximaFase, error: proximaFaseError } = await supabase
              .from('processos_seletivos_fases')
              .select('id, ordem')
              .eq('entidade_id', inscricaoFase.fase.entidade_id)
              .eq('ordem', inscricaoFase.fase.ordem + 1)
              .eq('ativa', true)
              .single();

            if (proximaFaseError && proximaFaseError.code !== 'PGRST116') {
              throw proximaFaseError;
            }

            if (proximaFase) {
              // Criar inscrição na próxima fase
              const { error: proximaFaseError } = await supabase
                .from('inscricoes_fases_ps')
                .insert({
                  inscricao_id: inscricaoId,
                  fase_id: proximaFase.id,
                  respostas_formulario: {},
                  status: 'pendente'
                });

              if (proximaFaseError) {
                console.warn('Erro ao criar inscrição na próxima fase:', proximaFaseError);
              }

              toast({
                title: '✅ Aprovado!',
                description: `Candidato aprovado na fase e avançou para a próxima fase.`,
              });
            } else {
              // É a última fase, adicionar como membro
              const inscricao = inscricoes.find(i => i.id === inscricaoId);
              if (inscricao) {
                const sucesso = await adicionarComoMembro(inscricao);
                if (sucesso) {
                  toast({
                    title: '✅ Aprovado e adicionado como membro!',
                    description: 'O candidato foi aprovado na última fase e automaticamente se tornou membro da organização estudantil.',
                  });
                } else {
                  toast({
                    title: '⚠️ Aprovado, mas erro ao adicionar como membro',
                    description: 'O candidato foi aprovado, mas houve um erro ao adicioná-lo como membro. Adicione manualmente.',
                    variant: 'destructive',
                  });
                }
              }
            }
          } else {
            toast({
              title: '❌ Inscrição reprovada',
              description: 'O candidato foi reprovado nesta fase.',
            });
          }
        } else {
          // Fallback para sistema antigo (sem fases)
          const { error } = await supabase
            .from('inscricoes_processo_seletivo')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', inscricaoId);
          
          if (error) throw error;

          if (status === 'aprovado') {
            const inscricao = inscricoes.find(i => i.id === inscricaoId);
            if (inscricao) {
              const sucesso = await adicionarComoMembro(inscricao);
              if (sucesso) {
                toast({
                  title: '✅ Aprovado e adicionado como membro!',
                  description: 'O candidato foi aprovado e automaticamente se tornou membro da organização estudantil.',
                });
              } else {
                toast({
                  title: '⚠️ Aprovado, mas erro ao adicionar como membro',
                  description: 'O candidato foi aprovado, mas houve um erro ao adicioná-lo como membro. Adicione manualmente.',
                  variant: 'destructive',
                });
              }
            }
          } else {
            toast({
              title: '❌ Inscrição reprovada',
              description: 'O candidato foi reprovado no processo seletivo.',
            });
          }
        }

        // Atualizar status geral da inscrição
        await supabase
          .from('inscricoes_processo_seletivo')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', inscricaoId);

        await fetchInscricoes();
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erro ao decidir' };
      }
    },
    [fetchInscricoes, inscricoes, entidadeId, toast]
  );

  const processarInscricoesAprovadas = useCallback(async () => {
    try {
      // Buscar todas as inscrições aprovadas
      const inscricoesAprovadas = inscricoes.filter(i => i.status === 'aprovado');
      
      if (inscricoesAprovadas.length === 0) {
        toast({
          title: 'Nenhuma inscrição aprovada',
          description: 'Não há inscrições aprovadas para processar.',
        });
        return { success: true, processadas: 0 };
      }

      // Verificar quais já são membros para evitar processamento desnecessário
      const userIds = inscricoesAprovadas.map(i => i.user_id);
      const { data: membrosExistentes, error: membrosError } = await supabase
        .from('membros_entidade')
        .select('user_id')
        .eq('entidade_id', entidadeId)
        .eq('ativo', true)
        .in('user_id', userIds);

      if (membrosError) throw membrosError;

      const userIdsJaMembros = new Set(membrosExistentes?.map(m => m.user_id) || []);
      const inscricoesParaProcessar = inscricoesAprovadas.filter(i => !userIdsJaMembros.has(i.user_id));

      if (inscricoesParaProcessar.length === 0) {
        toast({
          title: 'Todos já são membros',
          description: 'Todas as inscrições aprovadas já são membros da organização estudantil.',
        });
        return { success: true, processadas: 0 };
      }

      let processadas = 0;
      let erros = 0;

      for (const inscricao of inscricoesParaProcessar) {
        const sucesso = await adicionarComoMembro(inscricao);
        if (sucesso) {
          processadas++;
        } else {
          erros++;
        }
      }

      if (processadas > 0) {
        toast({
          title: '✅ Processamento concluído!',
          description: `${processadas} inscrições aprovadas foram convertidas em membros.${erros > 0 ? ` ${erros} falharam.` : ''}`,
        });
      }

      await fetchInscricoes();
      return { success: true, processadas, erros };
    } catch (err) {
      toast({
        title: '❌ Erro ao processar inscrições',
        description: 'Erro ao converter inscrições aprovadas em membros.',
        variant: 'destructive',
      });
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  }, [inscricoes, entidadeId, toast, fetchInscricoes]);

  return { inscricoes, loading, error, refetch: fetchInscricoes, decidir, processarInscricoesAprovadas };
}


