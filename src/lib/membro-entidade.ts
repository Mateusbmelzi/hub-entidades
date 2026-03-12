import { supabase } from '@/integrations/supabase/client';

export interface EnsureMembroParams {
  user_id: string;
  entidade_id: number;
  cargo_id?: string;
}

export interface EnsureMembroResult {
  success: boolean;
  membro_id?: string;
  error?: string;
}

export interface RemoveMembroResult {
  success: boolean;
  error?: string;
}

export async function getDefaultCargoIdForEntidade(entidadeId: number): Promise<string | null> {
  const { data: cargos, error } = await supabase
    .from('cargos_entidade')
    .select('id')
    .eq('entidade_id', entidadeId)
    .order('nivel_hierarquia', { ascending: false });

  if (error || !cargos?.length) return null;
  return cargos[0].id;
}

export async function ensureMembroEntidade(params: EnsureMembroParams): Promise<EnsureMembroResult> {
  const { user_id, entidade_id, cargo_id: cargoIdParam } = params;

  let cargo_id = cargoIdParam;
  if (!cargo_id) {
    const defaultCargo = await getDefaultCargoIdForEntidade(entidade_id);
    if (!defaultCargo) {
      return { success: false, error: 'Nenhum cargo encontrado para a entidade' };
    }
    cargo_id = defaultCargo;
  }

  const { data: existente, error: checkError } = await supabase
    .from('membros_entidade')
    .select('id, ativo')
    .eq('user_id', user_id)
    .eq('entidade_id', entidade_id)
    .maybeSingle();

  if (checkError) return { success: false, error: checkError.message };

  if (existente?.ativo) {
    return { success: true, membro_id: existente.id };
  }

  const dataEntrada = new Date().toISOString();

  if (existente && !existente.ativo) {
    const { error: updateError } = await supabase
      .from('membros_entidade')
      .update({
        cargo_id,
        ativo: true,
        data_entrada: dataEntrada,
      })
      .eq('id', existente.id);

    if (updateError) return { success: false, error: updateError.message };

    await incrementarNumeroMembros(entidade_id);
    return { success: true, membro_id: existente.id };
  }

  const { data: novo, error: insertError } = await supabase
    .from('membros_entidade')
    .insert({
      user_id,
      entidade_id,
      cargo_id,
    })
    .select('id')
    .single();

  if (insertError) return { success: false, error: insertError.message };
  if (!novo?.id) return { success: false, error: 'Falha ao criar membro' };

  await incrementarNumeroMembros(entidade_id);
  return { success: true, membro_id: novo.id };
}

export async function removeMembroEntidade(membroId: string): Promise<RemoveMembroResult> {
  const { data: membro, error: fetchError } = await supabase
    .from('membros_entidade')
    .select('id, entidade_id')
    .eq('id', membroId)
    .maybeSingle();

  if (fetchError) return { success: false, error: fetchError.message };
  if (!membro) return { success: false, error: 'Membro não encontrado' };

  const { error: deleteProjetoError } = await supabase
    .from('projeto_membros')
    .delete()
    .eq('membro_id', membroId);

  if (deleteProjetoError) return { success: false, error: deleteProjetoError.message };

  const { error: updateError } = await supabase
    .from('membros_entidade')
    .update({ ativo: false })
    .eq('id', membroId);

  if (updateError) return { success: false, error: updateError.message };

  await decrementarNumeroMembros(membro.entidade_id);
  return { success: true };
}

async function incrementarNumeroMembros(entidadeId: number): Promise<void> {
  const { data: entidade, error: e } = await supabase
    .from('entidades')
    .select('numero_membros')
    .eq('id', entidadeId)
    .maybeSingle();

  if (!e && entidade != null) {
    await supabase
      .from('entidades')
      .update({ numero_membros: (entidade.numero_membros ?? 0) + 1 })
      .eq('id', entidadeId);
  }
}

async function decrementarNumeroMembros(entidadeId: number): Promise<void> {
  const { data: entidade, error: e } = await supabase
    .from('entidades')
    .select('numero_membros')
    .eq('id', entidadeId)
    .maybeSingle();

  if (!e && entidade != null) {
    const novoTotal = Math.max(0, (entidade.numero_membros ?? 1) - 1);
    await supabase
      .from('entidades')
      .update({ numero_membros: novoTotal })
      .eq('id', entidadeId);
  }
}
