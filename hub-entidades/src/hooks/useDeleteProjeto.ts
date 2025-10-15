import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteProjeto = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteProjeto = async (projetoId: string, entidadeId: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('delete_project_as_entity', {
        _projeto_id: projetoId,
        _entidade_id: entidadeId
      });

      if (error) throw error;

      toast({
        title: 'Projeto removido',
        description: 'O projeto foi removido com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o projeto.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProjeto, loading };
};