import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateProjetoData {
  nome?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  repositorio_url?: string;
  tecnologias?: string[];
  status?: string;
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
      
      const { error } = await supabase.rpc('update_project_as_entity', {
        _projeto_id: projetoId,
        _entidade_id: entidadeId,
        _nome: data.nome,
        _descricao: data.descricao,
        _data_inicio: data.data_inicio,
        _data_fim: data.data_fim,
        _repositorio_url: data.repositorio_url,
        _tecnologias: data.tecnologias,
        _status: data.status
      });

      if (error) throw error;

      toast({
        title: 'Projeto atualizado',
        description: 'O projeto foi atualizado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o projeto.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProjeto, loading };
};