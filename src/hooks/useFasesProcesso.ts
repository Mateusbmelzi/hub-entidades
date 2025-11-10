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
      
      // Tentar buscar com join primeiro (mais eficiente se funcionar)
      let fasesData: any[] = [];
      let reservasPorFase: Record<string, any[]> = {};

      try {
        const { data, error } = await supabase
          .from('processos_seletivos_fases')
          .select(`
            *,
            fases_reservas (
              reserva_id,
              reservas (
                id,
                data_reserva,
                horario_inicio,
                horario_termino,
                quantidade_pessoas,
                status:status,
                sala_id,
                sala_nome,
                sala_predio,
                sala_andar,
                sala_capacidade
              )
            )
          `)
          .eq('entidade_id', entidadeId)
          .order('ordem', { ascending: true });

        if (!error && data) {
          // Processar dados do join
          fasesData = data.map((fase: any) => {
            const reservas = fase.fases_reservas?.map((fr: any) => fr.reservas).filter(Boolean) || [];
            reservasPorFase[fase.id] = reservas;
            return fase;
          });
        } else {
          throw error;
        }
      } catch (joinError) {
        // Fallback: buscar separadamente se join não funcionar
        console.warn('Join não funcionou, buscando separadamente:', joinError);
        
        const { data, error } = await supabase
          .from('processos_seletivos_fases')
          .select('*')
          .eq('entidade_id', entidadeId)
          .order('ordem', { ascending: true });
        
        if (error) throw error;
        fasesData = data || [];

        if (fasesData.length > 0) {
          const faseIds = fasesData.map(f => f.id);
          
          const { data: vinculosData, error: vinculosError } = await supabase
            .from('fases_reservas')
            .select('fase_id, reserva_id')
            .in('fase_id', faseIds);

          if (!vinculosError && vinculosData && vinculosData.length > 0) {
            const reservaIds = [...new Set(vinculosData.map(v => v.reserva_id))];
            
            const { data: reservasData, error: reservasError } = await supabase
              .from('reservas')
              .select('id, data_reserva, horario_inicio, horario_termino, quantidade_pessoas, status:status, sala_id, sala_nome, sala_predio, sala_andar, sala_capacidade')
              .in('id', reservaIds);

            if (!reservasError && reservasData) {
              vinculosData.forEach(vinculo => {
                const reserva = reservasData.find(r => r.id === vinculo.reserva_id);
                if (reserva) {
                  if (!reservasPorFase[vinculo.fase_id]) {
                    reservasPorFase[vinculo.fase_id] = [];
                  }
                  reservasPorFase[vinculo.fase_id].push(reserva);
                }
              });

              // Buscar informações de salas
              const { data: salasData, error: salasError } = await supabase
                .from('salas')
                .select('id, reserva_id, predio, sala, andar, capacidade')
                .in('reserva_id', reservaIds);

              if (!salasError && salasData) {
                reservasData.forEach(reserva => {
                  const salaVinculada = salasData.find(s => s.reserva_id === reserva.id);
                  if (salaVinculada) {
                    reserva.sala_id = salaVinculada.id;
                    reserva.sala_nome = salaVinculada.sala;
                    reserva.sala_predio = salaVinculada.predio;
                    reserva.sala_andar = salaVinculada.andar;
                    reserva.sala_capacidade = salaVinculada.capacidade;
                    
                    // Atualizar no mapa também
                    Object.keys(reservasPorFase).forEach(faseId => {
                      reservasPorFase[faseId] = reservasPorFase[faseId].map(r => 
                        r.id === reserva.id ? reserva : r
                      );
                    });
                  }
                });
              }
            }
          }
        }
      }

      if (fasesData.length === 0) {
        setFases([]);
        return;
      }

      // Processar dados para incluir reservas vinculadas
      const fasesProcessadas = fasesData.map((fase: any) => {
        const reservasVinculadas = (reservasPorFase[fase.id] || []).map((reserva: any) => ({
          id: reserva.id,
          data_reserva: reserva.data_reserva,
          horario_inicio: reserva.horario_inicio,
          horario_termino: reserva.horario_termino,
          quantidade_pessoas: reserva.quantidade_pessoas,
          status_reserva: (reserva as any).status || (reserva as any).status_reserva,
          sala_id: reserva.sala_id,
          sala_nome: reserva.sala_nome,
          sala_predio: reserva.sala_predio,
          sala_andar: reserva.sala_andar,
          sala_capacidade: reserva.sala_capacidade,
        }));

        return {
          ...fase,
          presencial: fase.presencial || false,
          reservas: reservasVinculadas,
        };
      });

      setFases(fasesProcessadas as FaseProcessoSeletivo[]);
    } catch (err) {
      console.error('Erro ao buscar fases:', err);
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
          presencial: data.presencial !== undefined ? data.presencial : false,
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
