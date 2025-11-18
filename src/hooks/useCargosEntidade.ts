import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  CargoEntidade,
  CargoComPermissoes,
  CreateCargoData,
  UpdateCargoData,
  PermissaoCargo,
  Permissao,
} from '@/types/membro-entidade';

interface UseCargosEntidadeOptions {
  entidadeId?: number;
  includePermissoes?: boolean;
  includeTotalMembros?: boolean;
  enabled?: boolean;
}

export function useCargosEntidade(options: UseCargosEntidadeOptions = {}) {
  const { entidadeId, includePermissoes = false, includeTotalMembros = false, enabled = true } = options;
  const [cargos, setCargos] = useState<CargoComPermissoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCargos = useCallback(async () => {
    if (!entidadeId || !enabled) {
      setCargos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar cargos: se for owner (flag global definida na página), usar RPC
      let cargosData: any[] | null = null;
      let cargosError: any = null;
      const isOwnerEntity = typeof window !== 'undefined' && (window as any).isOwnerEntity;
      if (isOwnerEntity) {
        const { data, error } = await supabase.rpc('entity_list_cargos', { _entidade_id: entidadeId });
        cargosData = (data as any[]) || [];
        cargosError = error;
      } else {
        const { data, error } = await supabase
          .from('cargos_entidade')
          .select('*')
          .eq('entidade_id', entidadeId)
          .order('nivel_hierarquia', { ascending: true });
        cargosData = data || [];
        cargosError = error;
      }

      if (cargosError) throw cargosError;

      let cargosComDetalhes: CargoComPermissoes[] = cargosData || [];

      // Buscar permissões se solicitado
      if (includePermissoes && cargosData) {
        const cargoIds = cargosData.map((c) => c.id);
        const { data: permissoesData, error: permissoesError } = await supabase
          .from('permissoes_cargo')
          .select('*')
          .in('cargo_id', cargoIds);

        if (permissoesError) throw permissoesError;

        cargosComDetalhes = cargosData.map((cargo) => ({
          ...cargo,
          permissoes: permissoesData?.filter((p) => p.cargo_id === cargo.id) || [],
        }));
      }

      // Buscar total de membros se solicitado
      if (includeTotalMembros && cargosData) {
        const cargoIds = cargosData.map((c) => c.id);
        const { data: membrosData, error: membrosError } = await supabase
          .from('membros_entidade')
          .select('cargo_id')
          .in('cargo_id', cargoIds)
          .eq('ativo', true);

        if (membrosError) throw membrosError;

        cargosComDetalhes = cargosComDetalhes.map((cargo) => ({
          ...cargo,
          total_membros: membrosData?.filter((m) => m.cargo_id === cargo.id).length || 0,
        }));
      }

      setCargos(cargosComDetalhes);
    } catch (err) {
      console.error('Erro ao buscar cargos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar cargos');
      setCargos([]);
    } finally {
      setLoading(false);
    }
  }, [entidadeId, includePermissoes, includeTotalMembros, enabled]);

  useEffect(() => {
    fetchCargos();
  }, [fetchCargos]);

  const createCargo = useCallback(
    async (data: CreateCargoData): Promise<{ success: boolean; cargo?: CargoEntidade; error?: string }> => {
      try {
        const isOwnerEntity = typeof window !== 'undefined' && (window as any).isOwnerEntity;
        let novoCargo: any = null;
        if (isOwnerEntity) {
          const { data: rpcData, error: rpcError } = await supabase.rpc('entity_create_cargo', {
            _entidade_id: data.entidade_id,
            _nome: data.nome,
            _descricao: data.descricao ?? null,
            _nivel: data.nivel_hierarquia,
            _cor: data.cor ?? null,
            _permissoes: data.permissoes || [],
            _as_entity_owner: true, // Presidente autenticado via useEntityAuth
          });
          if (rpcError) throw rpcError;
          novoCargo = rpcData as any;
        } else {
          const { data: insertData, error: cargoError } = await supabase
            .from('cargos_entidade')
            .insert({
              entidade_id: data.entidade_id,
              nome: data.nome,
              descricao: data.descricao,
              nivel_hierarquia: data.nivel_hierarquia,
              cor: data.cor,
            })
            .select()
            .single();
          if (cargoError) throw cargoError;
          novoCargo = insertData;
          if (data.permissoes && data.permissoes.length > 0) {
            const permissoesInsert = data.permissoes.map((permissao) => ({
              cargo_id: novoCargo.id,
              permissao,
            }));
            const { error: permissoesError } = await supabase
              .from('permissoes_cargo')
              .insert(permissoesInsert);
            if (permissoesError) throw permissoesError;
          }
        }

        toast({
          title: 'Cargo criado',
          description: `O cargo "${data.nome}" foi criado com sucesso.`,
        });

        await fetchCargos();
        return { success: true, cargo: novoCargo };
      } catch (err) {
        console.error('Erro ao criar cargo:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cargo';
        toast({
          title: 'Erro ao criar cargo',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchCargos, toast]
  );

  const updateCargo = useCallback(
    async (
      cargoId: string,
      data: UpdateCargoData
    ): Promise<{ success: boolean; cargo?: CargoEntidade; error?: string }> => {
      try {
        const isOwnerEntity = typeof window !== 'undefined' && (window as any).isOwnerEntity;
        
        // Se for owner, usar RPC que permite presidente autenticado
        if (isOwnerEntity) {
          const { data: cargoAtualizado, error: rpcError } = await supabase.rpc('entity_update_cargo', {
            _cargo_id: cargoId,
            _nome: data.nome ?? null,
            _descricao: data.descricao ?? null,
            _nivel: data.nivel_hierarquia ?? null,
            _cor: data.cor ?? null,
            _permissoes: data.permissoes ?? null,
            _as_entity_owner: true, // Presidente autenticado via useEntityAuth
          });
          
          if (rpcError) throw rpcError;
          
          // Atualizar permissões se fornecidas
          if (data.permissoes !== undefined) {
            // As permissões já foram atualizadas pela RPC
          }
          
          toast({
            title: 'Cargo atualizado',
            description: 'O cargo foi atualizado com sucesso.',
          });

          await fetchCargos();
          return { success: true, cargo: cargoAtualizado as any };
        }
        
        // Atualizar o cargo (apenas campos não-undefined) - modo normal
        const updateData: Partial<CargoEntidade> = {};
        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.descricao !== undefined) updateData.descricao = data.descricao;
        if (data.nivel_hierarquia !== undefined) updateData.nivel_hierarquia = data.nivel_hierarquia;
        if (data.cor !== undefined) updateData.cor = data.cor;

        if (Object.keys(updateData).length > 0) {
          const { data: cargoAtualizado, error: cargoError } = await supabase
            .from('cargos_entidade')
            .update(updateData)
            .eq('id', cargoId)
            .select()
            .single();

          if (cargoError) throw cargoError;
        }

        // Atualizar permissões se fornecidas
        if (data.permissoes !== undefined) {
          // Remover permissões antigas
          const { error: deleteError } = await supabase
            .from('permissoes_cargo')
            .delete()
            .eq('cargo_id', cargoId);

          if (deleteError) throw deleteError;

          // Inserir novas permissões
          if (data.permissoes.length > 0) {
            const permissoesInsert = data.permissoes.map((permissao) => ({
              cargo_id: cargoId,
              permissao,
            }));

            const { error: insertError } = await supabase
              .from('permissoes_cargo')
              .insert(permissoesInsert);

            if (insertError) throw insertError;
          }
        }

        toast({
          title: 'Cargo atualizado',
          description: 'O cargo foi atualizado com sucesso.',
        });

        await fetchCargos();
        return { success: true };
      } catch (err) {
        console.error('Erro ao atualizar cargo:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cargo';
        toast({
          title: 'Erro ao atualizar cargo',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchCargos, toast]
  );

  const deleteCargo = useCallback(
    async (cargoId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // Verificar se há membros com este cargo
        const { data: membros, error: checkError } = await supabase
          .from('membros_entidade')
          .select('id')
          .eq('cargo_id', cargoId)
          .eq('ativo', true)
          .limit(1);

        if (checkError) throw checkError;

        if (membros && membros.length > 0) {
          toast({
            title: 'Não é possível excluir',
            description: 'Este cargo possui membros ativos. Remova ou transfira os membros primeiro.',
            variant: 'destructive',
          });
          return { success: false, error: 'Cargo possui membros ativos' };
        }

        const isOwnerEntity = typeof window !== 'undefined' && (window as any).isOwnerEntity;
        let deleteError: any = null;
        if (isOwnerEntity) {
          const { error } = await supabase.rpc('entity_delete_cargo', { 
            _cargo_id: cargoId,
            _as_entity_owner: true, // Presidente autenticado via useEntityAuth
          });
          deleteError = error;
        } else {
          const { error } = await supabase
            .from('cargos_entidade')
            .delete()
            .eq('id', cargoId);
          deleteError = error;
        }

        if (deleteError) throw deleteError;

        toast({
          title: 'Cargo excluído',
          description: 'O cargo foi excluído com sucesso.',
        });

        await fetchCargos();
        return { success: true };
      } catch (err) {
        console.error('Erro ao excluir cargo:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cargo';
        toast({
          title: 'Erro ao excluir cargo',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchCargos, toast]
  );

  const getCargoById = useCallback(
    (cargoId: string): CargoComPermissoes | undefined => {
      return cargos.find((c) => c.id === cargoId);
    },
    [cargos]
  );

  return {
    cargos,
    loading,
    error,
    createCargo,
    updateCargo,
    deleteCargo,
    getCargoById,
    refetch: fetchCargos,
  };
}

