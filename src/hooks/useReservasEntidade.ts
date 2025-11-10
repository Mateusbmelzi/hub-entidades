import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Reserva } from '@/types/reserva';
import type { ReservaVinculada } from '@/types/processo-seletivo';

export const useReservasEntidade = (entidadeId?: number) => {
  const [reservas, setReservas] = useState<ReservaVinculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservasEntidade = async () => {
    if (!entidadeId) {
      setReservas([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar reservas aprovadas da entidade com informações das salas
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select(`
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
        `)
        .eq('entidade_id', entidadeId)
        .eq('status', 'aprovada')
        .order('data_reserva', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (reservasError) throw reservasError;

      // Buscar salas vinculadas através da tabela salas
      const reservaIds = (reservasData || []).map(r => r.id);
      
      if (reservaIds.length > 0) {
        const { data: salasData, error: salasError } = await supabase
          .from('salas')
          .select('id, reserva_id, predio, sala, andar, capacidade')
          .in('reserva_id', reservaIds);

        if (salasError) {
          console.warn('Erro ao buscar salas:', salasError);
        }

        // Combinar dados de reservas com dados de salas
        const reservasComSalas: ReservaVinculada[] = (reservasData || []).map((reserva: any) => {
          const salaVinculada = (salasData || []).find(s => s.reserva_id === reserva.id);
          
          return {
            id: reserva.id,
            data_reserva: reserva.data_reserva,
            horario_inicio: reserva.horario_inicio,
            horario_termino: reserva.horario_termino,
            quantidade_pessoas: reserva.quantidade_pessoas,
            status_reserva: (reserva as any).status || (reserva as any).status_reserva,
            sala_id: salaVinculada?.id || reserva.sala_id,
            sala_nome: salaVinculada?.sala || reserva.sala_nome,
            sala_predio: salaVinculada?.predio || reserva.sala_predio,
            sala_andar: salaVinculada?.andar || reserva.sala_andar,
            sala_capacidade: salaVinculada?.capacidade || reserva.sala_capacidade,
          };
        });

        setReservas(reservasComSalas);
      } else {
        setReservas([]);
      }
    } catch (err) {
      console.error('Erro ao buscar reservas da entidade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasEntidade();
  }, [entidadeId]);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservasEntidade,
  };
};

