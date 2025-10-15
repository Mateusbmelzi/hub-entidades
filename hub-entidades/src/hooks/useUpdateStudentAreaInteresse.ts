import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateStudentAreaInteresseData {
  area_interesse?: string;
}

export const useUpdateStudentAreaInteresse = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateStudentAreaInteresse = async (userId: string, data: UpdateStudentAreaInteresseData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('update_student_area_interesse', {
        _user_id: userId,
        _area_interesse: data.area_interesse
      });

      if (error) throw error;

      toast({
        title: 'Área de interesse atualizada',
        description: 'Sua área de interesse foi atualizada com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar área de interesse:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar sua área de interesse.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStudentAreaInteresse, loading };
}; 