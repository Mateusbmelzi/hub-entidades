import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateProjetoData {
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  repositorio_url?: string;
  link_apresentacao?: string;
  tecnologias?: string[];
  status?: string;
  entidade_id: number;
  membro_id: string;
  imagem_url?: string;
  visivel?: boolean;
}

export const useCreateProjeto = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createProjeto = async (projectData: CreateProjetoData): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados para inserção (apenas campos que existem na tabela)
      const projetoInsert: Record<string, any> = {
        entidade_id: projectData.entidade_id,
        nome: projectData.nome,
        descricao: projectData.descricao || null,
        data_inicio: projectData.data_inicio || null,
        data_fim: projectData.data_fim || null,
        repositorio_url: projectData.repositorio_url || null,
        link_apresentacao: projectData.link_apresentacao || null,
        tecnologias: projectData.tecnologias || [],
        status: projectData.status || 'ativo',
        imagem_url: projectData.imagem_url || null,
        visivel: projectData.visivel ?? false,
      };

      // Removido imagem_url e categoria pois não existem na tabela

      // Tentar usar função RPC primeiro (se existir)
      let projetoData: any = null;
      let error: any = null;

      try {
        // Garantir que valores undefined sejam convertidos para null (PostgreSQL espera null, não undefined)
        const rpcResult = await supabase.rpc('create_project_as_entity', {
          _entidade_id: projectData.entidade_id,
          _nome: projectData.nome,
          _descricao: projectData.descricao ?? null,
          _data_inicio: projectData.data_inicio ?? null,
          _data_fim: projectData.data_fim ?? null,
          _repositorio_url: projectData.repositorio_url ?? null,
          _link_apresentacao: projectData.link_apresentacao ?? null,
          _tecnologias: projectData.tecnologias ?? [],
          _status: projectData.status ?? 'ativo',
          _imagem_url: projectData.imagem_url ?? null,
          _visivel: projectData.visivel ?? false,
        });
        
        if (rpcResult.error && rpcResult.error.code !== 'PGRST202') {
          // Erro diferente de "função não encontrada"
          throw rpcResult.error;
        }
        
        if (!rpcResult.error && rpcResult.data) {
          // RPC funcionou
          projetoData = rpcResult.data;
        } else {
          // RPC não existe, tentar inserção direta
          throw new Error('RPC_NOT_FOUND');
        }
      } catch (rpcError: any) {
        if (rpcError.message === 'RPC_NOT_FOUND' || rpcError.code === 'PGRST202') {
          // Função RPC não existe, tentar inserção direta
          console.log('⚠️ Função RPC não encontrada, tentando inserção direta...');
          
          const insertResult = await supabase
            .from('projetos')
            .insert(projetoInsert)
            .select()
            .single();
          
          projetoData = insertResult.data;
          error = insertResult.error;
        } else {
          // Outro erro da RPC
          error = rpcError;
        }
      }

      if (error) {
        // Se o erro for de RLS, fornecer mensagem mais clara
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          throw new Error('Permissão negada: A função RPC create_project_as_entity precisa ser criada no banco de dados para permitir a criação de projetos.');
        }
        throw error;
      }

      // Vincular membro ao projeto após criação
      // Obter o ID do projeto criado (pode vir da RPC ou da inserção direta)
      let projetoId: string | number | undefined;
      
      if (projetoData) {
        // A RPC pode retornar o ID diretamente ou um objeto com id
        if (typeof projetoData === 'string' || typeof projetoData === 'number') {
          projetoId = projetoData;
        } else if (projetoData.id) {
          projetoId = projetoData.id;
        } else if (Array.isArray(projetoData) && projetoData.length > 0) {
          projetoId = projetoData[0].id || projetoData[0];
        }
      }

      // Atualizar imagem do projeto se foi fornecida e não foi incluída na criação
      if (projetoId && projectData.imagem_url) {
        const { error: imagemError } = await supabase
          .from('projetos')
          .update({ imagem_url: projectData.imagem_url })
          .eq('id', projetoId);

        if (imagemError) {
          console.error('Erro ao atualizar imagem do projeto:', imagemError);
          // Não falhar a criação do projeto se a atualização da imagem falhar
          toast({
            title: 'Aviso',
            description: 'Projeto criado, mas houve um problema ao associar a imagem. Você pode adicionar a imagem depois.',
            variant: 'default',
          });
        } else {
          console.log('✅ Imagem do projeto atualizada com sucesso');
        }
      }

      if (projetoId && projectData.membro_id) {
        // Inserir na tabela projeto_membros com o membro responsável
        const { error: membroError } = await supabase
          .from('projeto_membros')
          .insert({
            projeto_id: projetoId,
            membro_id: projectData.membro_id,
            eh_responsavel: true, // O membro selecionado na criação é o responsável principal
            funcao: projectData.funcao || null, // Função do membro no projeto (se fornecida)
          });

        if (membroError) {
          console.error('Erro ao vincular membro ao projeto:', membroError);
          // Não falhar a criação do projeto se o vínculo falhar, mas logar o erro
          toast({
            title: 'Aviso',
            description: 'Projeto criado, mas houve um problema ao vincular o membro. Você pode adicionar o membro manualmente depois.',
            variant: 'default',
          });
        } else {
          console.log('✅ Membro vinculado ao projeto com sucesso');
        }
      }

      toast({
        title: 'Projeto criado',
        description: 'O projeto foi criado com sucesso.',
      });

      // Retornar o ID do projeto criado
      return projetoId as string || null;
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      
      let errorMessage = 'Não foi possível criar o projeto.';
      
      if (error.message?.includes('row-level security') || error.code === '42501') {
        errorMessage = 'Permissão negada: É necessário criar a função RPC create_project_as_entity no banco de dados para permitir a criação de projetos.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createProjeto, loading };
};