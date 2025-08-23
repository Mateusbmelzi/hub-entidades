import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateEventoData {
  nome: string;
  descricao?: string;
  local?: string;
  data_evento: string; // Mantemos para compatibilidade com o frontend
  capacidade?: number;
  link_evento?: string;
  area_atuacao?: string[];
}

export const useCreateEventoAsEntity = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkEventNameExists = async (entidadeId: number, nome: string) => {
    console.log('🔍 Verificando se nome do evento existe:', { entidadeId, nome });
    
    const { data, error } = await supabase
      .from('eventos')
      .select('id')
      .eq('entidade_id', entidadeId)
      .eq('nome', nome)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao verificar nome do evento:', error);
      throw error;
    }
    
    const exists = data && data.length > 0;
    console.log('📊 Nome do evento existe?', exists);
    return exists;
  };

  const createEvento = async (entidadeId: number, data: CreateEventoData, forceCreate: boolean = false) => {
    try {
      console.log('🚀 Iniciando criação de evento:', { entidadeId, data, forceCreate });
      setLoading(true);
      
      // Check if event name already exists (unless forcing creation)
      if (!forceCreate) {
        const nameExists = await checkEventNameExists(entidadeId, data.nome);
        if (nameExists) {
          console.log('⚠️ Nome do evento já existe');
          return { success: false, nameExists: true };
        }
      }
      
      console.log('📞 Chamando RPC create_event_as_entity_pending com:', {
        _entidade_id: entidadeId,
        _nome: data.nome,
        _data_evento: data.data_evento,
        _descricao: data.descricao,
        _local: data.local,
        _capacidade: data.capacidade,
        _link_evento: data.link_evento,
        _area_atuacao: data.area_atuacao
      });
      
      // Tentar usar a função RPC primeiro
      let result, error;
      try {
        const rpcResult = await supabase.rpc('create_event_as_entity_pending', {
          _entidade_id: entidadeId,
          _nome: data.nome,
          _data_evento: data.data_evento,
          _descricao: data.descricao,
          _local: data.local,
          _capacidade: data.capacidade,
          _link_evento: data.link_evento,
          _area_atuacao: data.area_atuacao
        });
        result = rpcResult.data;
        error = rpcResult.error;
      } catch (rpcError) {
        console.log('⚠️ RPC falhou, tentando inserção direta:', rpcError);
        error = rpcError;
      }

      // Se a RPC falhou, tentar inserção direta
      if (error) {
        console.log('🔄 Tentando inserção direta na tabela eventos...');
        
        // Separar data e horário para compatibilidade com a estrutura atual
        const eventDate = new Date(data.data_evento);
        const dataStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const horarioStr = eventDate.toTimeString().slice(0, 5); // HH:MM
        
        const { data: insertResult, error: insertError } = await supabase
          .from('eventos')
          .insert({
            entidade_id: entidadeId,
            nome: data.nome,
            descricao: data.descricao,
            local: data.local,
            data: dataStr,
            horario: horarioStr,
            capacidade: data.capacidade,
            link_evento: data.link_evento,
            area_atuacao: data.area_atuacao,
            status_aprovacao: 'pendente' // Campo correto para aprovação
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('❌ Erro na inserção direta:', insertError);
          throw insertError;
        }

        result = insertResult.id;
        console.log('✅ Evento criado diretamente na tabela, ID:', result);
      } else {
        console.log('✅ Evento criado via RPC, ID:', result);
      }

      toast({
        title: "Evento criado com sucesso!",
        description: "O evento foi criado e está aguardando aprovação do super admin.",
      });

      return { success: true, eventoId: result };
    } catch (error) {
      console.error('❌ Erro completo ao criar evento:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar evento';
      
      toast({
        title: "Erro ao criar evento",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { createEvento, checkEventNameExists, loading };
};