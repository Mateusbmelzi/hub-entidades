import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔄 Iniciando atualização dos indicadores gerais...')

    // Step 1: Clear existing data
    console.log('🗑️ Limpando dados existentes...')
    const { error: deleteError } = await supabaseClient
      .from('indicadores_gerais')
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('❌ Erro ao limpar dados existentes:', deleteError)
      throw deleteError
    }

    console.log('✅ Dados existentes removidos com sucesso')

    // Step 2: Calculate indicators
    console.log('🧮 Calculando indicadores gerais...')
    
    // 1. Total de alunos (profiles)
    const { count: totalAlunos, error: totalAlunosError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalAlunosError) {
      console.error('❌ Erro ao contar total de alunos:', totalAlunosError)
      throw totalAlunosError
    }

    // 2. Total de entidades ativas
    const { count: totalEntidades, error: totalEntidadesError } = await supabaseClient
      .from('entidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo')

    if (totalEntidadesError) {
      console.error('❌ Erro ao contar total de entidades:', totalEntidadesError)
      throw totalEntidadesError
    }

    // 3. Total de demonstrações de interesse
    const { count: totalDemonstracoes, error: totalDemonstracoesError } = await supabaseClient
      .from('demonstracoes_interesse')
      .select('*', { count: 'exact', head: true })

    if (totalDemonstracoesError) {
      console.error('❌ Erro ao contar total de demonstrações:', totalDemonstracoesError)
      throw totalDemonstracoesError
    }

    // 4. Total de eventos
    const { count: totalEventos, error: totalEventosError } = await supabaseClient
      .from('eventos')
      .select('*', { count: 'exact', head: true })

    if (totalEventosError) {
      console.error('❌ Erro ao contar total de eventos:', totalEventosError)
      throw totalEventosError
    }

    // 5. Eventos aprovados
    const { count: eventosAprovados, error: eventosAprovadosError } = await supabaseClient
      .from('eventos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aprovado')

    if (eventosAprovadosError) {
      console.error('❌ Erro ao contar eventos aprovados:', eventosAprovadosError)
      throw eventosAprovadosError
    }

    // 6. Total de inscrições em eventos
    const { count: totalInscricoes, error: totalInscricoesError } = await supabaseClient
      .from('participantes_evento')
      .select('*', { count: 'exact', head: true })

    if (totalInscricoesError) {
      console.error('❌ Erro ao contar total de inscrições:', totalInscricoesError)
      throw totalInscricoesError
    }

    // 7. Processos seletivos ativos
    const { count: processosSeletivos, error: processosSeletivosError } = await supabaseClient
      .from('processos_seletivos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo')

    if (processosSeletivosError) {
      console.error('❌ Erro ao contar processos seletivos:', processosSeletivosError)
      throw processosSeletivosError
    }

    // 8. Candidatos em processos seletivos
    const { count: totalCandidatos, error: totalCandidatosError } = await supabaseClient
      .from('candidatos_processo_seletivo')
      .select('*', { count: 'exact', head: true })

    if (totalCandidatosError) {
      console.error('❌ Erro ao contar total de candidatos:', totalCandidatosError)
      throw totalCandidatosError
    }

    // Preparar dados para inserção
    const indicadoresGerais = {
      total_alunos: totalAlunos || 0,
      total_entidades: totalEntidades || 0,
      total_demonstracoes: totalDemonstracoes || 0,
      total_eventos: totalEventos || 0,
      eventos_aprovados: eventosAprovados || 0,
      total_inscricoes: totalInscricoes || 0,
      processos_seletivos_ativos: processosSeletivos || 0,
      total_candidatos: totalCandidatos || 0,
      taxa_aprovacao_eventos: totalEventos > 0 ? (eventosAprovados || 0) / totalEventos : 0,
      media_inscricoes_evento: totalEventos > 0 ? (totalInscricoes || 0) / totalEventos : 0,
      updated_at: new Date().toISOString()
    }

    console.log('📊 Indicadores calculados:', {
      total_alunos: indicadoresGerais.total_alunos,
      total_entidades: indicadoresGerais.total_entidades,
      total_demonstracoes: indicadoresGerais.total_demonstracoes,
      total_eventos: indicadoresGerais.total_eventos,
      eventos_aprovados: indicadoresGerais.eventos_aprovados,
      total_inscricoes: indicadoresGerais.total_inscricoes,
      processos_seletivos_ativos: indicadoresGerais.processos_seletivos_ativos,
      total_candidatos: indicadoresGerais.total_candidatos
    })

    // Step 3: Insert calculated data
    console.log('📥 Inserindo indicadores gerais...')
    
    const { error: insertError } = await supabaseClient
      .from('indicadores_gerais')
      .insert(indicadoresGerais)

    if (insertError) {
      console.error('❌ Erro ao inserir indicadores:', insertError)
      throw insertError
    }

    console.log('✅ Indicadores inseridos com sucesso')

    // Step 4: Verify results
    const { data: finalData, error: selectError } = await supabaseClient
      .from('indicadores_gerais')
      .select('*')
      .single()

    if (selectError) {
      console.error('❌ Erro ao verificar resultado final:', selectError)
    } else {
      console.log('🎯 Indicadores finais:', finalData)
    }

    const responseData = {
      success: true,
      message: 'Indicadores gerais atualizados com sucesso',
      indicadores: indicadoresGerais,
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Atualização concluída com sucesso!')

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro na edge function:', error)
    
    const errorResponse = {
      success: false,
      error: error.message || 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
