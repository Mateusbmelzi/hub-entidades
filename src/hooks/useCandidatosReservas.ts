import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AtribuirResultado {
  success: boolean;
  error?: string;
}

export const useCandidatosReservas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCandidatosReserva = async (reservaId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatos_reservas')
        .select('id, inscricao_fase_id, reserva_id, horario_atribuido, created_at, updated_at')
        .eq('reserva_id', reservaId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar candidatos da reserva:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os candidatos da reserva', variant: 'destructive' });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getReservaCandidato = async (inscricaoFaseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatos_reservas')
        .select('id, inscricao_fase_id, reserva_id, horario_atribuido')
        .eq('inscricao_fase_id', inscricaoFaseId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error('Erro ao buscar reserva do candidato:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const atribuirCandidatosReserva = async (reservaId: string, inscricaoFaseIds: string[]): Promise<AtribuirResultado> => {
    try {
      setLoading(true);

      if (!inscricaoFaseIds?.length) {
        return { success: false, error: 'Nenhum candidato selecionado' };
      }

      // Opcional: verificar capacidade da sala aqui (se disponível)

      // Inserção idempotente: remover duplicatas por constraint unique
      const payload = inscricaoFaseIds.map(id => ({ inscricao_fase_id: id, reserva_id: reservaId }));
      const { error } = await supabase.from('candidatos_reservas').insert(payload, { count: 'exact' });

      if (error) {
        // Se violação unique (já atribuído), tratar como sucesso parcial
        if ((error as any).code === '23505') {
          toast({ title: 'Aviso', description: 'Alguns candidatos já estavam atribuídos a esta reserva.' });
          return { success: true };
        }
        throw error;
      }

      toast({ title: 'Sucesso', description: 'Candidatos atribuídos à reserva com sucesso.' });
      return { success: true };
    } catch (err) {
      console.error('Erro ao atribuir candidatos à reserva:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atribuir candidatos' };
    } finally {
      setLoading(false);
    }
  };

  const removerCandidatoReserva = async (inscricaoFaseId: string, reservaId: string): Promise<AtribuirResultado> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('candidatos_reservas')
        .delete()
        .eq('inscricao_fase_id', inscricaoFaseId)
        .eq('reserva_id', reservaId);

      if (error) throw error;
      toast({ title: 'Removido', description: 'Candidato removido da reserva.' });
      return { success: true };
    } catch (err) {
      console.error('Erro ao remover candidato da reserva:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao remover candidato' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getCandidatosReserva,
    getReservaCandidato,
    atribuirCandidatosReserva,
    removerCandidatoReserva,
  };
};


