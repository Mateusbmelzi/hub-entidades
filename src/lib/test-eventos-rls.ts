// Script de teste para verificar políticas RLS e carregamento de eventos
import { supabase } from '@/integrations/supabase/client';

export const testEventosRLS = async () => {
  console.log('🧪 Iniciando teste de RLS para eventos...');
  
  try {
    // 1. Testar query básica de eventos
    console.log('1️⃣ Testando query básica de eventos...');
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('id, nome, status_aprovacao')
      .limit(5);
    
    if (eventosError) {
      console.error('❌ Erro na query básica:', eventosError);
      return;
    }
    
    console.log('✅ Query básica funcionou:', eventos?.length || 0, 'eventos encontrados');
    
    // 2. Testar query com join
    console.log('2️⃣ Testando query com join...');
    const { data: eventosComJoin, error: joinError } = await supabase
      .from('eventos')
      .select(`
        id,
        nome,
        status_aprovacao,
        reserva_id,
        entidades(id, nome),
        reservas!left(id, status_reserva)
      `)
      .eq('status_aprovacao', 'aprovado')
      .limit(5);
    
    if (joinError) {
      console.error('❌ Erro na query com join:', joinError);
      return;
    }
    
    console.log('✅ Query com join funcionou:', eventosComJoin?.length || 0, 'eventos encontrados');
    
    // 3. Testar filtro por status_aprovacao
    console.log('3️⃣ Testando filtro por status_aprovacao...');
    const { data: eventosAprovados, error: aprovadosError } = await supabase
      .from('eventos')
      .select('id, nome, status_aprovacao')
      .eq('status_aprovacao', 'aprovado')
      .limit(5);
    
    if (aprovadosError) {
      console.error('❌ Erro no filtro por status:', aprovadosError);
      return;
    }
    
    console.log('✅ Filtro por status funcionou:', eventosAprovados?.length || 0, 'eventos aprovados');
    
    // 4. Testar query exata do useEventos
    console.log('4️⃣ Testando query exata do useEventos...');
    const { data: eventosExatos, error: exatosError } = await supabase
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
      .not('nome', 'like', '%Evento de sala%')
      .not('nome', 'like', '%Evento de auditório%')
      .not('nome', 'like', '%Reserva de Sala%')
      .not('nome', 'like', '%Reserva de Auditório%')
      .not('nome', 'like', '%Reserva de sala%')
      .not('nome', 'like', '%Reserva de auditório%')
      .not('nome', 'like', '%Evento de Sala%')
      .not('nome', 'like', '%Evento de Auditório%')
      .order('data', { ascending: false })
      .order('horario_inicio', { ascending: false })
      .range(0, 4);
    
    if (exatosError) {
      console.error('❌ Erro na query exata do useEventos:', exatosError);
      return;
    }
    
    console.log('✅ Query exata do useEventos funcionou:', eventosExatos?.length || 0, 'eventos encontrados');
    
    // 5. Mostrar detalhes dos eventos encontrados
    if (eventosExatos && eventosExatos.length > 0) {
      console.log('📋 Detalhes dos eventos encontrados:');
      eventosExatos.forEach((evento, index) => {
        console.log(`${index + 1}. ${evento.nome} (${evento.status_aprovacao}) - Reserva: ${evento.reserva_id ? 'Sim' : 'Não'}`);
        if (evento.reservas) {
          const reserva = Array.isArray(evento.reservas) ? evento.reservas[0] : evento.reservas;
          console.log(`   Status da reserva: ${reserva?.status_reserva || 'N/A'}`);
        }
      });
    } else {
      console.log('⚠️ Nenhum evento encontrado com os critérios do useEventos');
    }
    
    console.log('✅ Teste de RLS concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
};

// Função para testar diretamente no console
(window as any).testEventosRLS = testEventosRLS;
