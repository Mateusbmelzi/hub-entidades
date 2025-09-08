import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthState } from './useAuthState';

export const useAprovarReservas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { type, user, isAuthenticated } = useAuthState();

  const aprovarReserva = async (reservaId: string, comentario?: string, local?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se está autenticado como Super Admin
      if (!isAuthenticated || type !== 'superAdmin' || !user?.email) {
        throw new Error('Apenas Super Admins podem aprovar reservas. Faça login como Super Admin primeiro.');
      }

      // Chamar a função de aprovação
      console.log('🔍 Chamando aprovar_reserva com:', {
        p_reserva_id: reservaId,
        p_aprovador_email: user.email,
        p_comentario: comentario || 'Reserva aprovada',
        p_local: local
      });

      const { data, error } = await supabase.rpc('aprovar_reserva', {
        p_reserva_id: reservaId,
        p_aprovador_email: user.email,
        p_comentario: comentario || 'Reserva aprovada',
        p_local: local
      });

      console.log('🔍 Resposta da função aprovar_reserva:', { data, error });

      if (error) {
        console.error('❌ Erro na função aprovar_reserva:', error);
        throw error;
      }

      // Verificar se a função retornou sucesso
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          console.log('✅ Reserva aprovada com sucesso:', data);
          toast.success('Reserva aprovada com sucesso! Evento criado automaticamente.');
          return true;
        } else {
          console.error('❌ Função retornou erro:', data.error);
          throw new Error(data.error || 'Erro ao aprovar reserva');
        }
      } else {
        console.log('⚠️ Resposta inesperada da função:', data);
        toast.success('Reserva aprovada com sucesso! Evento criado automaticamente.');
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejeitarReserva = async (reservaId: string, comentario: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se está autenticado como Super Admin
      if (!isAuthenticated || type !== 'superAdmin' || !user?.email) {
        throw new Error('Apenas Super Admins podem rejeitar reservas. Faça login como Super Admin primeiro.');
      }

      // Chamar a função de rejeição
      const { data, error } = await supabase.rpc('rejeitar_reserva', {
        p_reserva_id: reservaId,
        p_aprovador_email: user.email,
        p_comentario: comentario
      });

      if (error) throw error;

      toast.success('Reserva rejeitada.');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao rejeitar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (reservaId: string, motivo?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Chamar a função de cancelamento
      const { data, error } = await supabase.rpc('cancelar_reserva', {
        p_reserva_id: reservaId,
        p_motivo: motivo || 'Cancelada pelo usuário'
      });

      if (error) throw error;

      toast.success('Reserva cancelada.');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    aprovarReserva,
    rejeitarReserva,
    cancelarReserva,
    loading,
    error
  };
};
