import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEventoData {
  data?: string;
  capacidade?: number | null;
  horario?: string;
  link_evento?: string | null;
  nome?: string;
  descricao?: string | null;
  local?: string | null;
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
      console.log('🆔 IDs:', { eventoId, entidadeId });
      
      // Validações básicas
      if (!eventoId || !entidadeId) {
        throw new Error('IDs do evento e entidade são obrigatórios');
      }
      
      if (!data.nome || data.nome.trim().length === 0) {
        throw new Error('Nome do evento é obrigatório');
      }
      
      // Preparar dados para update direto na tabela
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome.trim();
      if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim() || null;
      if (data.local !== undefined) updateData.local = data.local?.trim() || null;
      if (data.capacidade !== undefined) updateData.capacidade = data.capacidade || null;
      if (data.link_evento !== undefined) updateData.link_evento = data.link_evento?.trim() || null;
      if (data.status !== undefined) updateData.status = data.status;
      
      // Processar data e horário se fornecidos
      if (data.data) {
        try {
          const dataLocal = new Date(data.data);
          if (isNaN(dataLocal.getTime())) throw new Error('Data inválida fornecida');
          
          updateData.data = dataLocal.toISOString().slice(0, 10); // YYYY-MM-DD
          updateData.horario = dataLocal.toISOString().slice(11, 19); // HH:mm:ss
          
          console.log('📅 Data e horário processados:', { 
            data: updateData.data, 
            horario: updateData.horario 
          });
        } catch (error) {
          throw new Error(`Erro ao processar data: ${error instanceof Error ? error.message : 'Data inválida'}`);
        }
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
        throw new Error(`Erro no banco de dados: ${error.message}`);
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