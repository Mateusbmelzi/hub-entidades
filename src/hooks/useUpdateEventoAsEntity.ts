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
      
      console.log('🔄 Atualizando evento diretamente na tabela...');
      console.log('📝 Dados recebidos:', data);
      
      // Preparar dados para update direto na tabela
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.local !== undefined) updateData.local = data.local;
      if (data.capacidade !== undefined) updateData.capacidade = data.capacidade;
      if (data.link_evento !== undefined) updateData.link_evento = data.link_evento;
      if (data.status !== undefined) updateData.status = data.status;
      
      // Processar data e horário se fornecidos
      if (data.data) {
        const dataLocal = new Date(data.data);
        if (isNaN(dataLocal.getTime())) throw new Error('Data inválida fornecida');
        
        updateData.data = dataLocal.toISOString().slice(0, 10); // YYYY-MM-DD
        updateData.horario = dataLocal.toISOString().slice(11, 19); // HH:mm:ss
      }
      
      // Se horário foi fornecido separadamente, usar ele
      if (data.horario && !data.data) {
        updateData.horario = data.horario;
      }
      
      // Adicionar timestamp de atualização
      updateData.updated_at = new Date().toISOString();
      
      console.log('📤 Dados para update direto:', updateData);
      
      // Atualizar diretamente na tabela eventos
      const { error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', eventoId)
        .eq('entidade_id', entidadeId);
      
      if (error) {
        console.error('❌ Erro no update direto:', error);
        throw error;
      }
      
      console.log('✅ Evento atualizado com sucesso na tabela!');
      
      toast({
        title: "Evento atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar evento';
      console.error('❌ Erro completo ao atualizar evento:', error);
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