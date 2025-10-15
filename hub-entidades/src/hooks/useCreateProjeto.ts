import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateProjetoData {
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  repositorio_url?: string;
  tecnologias?: string[];
  status?: string;
  entidade_id: number;
}

export const useCreateProjeto = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createProjeto = async (projectData: CreateProjetoData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('create_project_as_entity', {
        _entidade_id: projectData.entidade_id,
        _nome: projectData.nome,
        _descricao: projectData.descricao,
        _data_inicio: projectData.data_inicio,
        _data_fim: projectData.data_fim,
        _repositorio_url: projectData.repositorio_url,
        _tecnologias: projectData.tecnologias,
        _status: projectData.status
      });

      if (error) throw error;

      toast({
        title: 'Projeto criado',
        description: 'O projeto foi criado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o projeto.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createProjeto, loading };
};