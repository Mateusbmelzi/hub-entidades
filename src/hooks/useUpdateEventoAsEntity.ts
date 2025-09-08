import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEventoData {
  data?: string;
  capacidade?: number | null;
  horario_inicio?: string;
  horario_termino?: string;
  link_evento?: string | null;
  nome?: string;
  descricao?: string | null;
  local?: string | null;
  status?: string;
  area_atuacao?: string[];
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
      
      // Validar capacidade se fornecida
      if (data.capacidade !== undefined && data.capacidade !== null) {
        if (data.capacidade <= 0) {
          throw new Error('Capacidade deve ser maior que 0');
        }
      }
      
      // Validar status se fornecido
      if (data.status && !['ativo', 'cancelado', 'finalizado'].includes(data.status)) {
        throw new Error('Status deve ser: ativo, cancelado ou finalizado');
      }
      
      // Preparar dados para update direto na tabela
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome.trim();
      if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim() || null;
      if (data.local !== undefined) updateData.local = data.local?.trim() || null;
      if (data.capacidade !== undefined) updateData.capacidade = data.capacidade || null;
      if (data.link_evento !== undefined) updateData.link_evento = data.link_evento?.trim() || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.area_atuacao !== undefined) updateData.area_atuacao = data.area_atuacao;
      
      // Processar data se fornecida
      if (data.data) {
        try {
          const dataLocal = new Date(data.data);
          if (isNaN(dataLocal.getTime())) throw new Error('Data inválida fornecida');
          
          // Extrair data no formato YYYY-MM-DD
          updateData.data = dataLocal.toISOString().slice(0, 10);
          
          console.log('📅 Data processada:', { 
            data: updateData.data
          });
          console.log('📅 Data original:', dataLocal.toISOString());
          console.log('📅 Data local:', dataLocal.toLocaleString('pt-BR'));
        } catch (error) {
          throw new Error(`Erro ao processar data: ${error instanceof Error ? error.message : 'Data inválida'}`);
        }
      }
      
      // Processar horários se fornecidos
      if (data.horario_inicio) {
        updateData.horario_inicio = data.horario_inicio;
      }
      if (data.horario_termino) {
        updateData.horario_termino = data.horario_termino;
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