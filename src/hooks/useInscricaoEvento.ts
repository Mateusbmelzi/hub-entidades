import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InscricaoEventoData {
  nome_participante: string;
  email?: string;
  telefone?: string;
  link_inscricao?: string;
  curso?: string;
  semestre?: number;
  campos_adicionais?: Record<string, unknown>;
}

interface RpcInscricaoResult {
  success: boolean;
  error?: string;
  inscricao_id?: string;
  status?: string;
}

export const useInscricaoEvento = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const inscreverEvento = async (eventoId: string, dadosInscricao: InscricaoEventoData) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('inscrever_evento_atomico', {
        p_evento_id: eventoId,
        p_nome_completo: dadosInscricao.nome_participante,
        p_email: dadosInscricao.email ?? '',
        p_profile_id: user?.id ?? null,
        p_curso: dadosInscricao.curso ?? null,
        p_semestre: dadosInscricao.semestre ?? null,
        p_campos_adicionais: (dadosInscricao.campos_adicionais ?? {}) as Record<string, unknown>,
      });

      if (error) throw error;

      const result = data as unknown as RpcInscricaoResult;

      if (!result.success) {
        toast.error(result.error ?? 'Não foi possível realizar a inscrição.');
        return { success: false, error: result.error };
      }

      if (result.status === 'confirmado') {
        toast.success('Inscrição realizada com sucesso!');
      } else {
        toast.success('Você foi adicionado à lista de espera!');
      }

      queryClient.invalidateQueries({ queryKey: ['evento', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['participantes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['inscritos-evento', eventoId] });
      return { success: true, data: result, status: result.status };
    } catch (err) {
      toast.error('Erro ao realizar inscrição. Tente novamente.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    inscreverEvento,
    loading,
    user,
    profile,
  };
};
