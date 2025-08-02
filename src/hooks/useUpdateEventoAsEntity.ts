import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEventoData {
  nome?: string;
  descricao?: string;
  local?: string;
  data_evento?: string;
  capacidade?: number;
  status?: string;
}

export const useUpdateEventoAsEntity = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateEvento = async (eventoId: string, entidadeId: number, data: UpdateEventoData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('update_event_as_entity', {
        _evento_id: eventoId,
        _entidade_id: entidadeId,
        _nome: data.nome,
        _descricao: data.descricao,
        _local: data.local,
        _data_evento: data.data_evento,
        _capacidade: data.capacidade,
        _status: data.status
      });

      if (error) throw error;

      toast({
        title: "Evento atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar evento';
      toast({
        title: "Erro ao atualizar evento",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { updateEvento, loading };
};