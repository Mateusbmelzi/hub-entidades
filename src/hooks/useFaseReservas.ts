import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useValidarConflitoReserva } from '@/hooks/useValidarConflitoReserva';
import { useValidarCapacidadeSala } from '@/hooks/useValidarCapacidadeSala';
import type { ReservaVinculada } from '@/types/processo-seletivo';

export const useFaseReservas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { verificarConflitos } = useValidarConflitoReserva();
  const { verificarCapacidade } = useValidarCapacidadeSala();

  const getReservasFase = async (faseId: string): Promise<ReservaVinculada[]> => {
    try {
      setLoading(true);

      // Buscar vínculos entre fase e reservas
      const { data: vínculos, error: errorVinculos } = await supabase
        .from('fases_reservas')
        .select('reserva_id')
        .eq('fase_id', faseId);

      if (errorVinculos) throw errorVinculos;

      if (!vínculos || vínculos.length === 0) {
        return [];
      }

      const reservaIds = vínculos.map(v => v.reserva_id);

      // Buscar informações completas das reservas
      const { data: reservas, error: errorReservas } = await supabase
        .from('reservas')
        .select(`
          id,
          data_reserva,
          horario_inicio,
          horario_termino,
          quantidade_pessoas,
          status,
          sala_id,
          sala_nome,
          sala_predio,
          sala_andar,
          sala_capacidade
        `)
        .in('id', reservaIds);

      if (errorReservas) throw errorReservas;

      // Buscar salas vinculadas através da tabela salas
      const { data: salas, error: errorSalas } = await supabase
        .from('salas')
        .select('id, reserva_id, predio, sala, andar, capacidade')
        .in('reserva_id', reservaIds);

      if (errorSalas) {
        console.warn('Erro ao buscar salas:', errorSalas);
      }

      // Combinar dados
      const reservasCompletas: ReservaVinculada[] = (reservas || []).map((reserva: any) => {
        const salaVinculada = (salas || []).find(s => s.reserva_id === reserva.id);

        return {
          id: reserva.id,
          data_reserva: reserva.data_reserva,
          horario_inicio: reserva.horario_inicio,
          horario_termino: reserva.horario_termino,
          quantidade_pessoas: reserva.quantidade_pessoas,
          status_reserva: (reserva as any).status || (reserva as any).status_reserva || '',
          sala_id: salaVinculada?.id || reserva.sala_id,
          sala_nome: salaVinculada?.sala || reserva.sala_nome,
          sala_predio: salaVinculada?.predio || reserva.sala_predio,
          sala_andar: salaVinculada?.andar || reserva.sala_andar,
          sala_capacidade: salaVinculada?.capacidade || reserva.sala_capacidade,
        };
      });

      return reservasCompletas;
    } catch (err) {
      console.error('Erro ao buscar reservas da fase:', err);
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao carregar reservas',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const vincularReservas = async (
    faseId: string,
    reservaIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      if (!reservaIds || reservaIds.length === 0) {
        return { success: false, error: 'Nenhuma reserva selecionada' };
      }

      // Validar cada reserva antes de vincular
      for (const reservaId of reservaIds) {
        // Buscar informações da reserva
        const { data: reserva, error: errorReserva } = await supabase
          .from('reservas')
          .select('id, status:status, data_reserva, horario_inicio, horario_termino, quantidade_pessoas, sala_id')
          .eq('id', reservaId)
          .single();

        if (errorReserva) throw errorReserva;

        if (!reserva) {
          return { success: false, error: `Reserva ${reservaId} não encontrada` };
        }

        // Verificar se a reserva está aprovada
        if (((reserva as any).status || (reserva as any).status_reserva) !== 'aprovada') {
          return {
            success: false,
            error: 'Apenas reservas aprovadas podem ser vinculadas às fases',
          };
        }

        // Verificar conflitos se houver sala associada
        if (reserva.sala_id) {
          const conflito = await verificarConflitos(
            reserva.id,
            reserva.sala_id,
            reserva.data_reserva,
            reserva.horario_inicio,
            reserva.horario_termino
          );

          if (conflito.temConflito) {
            return {
              success: false,
              error: conflito.mensagem || 'Conflito de horário detectado',
            };
          }

          // Verificar capacidade
          const capacidade = await verificarCapacidade(reserva.sala_id, reserva.quantidade_pessoas);
          if (!capacidade.valido) {
            return {
              success: false,
              error: capacidade.mensagem || 'Capacidade insuficiente',
            };
          }
        }
      }

      // Criar vínculos
      const vinculos = reservaIds.map(reservaId => ({
        fase_id: faseId,
        reserva_id: reservaId,
      }));

      const { error: errorInsert } = await supabase.from('fases_reservas').insert(vinculos);

      if (errorInsert) {
        // Verificar se é erro de duplicata (já existe vínculo)
        if (errorInsert.code === '23505') {
          return {
            success: false,
            error: 'Uma ou mais reservas já estão vinculadas a esta fase',
          };
        }
        throw errorInsert;
      }

      toast({
        title: 'Sucesso',
        description: `${reservaIds.length} reserva(s) vinculada(s) com sucesso`,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao vincular reservas';
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

  const desvincularReserva = async (
    faseId: string,
    reservaId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('fases_reservas')
        .delete()
        .eq('fase_id', faseId)
        .eq('reserva_id', reservaId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Reserva desvinculada com sucesso',
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desvincular reserva';
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
    getReservasFase,
    vincularReservas,
    desvincularReserva,
    loading,
  };
};

