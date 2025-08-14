import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEventoData {
  data?: string;
  capacidade?: number;
  horario?: string;
  link_evento?: string;
  nome?: string;
  descricao?: string;
  local?: string;
  status?: string;
}

export const useUpdateEventoAsEntity = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateEvento = async (eventoId: string, entidadeId: number, data: UpdateEventoData) => {
    try {
      setLoading(true);
      
      // Converter data_evento de string para Date se fornecida
      let dataEventoProcessada = null;

      if (data.data) {
        const dataLocal = new Date(data.data);
        if (isNaN(dataLocal.getTime())) throw new Error('Data inválida fornecida');
      
        // Formatos corretos para a tabela
        const dataCampo = dataLocal.toISOString().slice(0, 10); // YYYY-MM-DD
        const horarioCampo = dataLocal.toISOString().slice(11, 19); // HH:mm:ss
      
        const { error } = await supabase.rpc('update_event_as_entity', {
          _evento_id: eventoId,
          _entidade_id: entidadeId,
          _data: dataCampo,
          _horario: horarioCampo,
          _capacidade: data.capacidade,
          _link_evento: data.link_evento,
          _nome: data.nome,
          _descricao: data.descricao,
          _local: data.local,
          _status: data.status,
        });
      
        if (error) throw error;
      }
      
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