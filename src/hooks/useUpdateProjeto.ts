import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateProjetoData {
  nome?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  repositorio_url?: string;
  link_apresentacao?: string;
  tecnologias?: string[];
  status?: string;
  imagem_url?: string;
  visivel?: boolean;
}

export const useUpdateProjeto = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProjeto = async (
    projetoId: string, 
    entidadeId: number, 
    data: UpdateProjetoData
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Garantir que valores undefined e strings vazias sejam convertidos para null (PostgreSQL espera null, não undefined ou string vazia)
      // Função auxiliar para validar e limpar valores
      const cleanValue = (value: any): any => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed === '' ? null : trimmed;
        }
        return value;
      };

      // Função auxiliar para validar datas (deve ser YYYY-MM-DD ou null)
      const cleanDate = (value: any): string | null => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') return null;
          // Validar formato YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
          }
          // Se não está no formato correto, retornar null
          return null;
        }
        return null;
      };

      const updateData: Record<string, any> = {
        nome: data.nome,
        descricao: cleanValue(data.descricao),
        data_inicio: cleanDate(data.data_inicio),
        data_fim: cleanDate(data.data_fim),
        repositorio_url: cleanValue(data.repositorio_url),
        link_apresentacao: cleanValue(data.link_apresentacao),
        tecnologias: data.tecnologias && data.tecnologias.length > 0 ? data.tecnologias : null,
        status: data.status,
        // Só atualizar imagem_url se foi fornecido explicitamente
        // Se não foi fornecido, não incluir no updateData para preservar o valor atual
        ...(data.imagem_url !== undefined ? { imagem_url: cleanValue(data.imagem_url) } : {}),
        // Incluir visivel se fornecido
        ...(data.visivel !== undefined ? { visivel: data.visivel } : {}),
      };

      // Tentar usar função RPC primeiro (se existir)
      try {
        console.log('🔄 Tentando atualizar projeto via RPC...');
        const rpcResult = await supabase.rpc('update_project_as_entity', {
          _projeto_id: projetoId,
          _entidade_id: entidadeId,
          _nome: updateData.nome,
          _descricao: updateData.descricao,
          _data_inicio: updateData.data_inicio,
          _data_fim: updateData.data_fim,
          _repositorio_url: updateData.repositorio_url,
          _link_apresentacao: updateData.link_apresentacao,
          _tecnologias: updateData.tecnologias,
          _status: updateData.status,
          _imagem_url: updateData.imagem_url,
          _visivel: updateData.visivel,
        });

        console.log('📥 Resultado da RPC:', { error: rpcResult.error, data: rpcResult.data });

        if (rpcResult.error && rpcResult.error.code !== 'PGRST202' && rpcResult.error.code !== 'PGRST116') {
          // Erro diferente de "função não encontrada"
          console.error('❌ Erro da RPC (não é 404):', rpcResult.error);
          throw rpcResult.error;
        }
        
        if (!rpcResult.error) {
          // RPC funcionou
          console.log('✅ Projeto atualizado com sucesso via RPC');
          toast({
            title: 'Projeto atualizado',
            description: 'O projeto foi atualizado com sucesso.',
          });
          return true;
        } else {
          // RPC não existe (404 ou PGRST202), tentar atualização direta
          console.log('⚠️ RPC retornou erro (provavelmente não existe):', rpcResult.error);
          throw new Error('RPC_NOT_FOUND');
        }
      } catch (rpcError: any) {
        if (rpcError.message === 'RPC_NOT_FOUND' || rpcError.code === 'PGRST202' || rpcError.code === 'PGRST116') {
          // Função RPC não existe ou não encontrada, tentar atualização direta
          console.log('⚠️ Função RPC não encontrada, tentando atualização direta...');
          console.log('📝 Dados para atualização:', updateData);
          console.log('📝 imagem_url incluído?', 'imagem_url' in updateData, 'valor:', updateData.imagem_url);
          console.log('🆔 IDs:', { projetoId, entidadeId });
          
          const { data: updateResult, error: updateError } = await supabase
            .from('projetos')
            .update(updateData)
            .eq('id', projetoId)
            .eq('entidade_id', entidadeId)
            .select();
          
          console.log('📥 Resultado da atualização direta:', { updateError, updateResult, rowsAffected: updateResult?.length });
          
          if (updateError) {
            console.error('❌ Erro na atualização direta:', updateError);
            throw updateError;
          }
          
          // Verificar se alguma linha foi realmente atualizada
          if (!updateResult || updateResult.length === 0) {
            console.warn('⚠️ Nenhuma linha foi atualizada. Possíveis causas:');
            console.warn('   - Projeto não encontrado com os IDs fornecidos');
            console.warn('   - Problema de permissão RLS');
            console.warn('   - entidade_id não corresponde ao projeto');
            
            // Tentar verificar se o projeto existe
            const { data: projetoCheck, error: checkError } = await supabase
              .from('projetos')
              .select('id, entidade_id, nome')
              .eq('id', projetoId)
              .maybeSingle();
            
            console.log('🔍 Verificação do projeto:', { projetoCheck, checkError });
            
            if (checkError) {
              throw new Error(`Erro ao verificar projeto: ${checkError.message}`);
            }
            
            if (!projetoCheck) {
              throw new Error('Projeto não encontrado com o ID fornecido.');
            }
            
            // Comparar entidade_id (pode ser bigint vs number, então converter para número)
            const projetoEntidadeId = Number(projetoCheck.entidade_id);
            const expectedEntidadeId = Number(entidadeId);
            
            console.log('🔍 Comparação de entidade_id:', { 
              projetoEntidadeId, 
              expectedEntidadeId, 
              match: projetoEntidadeId === expectedEntidadeId 
            });
            
            if (projetoEntidadeId !== expectedEntidadeId) {
              throw new Error(`O projeto pertence à entidade ${projetoEntidadeId}, mas você está tentando atualizar como entidade ${expectedEntidadeId}.`);
            }
            
            // Verificar se o usuário é membro da entidade
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              throw new Error('Usuário não autenticado.');
            }
            
            const { data: membroCheck, error: membroError } = await supabase
              .from('membros_entidade')
              .select('id, ativo')
              .eq('user_id', user.id)
              .eq('entidade_id', entidadeId)
              .eq('ativo', true)
              .maybeSingle();
            
            console.log('🔍 Verificação de membro:', { membroCheck, membroError, userId: user.id });
            
            if (membroError) {
              console.warn('⚠️ Erro ao verificar membro:', membroError);
            }
            
            if (!membroCheck) {
              throw new Error('Você não é membro ativo desta entidade. Apenas membros podem atualizar projetos.');
            }
            
            // Se chegou aqui, o projeto existe, o usuário é membro, mas não foi atualizado (provavelmente RLS)
            throw new Error('Não foi possível atualizar o projeto devido a restrições de permissão. Verifique as políticas RLS da tabela projetos no banco de dados.');
          }
          
          // Atualização direta funcionou
          console.log('✅ Projeto atualizado com sucesso via atualização direta');
          toast({
            title: 'Projeto atualizado',
            description: 'O projeto foi atualizado com sucesso.',
          });
          return true;
        } else {
          // Outro erro da RPC
          console.error('❌ Erro da RPC (não é 404):', rpcError);
          throw rpcError;
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar projeto:', error);
      console.error('📋 Detalhes do erro:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      let errorMessage = 'Não foi possível atualizar o projeto.';
      
      // Mensagens de erro mais específicas
      if (error?.code === '42501') {
        errorMessage = 'Sem permissão para atualizar este projeto. Verifique se você é membro da entidade.';
      } else if (error?.code === '23505') {
        errorMessage = 'Erro de duplicação. Este projeto já existe.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProjeto, loading };
};