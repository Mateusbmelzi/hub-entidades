import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Entidade } from './useEntidade';


interface UpdateEntidadeData {
  nome?: string;
  descricao_curta?: string;
  descricao_detalhada?: string;
  numero_membros?: number;
  contato?: string;
  site_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  local_apresentacao?: string;
  horario_apresentacao?: string;
  local_feira?: string;
  ano_criacao?: number;
  area_atuacao?: string[];
  areas_internas?: string[];
  feira_ativa?: boolean;
  processo_seletivo_ativo?: boolean;
  link_processo_seletivo?: string;
  abertura_processo_seletivo?: string;
  fechamento_processo_seletivo?: string;
  numero_total_fases?: number;
  data_primeira_fase?: string;
  encerramento_primeira_fase?: string;
  data_segunda_fase?: string;
  encerramento_segunda_fase?: string;
  data_terceira_fase?: string;
  encerramento_terceira_fase?: string;
}

export const useUpdateEntidade = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateEntidade = async (id: number, data: UpdateEntidadeData): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🔧 Tentando atualizar entidade:', { id, data });
      console.log('🔧 Tipo do ID:', typeof id);
      console.log('🔧 Dados recebidos:', JSON.stringify(data, null, 2));
      console.log('🔧 area_atuacao específica:', data.area_atuacao);
      console.log('🔧 Tipo de area_atuacao:', typeof data.area_atuacao);
      console.log('🔧 É array?', Array.isArray(data.area_atuacao));
      
      // Tentar atualização direta da tabela primeiro
      console.log('🔄 Tentando atualização direta da tabela...');
              const { error: updateError, data: updateResult } = await supabase
          .from('entidades')
                           .update({
          nome: data.nome,
          descricao_curta: data.descricao_curta,
          descricao_detalhada: data.descricao_detalhada,
          numero_membros: data.numero_membros,
          contato: data.contato,
          site_url: data.site_url,
          linkedin_url: data.linkedin_url,
          instagram_url: data.instagram_url,
          local_apresentacao: data.local_apresentacao,
          horario_apresentacao: data.horario_apresentacao,
          local_feira: data.local_feira,
          ano_criacao: data.ano_criacao,
          area_atuacao: data.area_atuacao,
          areas_internas: data.areas_internas,
          feira_ativa: data.feira_ativa,
          processo_seletivo_ativo: data.processo_seletivo_ativo,
          link_processo_seletivo: data.link_processo_seletivo,
          data_primeira_fase: data.data_primeira_fase,
          encerramento_primeira_fase: data.encerramento_primeira_fase,
          data_segunda_fase: data.data_segunda_fase,
          encerramento_segunda_fase: data.encerramento_segunda_fase,
          data_terceira_fase: data.data_terceira_fase,
          encerramento_terceira_fase: data.encerramento_terceira_fase,
          abertura_processo_seletivo: data.abertura_processo_seletivo,
          fechamento_processo_seletivo: data.fechamento_processo_seletivo,
          numero_total_fases: data.numero_total_fases,
        })
        .eq('id', id)
        .select();

      console.log('📥 Resposta da atualização direta:', { updateError, updateResult });

      if (updateError) {
        console.error('❌ Erro na atualização direta:', updateError);
        
        // Se a atualização direta falhar, tentar a função RPC como fallback
        console.log('🔄 Tentando função RPC como fallback...');
                 const { error: rpcError, data: rpcResult } = await supabase.rpc('update_entity_as_entity', {
           _entidade_id: id,
           _nome: data.nome,
           _descricao_curta: data.descricao_curta,
           _descricao_detalhada: data.descricao_detalhada,
           _numero_membros: data.numero_membros,
           _contato: data.contato,
           _site: data.site_url,
           _linkedin: data.linkedin_url,
           _instagram: data.instagram_url,
           _local_palestra: data.local_apresentacao,
           _informacoes_feira: data.local_feira,
           _area_atuacao: data.area_atuacao,
          //  _data_primeira_fase: data.data_primeira_fase,
          //  _encerramento_primeira_fase: data.encerramento_primeira_fase,
          //  _data_segunda_fase: data.data_segunda_fase,
          //  _encerramento_segunda_fase: data.encerramento_segunda_fase,
          //  _data_terceira_fase: data.data_terceira_fase,
          //  _encerramento_terceira_fase: data.encerramento_terceira_fase



         });

        console.log('📥 Resposta da função RPC:', { rpcError, rpcResult });

        if (rpcError) {
          console.error('❌ Erro da função RPC:', rpcError);
          throw rpcError;
        }
      }

      console.log('✅ Entidade atualizada com sucesso');

      toast({
        title: 'Entidade atualizada',
        description: 'Os dados da entidade foram atualizados com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar entidade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados da entidade.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateEntidade, loading };
};