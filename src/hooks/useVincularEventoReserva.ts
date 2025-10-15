import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useVincularEventoReserva() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const vincularEventoReserva = async (
    eventoId: string,
    reservaId: string
  ) => {
    try {
      setLoading(true);

      // Atualizar eventos.reserva_id
      const { error: eventoError } = await supabase
        .from('eventos')
        .update({ reserva_id: reservaId })
        .eq('id', eventoId);

      if (eventoError) {
        console.error('Erro ao vincular evento:', eventoError);
        throw eventoError;
      }

      // Atualizar reservas.evento_id
      const { error: reservaError } = await supabase
        .from('reservas')
        .update({ evento_id: eventoId })
        .eq('id', reservaId);

      if (reservaError) {
        console.error('Erro ao vincular reserva:', reservaError);
        // Reverter mudança no evento
        await supabase
          .from('eventos')
          .update({ reserva_id: null })
          .eq('id', eventoId);
        throw reservaError;
      }

      toast({
        title: 'Vinculação realizada',
        description: 'Evento e reserva foram vinculados com sucesso!',
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao vincular evento e reserva:', error);
      toast({
        title: 'Erro ao vincular',
        description: 'Não foi possível vincular o evento à reserva.',
        variant: 'destructive',
      });
      return { success: false, error };
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

      // Remover vínculo do evento
      const { error: eventoError } = await supabase
        .from('eventos')
        .update({ reserva_id: null })
        .eq('id', eventoId);

      if (eventoError) {
        console.error('Erro ao desvincular evento:', eventoError);
        throw eventoError;
      }

      // Remover vínculo da reserva
      const { error: reservaError } = await supabase
        .from('reservas')
        .update({ evento_id: null })
        .eq('id', reservaId);

      if (reservaError) {
        console.error('Erro ao desvincular reserva:', reservaError);
        throw reservaError;
      }

      toast({
        title: 'Desvinculação realizada',
        description: 'Evento e reserva foram desvinculados. A reserva está livre para ser vinculada a outro evento.',
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao desvincular evento e reserva:', error);
      toast({
        title: 'Erro ao desvincular',
        description: 'Não foi possível desvincular o evento da reserva.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { 
    vincularEventoReserva, 
    desvincularEventoReserva, 
    loading 
  };
}

