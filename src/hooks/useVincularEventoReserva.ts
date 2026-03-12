import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RpcResult {
  success: boolean;
  error?: string;
}

export function useVincularEventoReserva() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const invalidateEventoQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['evento'] });
  };

  const vincularEventoReserva = async (
    eventoId: string,
    reservaId: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('vincular_evento_reserva', {
        p_evento_id: eventoId,
        p_reserva_id: reservaId,
      });

      if (error) throw error;

      const result = data as unknown as RpcResult;

      if (!result.success) {
        toast.error(result.error ?? 'Validação falhou.');
        return { success: false, error: result.error };
      }

      toast.success('Evento e reserva foram vinculados com sucesso!');
      invalidateEventoQueries();
      return { success: true };
    } catch (err) {
      toast.error('Não foi possível vincular o evento à reserva.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const desvincularEventoReserva = async (
    eventoId: string,
    reservaId: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('desvincular_evento_reserva', {
        p_evento_id: eventoId,
        p_reserva_id: reservaId,
      });

      if (error) throw error;

      const result = data as unknown as RpcResult;

      if (!result.success) {
        toast.error(result.error ?? 'Validação falhou.');
        return { success: false, error: result.error };
      }

      toast.success('Evento e reserva foram desvinculados.');
      invalidateEventoQueries();
      return { success: true };
    } catch (err) {
      toast.error('Não foi possível desvincular o evento da reserva.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    vincularEventoReserva,
    desvincularEventoReserva,
    loading,
  };
}
