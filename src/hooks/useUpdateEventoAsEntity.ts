import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEventoData {
  nome?: string;
  descricao?: string;
  local?: string;
  data_evento?: string;
  capacidade?: number;
  link_evento?: string;
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
      if (data.data_evento) {
        // O input datetime-local está no timezone local
        // Vamos converter para UTC para evitar problemas de timezone
        
        // Criar uma data a partir do input datetime-local
        const dataLocal = new Date(data.data_evento);
        
        // Verificar se a data é válida
        if (isNaN(dataLocal.getTime())) {
          throw new Error('Data inválida fornecida');
        }
        
        // Converter para UTC (isso vai ajustar automaticamente o timezone)
        dataEventoProcessada = dataLocal.toISOString();
        
        // Debug: log para verificar o que está sendo enviado
        console.log('Debug - Data processada:', {
          input: data.data_evento,
          dataLocal: dataLocal.toString(),
          final: dataEventoProcessada
        });
      }
      
      const { error } = await supabase.rpc('update_event_as_entity', {
        _evento_id: eventoId,
        _entidade_id: entidadeId,
        _nome: data.nome,
        _descricao: data.descricao,
        _local: data.local,
        _data_evento: dataEventoProcessada,
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