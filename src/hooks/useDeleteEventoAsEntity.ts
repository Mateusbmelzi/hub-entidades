import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteEventoAsEntity = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteEvento = async (eventoId: string, entidadeId: number) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('delete_event_as_entity', {
        _evento_id: eventoId,
        _entidade_id: entidadeId
      });

      if (error) throw error;

      toast({
        title: "Evento removido com sucesso!",
        description: "O evento foi removido da plataforma.",
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover evento';
      toast({
        title: "Erro ao remover evento",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteEvento, loading };
};