import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConflitoReserva {
  reserva_id: string;
  sala_id: number;
  data_reserva: string;
  horario_inicio: string;
  horario_termino: string;
  entidade_id?: number;
}

export interface ResultadoValidacaoConflito {
  temConflito: boolean;
  conflitos: ConflitoReserva[];
  mensagem?: string;
}

export const useValidarConflitoReserva = () => {
  const [loading, setLoading] = useState(false);

  const verificarConflitos = async (
    reservaId: string,
    salaId: number,
    dataReserva: string,
    horarioInicio: string,
    horarioTermino: string
  ): Promise<ResultadoValidacaoConflito> => {
    try {
      setLoading(true);

      // Buscar todas as salas que têm reserva_id (reservas aprovadas associadas)
      const { data: salasComReservas, error: errorSalas } = await supabase
        .from('salas')
        .select('id, reserva_id')
        .eq('id', salaId)
        .not('reserva_id', 'is', null);

      if (errorSalas) throw errorSalas;

      const reservaIdsDaSala = (salasComReservas || [])
        .map(s => s.reserva_id)
        .filter((id): id is string => id !== null && id !== reservaId);

      if (reservaIdsDaSala.length === 0) {
        // Nenhuma reserva nesta sala, sem conflitos
        return {
          temConflito: false,
          conflitos: [],
        };
      }

      // Buscar as reservas que estão nesta sala e são aprovadas
      const { data: reservasConflitantes, error: errorReservas } = await supabase
        .from('reservas')
        .select('id, data_reserva, horario_inicio, horario_termino, entidade_id')
        .eq('status', 'aprovada')
        .in('id', reservaIdsDaSala);

      if (errorReservas) throw errorReservas;

      // Verificar conflitos de horário
      const conflitos: ConflitoReserva[] = [];

      const dataReservaObj = new Date(dataReserva);
      const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
      const [horaTermino, minutoTermino] = horarioTermino.split(':').map(Number);
      
      const inicioReserva = new Date(dataReservaObj);
      inicioReserva.setHours(horaInicio, minutoInicio, 0, 0);
      
      const terminoReserva = new Date(dataReservaObj);
      terminoReserva.setHours(horaTermino, minutoTermino, 0, 0);

      (reservasConflitantes || []).forEach((reserva: any) => {
        // Verificar se é no mesmo dia
        const dataConflitoObj = new Date(reserva.data_reserva);
        if (
          dataConflitoObj.getFullYear() === dataReservaObj.getFullYear() &&
          dataConflitoObj.getMonth() === dataReservaObj.getMonth() &&
          dataConflitoObj.getDate() === dataReservaObj.getDate()
        ) {
          // Mesmo dia - verificar sobreposição de horários
          const [horaInicioConf, minutoInicioConf] = reserva.horario_inicio.split(':').map(Number);
          const [horaTerminoConf, minutoTerminoConf] = reserva.horario_termino.split(':').map(Number);
          
          const inicioConflito = new Date(dataConflitoObj);
          inicioConflito.setHours(horaInicioConf, minutoInicioConf, 0, 0);
          
          const terminoConflito = new Date(dataConflitoObj);
          terminoConflito.setHours(horaTerminoConf, minutoTerminoConf, 0, 0);

          // Verificar sobreposição
          if (
            (inicioReserva >= inicioConflito && inicioReserva < terminoConflito) ||
            (terminoReserva > inicioConflito && terminoReserva <= terminoConflito) ||
            (inicioReserva <= inicioConflito && terminoReserva >= terminoConflito)
          ) {
            conflitos.push({
              reserva_id: reserva.id,
              sala_id: salaId,
              data_reserva: reserva.data_reserva,
              horario_inicio: reserva.horario_inicio,
              horario_termino: reserva.horario_termino,
              entidade_id: reserva.entidade_id,
            });
          }
        }
      });

      return {
        temConflito: conflitos.length > 0,
        conflitos,
        mensagem:
          conflitos.length > 0
            ? 'Esta sala já possui uma reserva aprovada no horário especificado'
            : undefined,
      };
    } catch (err) {
      console.error('Erro ao verificar conflitos:', err);
      return {
        temConflito: true, // Em caso de erro, assumir que há conflito por segurança
        conflitos: [],
        mensagem: err instanceof Error ? err.message : 'Erro ao verificar conflitos',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    verificarConflitos,
    loading,
  };
};

