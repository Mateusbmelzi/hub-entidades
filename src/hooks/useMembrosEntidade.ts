import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  MembroEntidade,
  MembroEntidadeComDetalhes,
  AddMembroData,
  CargoEntidade,
} from '@/types/membro-entidade';

interface UseMembrosEntidadeOptions {
  entidadeId?: number;
  includeInativos?: boolean;
  enabled?: boolean;
}

export function useMembrosEntidade(options: UseMembrosEntidadeOptions = {}) {
  const { entidadeId, includeInativos = false, enabled = true } = options;
  const [membros, setMembros] = useState<MembroEntidadeComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembros = useCallback(async () => {
    if (!entidadeId || !enabled) {
      setMembros([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construir query base
      let query = supabase
        .from('membros_entidade')
        .select(`
          *,
          cargo:cargos_entidade(
            id,
            nome,
            descricao,
            nivel_hierarquia,
            cor
          )
        `)
        .eq('entidade_id', entidadeId);

      // Filtrar por ativos se necessário
      if (!includeInativos) {
        query = query.eq('ativo', true);
      }

      // Ordenar por nível hierárquico e nome
      const { data, error: fetchError } = await query.order('data_entrada', { ascending: false });

      if (fetchError) throw fetchError;

      // Buscar dados dos perfis separadamente
      const userIds = (data || []).map((membro: any) => membro.user_id);
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, curso, email')
          .in('id', userIds);
        
        if (profilesError) {
          console.warn('Erro ao buscar perfis:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Criar mapa de perfis para lookup rápido
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Processar os dados para garantir tipagem correta
      const membrosProcessados: MembroEntidadeComDetalhes[] = (data || []).map((membro: any) => ({
        id: membro.id,
        user_id: membro.user_id,
        entidade_id: membro.entidade_id,
        cargo_id: membro.cargo_id,
        data_entrada: membro.data_entrada,
        ativo: membro.ativo,
        created_at: membro.created_at,
        updated_at: membro.updated_at,
        cargo: membro.cargo || undefined,
        profile: profilesMap.get(membro.user_id) || undefined,
      }));

      // Ordenar por nível hierárquico do cargo (menor primeiro = mais importante)
      membrosProcessados.sort((a, b) => {
        const nivelA = a.cargo?.nivel_hierarquia || 999;
        const nivelB = b.cargo?.nivel_hierarquia || 999;
        if (nivelA !== nivelB) return nivelA - nivelB;
        // Se mesmo nível, ordenar por nome
        return (a.profile?.nome || '').localeCompare(b.profile?.nome || '');
      });

      setMembros(membrosProcessados);
    } catch (err) {
      console.error('Erro ao buscar membros:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar membros');
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, [entidadeId, includeInativos, enabled]);

  useEffect(() => {
    fetchMembros();
  }, [fetchMembros]);

  const addMembro = useCallback(
    async (data: AddMembroData): Promise<{ success: boolean; membro?: MembroEntidade; error?: string }> => {
      try {
        // Verificar se o usuário já é membro ativo
        const { data: membroExistente, error: checkError } = await supabase
          .from('membros_entidade')
          .select('id, ativo')
          .eq('user_id', data.user_id)
          .eq('entidade_id', data.entidade_id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (membroExistente?.ativo) {
          toast({
            title: 'Já é membro',
            description: 'Este usuário já é um membro ativo desta organização estudantil.',
            variant: 'destructive',
          });
          return { success: false, error: 'Usuário já é membro ativo' };
        }

        // Se já foi membro mas está inativo, reativar
        if (membroExistente && !membroExistente.ativo) {
          const { data: membroReativado, error: updateError } = await supabase
            .from('membros_entidade')
            .update({
              cargo_id: data.cargo_id,
              ativo: true,
              data_entrada: new Date().toISOString(),
            })
            .eq('id', membroExistente.id)
            .select()
            .single();

          if (updateError) throw updateError;

          toast({
            title: 'Membro reativado',
            description: 'O membro foi reativado com sucesso.',
          });

          await fetchMembros();
          return { success: true, membro: membroReativado };
        }

        // Criar novo membro
        const { data: novoMembro, error: insertError } = await supabase
          .from('membros_entidade')
          .insert({
            user_id: data.user_id,
            entidade_id: data.entidade_id,
            cargo_id: data.cargo_id,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        toast({
          title: 'Membro adicionado',
          description: 'O membro foi adicionado à organização estudantil com sucesso.',
        });

        await fetchMembros();
        return { success: true, membro: novoMembro };
      } catch (err) {
        console.error('Erro ao adicionar membro:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar membro';
        toast({
          title: 'Erro ao adicionar membro',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchMembros, toast]
  );

  const removeMembro = useCallback(
    async (membroId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // Desativar o membro (não deletar, para manter histórico)
        const { error: updateError } = await supabase
          .from('membros_entidade')
          .update({ ativo: false })
          .eq('id', membroId);

        if (updateError) throw updateError;

        toast({
          title: 'Membro removido',
          description: 'O membro foi removido da organização estudantil.',
        });

        await fetchMembros();
        return { success: true };
      } catch (err) {
        console.error('Erro ao remover membro:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao remover membro';
        
        // Verificar se é erro de presidente único
        if (errorMessage.includes('presidente')) {
          toast({
            title: 'Não é possível remover',
            description: 'Não é possível remover o único presidente da organização estudantil. Adicione outro presidente primeiro.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao remover membro',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        
        return { success: false, error: errorMessage };
      }
    },
    [fetchMembros, toast]
  );

  const updateMembroCargo = useCallback(
    async (membroId: string, novoCargoId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error: updateError } = await supabase
          .from('membros_entidade')
          .update({ cargo_id: novoCargoId })
          .eq('id', membroId);

        if (updateError) throw updateError;

        toast({
          title: 'Cargo atualizado',
          description: 'O cargo do membro foi atualizado com sucesso.',
        });

        await fetchMembros();
        return { success: true };
      } catch (err) {
        console.error('Erro ao atualizar cargo:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cargo';
        
        // Verificar se é erro de presidente único
        if (errorMessage.includes('presidente')) {
          toast({
            title: 'Não é possível alterar',
            description: 'Não é possível alterar o cargo do único presidente. Adicione outro presidente primeiro.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao atualizar cargo',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        
        return { success: false, error: errorMessage };
      }
    },
    [fetchMembros, toast]
  );

  const getMembroPorUserId = useCallback(
    (userId: string): MembroEntidadeComDetalhes | undefined => {
      return membros.find((m) => m.user_id === userId && m.ativo);
    },
    [membros]
  );

  const getTotalMembros = useCallback((): number => {
    return membros.filter((m) => m.ativo).length;
  }, [membros]);

  const getTotalPorCargo = useCallback(
    (cargoId: string): number => {
      return membros.filter((m) => m.cargo_id === cargoId && m.ativo).length;
    },
    [membros]
  );

  return {
    membros,
    loading,
    error,
    addMembro,
    removeMembro,
    updateMembroCargo,
    getMembroPorUserId,
    getTotalMembros,
    getTotalPorCargo,
    refetch: fetchMembros,
  };
}

