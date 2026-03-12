import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureMembroEntidade } from '@/lib/membro-entidade';

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

      const { data: inscricaoFase, error: fetchError } = await supabase
        .from('inscricoes_fases_ps')
        .select(`
          *,
          fase:processos_seletivos_fases(*),
          inscricao:inscricoes_processo_seletivo(*)
        `)
        .eq('id', inscricaoFaseId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!inscricaoFase) throw new Error('Inscrição na fase não encontrada.');

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
        const { data: proximaFase, error: proximaFaseError } = await supabase
          .from('processos_seletivos_fases')
          .select('id, ordem')
          .eq('entidade_id', inscricaoFase.fase.entidade_id)
          .eq('ordem', inscricaoFase.fase.ordem + 1)
          .eq('ativa', true)
          .maybeSingle();

        if (proximaFaseError) {
          throw proximaFaseError;
        }

        if (proximaFase) {
          const { data: inscricaoProximaExistente, error: inscricaoProximaError } = await supabase
            .from('inscricoes_fases_ps')
            .select('id')
            .eq('inscricao_id', inscricaoFase.inscricao_id)
            .eq('fase_id', proximaFase.id)
            .maybeSingle();

          if (inscricaoProximaError && inscricaoProximaError.code !== 'PGRST116') {
            throw inscricaoProximaError;
          }

          if (!inscricaoProximaExistente) {
            const { error: insertProximaError } = await supabase
              .from('inscricoes_fases_ps')
              .insert({
                inscricao_id: inscricaoFase.inscricao_id,
                fase_id: proximaFase.id,
                respostas_formulario: {},
                status: 'pendente'
              });

            if (insertProximaError) {
              console.warn('Erro ao criar inscrição na próxima fase:', insertProximaError);
            }
          }

          toast({
            title: 'Aprovado!',
            description: 'Candidato aprovado na fase e avançou para a próxima fase.',
          });
        } else {
          await supabase
            .from('inscricoes_processo_seletivo')
            .update({ 
              status: 'aprovado',
              updated_at: new Date().toISOString()
            })
            .eq('id', inscricaoFase.inscricao_id);

          const result = await ensureMembroEntidade({
            user_id: inscricaoFase.inscricao.user_id,
            entidade_id: inscricaoFase.fase.entidade_id,
          });

          if (!result.success) {
            toast({
              title: 'Aprovado, mas erro ao adicionar como membro',
              description: result.error ?? 'Adicione o membro manualmente.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Aprovado e adicionado como membro!',
              description: 'O candidato foi aprovado na última fase e automaticamente se tornou membro da organização estudantil.',
            });
          }
        }
      } else {
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
