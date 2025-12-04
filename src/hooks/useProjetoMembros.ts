import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProjetoMembro {
  id: string;
  projeto_id: string;
  membro_id: string;
  eh_responsavel: boolean;
  funcao?: string | null;
  membro?: {
    id: string;
    user_id?: string;
    profile?: {
      id: string;
      nome?: string;
      email?: string;
    };
  };
}

export const useProjetoMembros = (projetoId: string | number | undefined) => {
  const [membros, setMembros] = useState<ProjetoMembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembros = async () => {
    if (!projetoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar projeto_membros com membros_entidade
      const { data: projetoMembrosData, error: projetoMembrosError } = await supabase
        .from('projeto_membros')
        .select(`
          *,
          membro:membros_entidade!inner(
            id,
            user_id
          )
        `)
        .eq('projeto_id', projetoId)
        .order('eh_responsavel', { ascending: false })
        .order('created_at', { ascending: true });

      if (projetoMembrosError) throw projetoMembrosError;

      // Buscar profiles separadamente
      const userIds = (projetoMembrosData || [])
        .map((pm: any) => pm.membro?.user_id)
        .filter(Boolean) as string[];

      let profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
        }
      }

      // Combinar dados
      const membrosComDetalhes = (projetoMembrosData || []).map((pm: any) => ({
        ...pm,
        membro: {
          ...pm.membro,
          profile: pm.membro?.user_id ? profilesMap.get(pm.membro.user_id) : undefined,
        },
      }));

      setMembros(membrosComDetalhes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar membros do projeto';
      setError(errorMessage);
      console.error('Erro ao buscar membros do projeto:', err);
      setMembros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembros();
  }, [projetoId]);

  return {
    membros,
    loading,
    error,
    refetch: fetchMembros,
  };
};

