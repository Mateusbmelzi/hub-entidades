import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EditEventChanges {
  nome?: string | null;
  descricao?: string | null;
  local?: string | null;
  data?: string | null; // YYYY-MM-DD
  horario_inicio?: string | null; // HH:mm
  horario_termino?: string | null; // HH:mm
  capacidade?: number | null;
  link_evento?: string | null;
  area_atuacao?: string[] | null;
}

export const useRequestEditEvento = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const requestEdit = async (eventoId: string, entidadeId: number, changes: EditEventChanges) => {
    try {
      setLoading(true);

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Inserir solicitação
      const { error } = await supabase
        .from('event_edit_requests')
        .insert({
          evento_id: eventoId,
          entidade_id: entidadeId,
          requested_by: user.id,
          changes,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de edição será analisada pelo administrador.'
      });

      return { success: true };
    } catch (err: any) {
      toast({
        title: 'Erro ao solicitar edição',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
      return { success: false, error: err?.message };
    } finally {
      setLoading(false);
    }
  };

  return { requestEdit, loading };
};


