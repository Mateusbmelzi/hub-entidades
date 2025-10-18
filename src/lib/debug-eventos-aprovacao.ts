// Script de debug para verificar eventos aprovados
import { supabase } from '@/integrations/supabase/client';

export const debugEventosAprovacao = async () => {
  console.log('🔍 DEBUG: Verificando eventos aprovados...');
  
  try {
    // 1. Buscar todos os eventos
    const { data: allEventos, error: allError } = await supabase
      .from('eventos')
      .select(`
        id,
        nome,
        status_aprovacao,
        data_evento,
        data,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erro ao buscar todos os eventos:', allError);
      return;
    }

    console.log('📊 Total de eventos encontrados:', allEventos?.length || 0);
    console.log('📋 Todos os eventos:', allEventos);

    // 2. Buscar apenas eventos aprovados
    const { data: eventosAprovados, error: aprovadosError } = await supabase
      .from('eventos')
      .select(`
        id,
        nome,
        status_aprovacao,
        data_evento,
        data,
        created_at,
        updated_at
      `)
      .eq('status_aprovacao', 'aprovado')
      .order('created_at', { ascending: false });

    if (aprovadosError) {
      console.error('❌ Erro ao buscar eventos aprovados:', aprovadosError);
      return;
    }

    console.log('✅ Eventos aprovados encontrados:', eventosAprovados?.length || 0);
    console.log('📋 Eventos aprovados:', eventosAprovados);

    // 3. Verificar estrutura da tabela
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'eventos')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Erro ao buscar estrutura da tabela:', tableError);
    } else {
      console.log('🏗️ Estrutura da tabela eventos:', tableInfo);
    }

    // 4. Testar query exata do useEventos
    const { data: queryTest, error: queryError } = await supabase
      .from('eventos')
      .select(`
        *,
        entidades(id, nome, foto_perfil_url),
        reservas!left(
          id,
          motivo_reserva,
          professores_convidados_json,
          status_reserva
        )
      `)
      .eq('status_aprovacao', 'aprovado')
      .neq('status', 'cancelado')
      .order('data', { ascending: false })
      .range(0, 7);

    if (queryError) {
      console.error('❌ Erro na query de teste:', queryError);
    } else {
      console.log('🧪 Query de teste (useEventos):', queryTest?.length || 0, 'eventos');
      console.log('📋 Resultado da query:', queryTest);
    }

  } catch (error) {
    console.error('❌ Erro geral no debug:', error);
  }
};

// Função para testar aprovação de um evento específico
export const testAprovarEvento = async (eventoId: string) => {
  console.log('🧪 TESTE: Aprovando evento', eventoId);
  
  try {
    // Buscar evento antes da aprovação
    const { data: eventoAntes, error: antesError } = await supabase
      .from('eventos')
      .select('id, nome, status_aprovacao, data_aprovacao')
      .eq('id', eventoId)
      .single();

    if (antesError) {
      console.error('❌ Erro ao buscar evento antes:', antesError);
      return;
    }

    console.log('📋 Evento ANTES da aprovação:', eventoAntes);

    // Aprovar evento
    const { data, error } = await supabase.rpc('aprovar_evento', {
      _evento_id: eventoId,
      _status_aprovacao: 'aprovado',
      _comentario_aprovacao: 'Teste de aprovação via debug'
    });

    console.log('📋 Resposta da função aprovar_evento:', { data, error });

    if (error) {
      console.error('❌ Erro ao aprovar evento:', error);
      return;
    }

    // Buscar evento depois da aprovação
    const { data: eventoDepois, error: depoisError } = await supabase
      .from('eventos')
      .select('id, nome, status_aprovacao, data_aprovacao, comentario_aprovacao')
      .eq('id', eventoId)
      .single();

    if (depoisError) {
      console.error('❌ Erro ao buscar evento depois:', depoisError);
      return;
    }

    console.log('📋 Evento DEPOIS da aprovação:', eventoDepois);

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
};
