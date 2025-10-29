import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FaseProcessoSeletivo } from '@/types/processo-seletivo';

export function useFasesProcesso(entidadeId?: number) {
  const [fases, setFases] = useState<FaseProcessoSeletivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFases = useCallback(async () => {
    if (!entidadeId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('processos_seletivos_fases')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('ordem', { ascending: true });
      
      if (error) throw error;
      setFases((data || []) as FaseProcessoSeletivo[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fases');
      setFases([]);
    } finally {
      setLoading(false);
    }
  }, [entidadeId]);

  useEffect(() => { fetchFases(); }, [fetchFases]);

  const criarFase = async (data: Partial<FaseProcessoSeletivo>): Promise<{ success: boolean; fase?: FaseProcessoSeletivo; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se já existe fase com a mesma ordem
      const { data: faseExistente, error: checkError } = await supabase
        .from('processos_seletivos_fases')
        .select('id')
        .eq('entidade_id', entidadeId)
        .eq('ordem', data.ordem)
        .maybeSingle();

      if (checkError) throw checkError;

      if (faseExistente) {
        toast({
          title: 'Erro',
          description: `Já existe uma fase com ordem ${data.ordem}`,
          variant: 'destructive',
        });
        return { success: false, error: 'Ordem já existe' };
      }

      const { data: novaFase, error: insertError } = await supabase
        .from('processos_seletivos_fases')
        .insert({
          entidade_id: entidadeId,
          ordem: data.ordem || 1,
          nome: data.nome || 'Nova Fase',
          descricao: data.descricao,
          tipo: data.tipo || 'outro',
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          ativa: data.ativa !== undefined ? data.ativa : true,
          criterios_aprovacao: data.criterios_aprovacao,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Sucesso',
        description: 'Fase criada com sucesso!',
      });

      await fetchFases();
      return { success: true, fase: novaFase };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar fase';
      setError(errorMessage);
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

  const atualizarFase = async (faseId: string, data: Partial<FaseProcessoSeletivo>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Se mudando ordem, verificar conflito
      if (data.ordem !== undefined) {
        const { data: faseExistente, error: checkError } = await supabase
          .from('processos_seletivos_fases')
          .select('id')
          .eq('entidade_id', entidadeId)
          .eq('ordem', data.ordem)
          .neq('id', faseId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (faseExistente) {
          toast({
            title: 'Erro',
            description: `Já existe uma fase com ordem ${data.ordem}`,
            variant: 'destructive',
          });
          return { success: false, error: 'Ordem já existe' };
        }
      }

      const { error: updateError } = await supabase
        .from('processos_seletivos_fases')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', faseId);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Fase atualizada com sucesso!',
      });

      await fetchFases();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar fase';
      setError(errorMessage);
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

  const deletarFase = async (faseId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se é Fase 1 e processo seletivo está ativo
      const { data: fase, error: faseError } = await supabase
        .from('processos_seletivos_fases')
        .select('ordem, entidade_id')
        .eq('id', faseId)
        .single();

      if (faseError) throw faseError;

      if (fase.ordem === 1) {
        const { data: entidade, error: entidadeError } = await supabase
          .from('entidades')
          .select('processo_seletivo_ativo')
          .eq('id', fase.entidade_id)
          .single();

        if (entidadeError) throw entidadeError;

        if (entidade.processo_seletivo_ativo) {
          toast({
            title: 'Erro',
            description: 'Não é possível deletar a Fase 1 enquanto o processo seletivo estiver ativo',
            variant: 'destructive',
          });
          return { success: false, error: 'Fase 1 não pode ser deletada' };
        }
      }

      const { error: deleteError } = await supabase
        .from('processos_seletivos_fases')
        .delete()
        .eq('id', faseId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Sucesso',
        description: 'Fase deletada com sucesso!',
      });

      await fetchFases();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar fase';
      setError(errorMessage);
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
    fases, 
    loading, 
    error, 
    refetch: fetchFases, 
    criarFase, 
    atualizarFase, 
    deletarFase 
  };
}
