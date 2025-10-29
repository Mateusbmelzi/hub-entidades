import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { InscricaoFasePS } from '@/types/processo-seletivo';

export function useInscricaoFasePS() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const inscreverFase = async (inscricaoId: string, faseId: string, respostas: Record<string, any>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Verificar se já existe inscrição nesta fase
      const { data: inscricaoExistente, error: checkError } = await supabase
        .from('inscricoes_fases_ps')
        .select('id')
        .eq('inscricao_id', inscricaoId)
        .eq('fase_id', faseId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (inscricaoExistente) {
        // Atualizar inscrição existente
        const { error: updateError } = await supabase
          .from('inscricoes_fases_ps')
          .update({
            respostas_formulario: respostas,
            status: 'pendente',
            updated_at: new Date().toISOString()
          })
          .eq('id', inscricaoExistente.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova inscrição na fase
        const { error: insertError } = await supabase
          .from('inscricoes_fases_ps')
          .insert({
            inscricao_id: inscricaoId,
            fase_id: faseId,
            respostas_formulario: respostas,
            status: 'pendente'
          });

        if (insertError) throw insertError;
      }

      toast({
        title: 'Sucesso',
        description: 'Inscrição na fase realizada com sucesso!',
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inscrever na fase';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const decidirInscricaoFase = async (inscricaoFaseId: string, status: 'aprovado' | 'reprovado', feedback?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Buscar dados da inscrição na fase
      const { data: inscricaoFase, error: fetchError } = await supabase
        .from('inscricoes_fases_ps')
        .select(`
          *,
          fase:processos_seletivos_fases(*),
          inscricao:inscricoes_processo_seletivo(*)
        `)
        .eq('id', inscricaoFaseId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar status da inscrição na fase
      const { error: updateError } = await supabase
        .from('inscricoes_fases_ps')
        .update({
          status,
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', inscricaoFaseId);

      if (updateError) throw updateError;

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
              inscricao_id: inscricaoFase.inscricao_id,
              fase_id: proximaFase.id,
              respostas_formulario: {},
              status: 'pendente'
            });

          if (proximaFaseError) {
            console.warn('Erro ao criar inscrição na próxima fase:', proximaFaseError);
          }

          toast({
            title: 'Aprovado!',
            description: `Candidato aprovado na fase e avançou para a próxima fase.`,
          });
        } else {
          // É a última fase, adicionar como membro
          const { data: cargoMembro, error: cargoError } = await supabase
            .from('cargos_entidade')
            .select('id')
            .eq('entidade_id', inscricaoFase.fase.entidade_id)
            .eq('nome', 'Membro')
            .single();

          if (cargoError || !cargoMembro) {
            console.error('Erro ao buscar cargo Membro:', cargoError);
            toast({
              title: 'Aprovado, mas erro ao adicionar como membro',
              description: 'O candidato foi aprovado, mas houve um erro ao adicioná-lo como membro. Adicione manualmente.',
              variant: 'destructive',
            });
          } else {
            // Verificar se já é membro
            const { data: membroExistente, error: checkError } = await supabase
              .from('membros_entidade')
              .select('id, ativo')
              .eq('user_id', inscricaoFase.inscricao.user_id)
              .eq('entidade_id', inscricaoFase.fase.entidade_id)
              .maybeSingle();

            if (checkError) throw checkError;

            if (membroExistente?.ativo) {
              console.log('Usuário já é membro ativo');
            } else if (membroExistente && !membroExistente.ativo) {
              // Reativar membro
              const { error: updateError } = await supabase
                .from('membros_entidade')
                .update({
                  cargo_id: cargoMembro.id,
                  ativo: true,
                  data_entrada: new Date().toISOString(),
                })
                .eq('id', membroExistente.id);

              if (updateError) throw updateError;
            } else {
              // Criar novo membro
              const { error: insertError } = await supabase
                .from('membros_entidade')
                .insert({
                  user_id: inscricaoFase.inscricao.user_id,
                  entidade_id: inscricaoFase.fase.entidade_id,
                  cargo_id: cargoMembro.id,
                  data_entrada: new Date().toISOString(),
                  ativo: true,
                });

              if (insertError) throw insertError;
            }

            toast({
              title: 'Aprovado e adicionado como membro!',
              description: 'O candidato foi aprovado na última fase e automaticamente se tornou membro da organização estudantil.',
            });
          }
        }

        // Atualizar status geral da inscrição
        await supabase
          .from('inscricoes_processo_seletivo')
          .update({ 
            status: 'aprovado',
            updated_at: new Date().toISOString()
          })
          .eq('id', inscricaoFase.inscricao_id);
      } else {
        // Reprovado - atualizar status geral
        await supabase
          .from('inscricoes_processo_seletivo')
          .update({ 
            status: 'reprovado',
            updated_at: new Date().toISOString()
          })
          .eq('id', inscricaoFase.inscricao_id);

        toast({
          title: 'Reprovado',
          description: 'O candidato foi reprovado nesta fase.',
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao decidir inscrição na fase';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    inscreverFase, 
    decidirInscricaoFase 
  };
}
