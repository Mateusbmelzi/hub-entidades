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

    console.log('🔄 Iniciando atualização da tabela taxa_conversao_entidades...')

    // Step 1: Clear existing data
    console.log('🗑️ Limpando dados existentes...')
    const { error: deleteError } = await supabaseClient
      .from('taxa_conversao_entidades')
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('❌ Erro ao limpar dados existentes:', deleteError)
      throw deleteError
    }

    console.log('✅ Dados existentes removidos com sucesso')

    // Step 2: Calculate and insert new data
    console.log('🧮 Calculando taxas de conversão...')
    
    const { data: entidadesData, error: entidadesError } = await supabaseClient
      .from('entidades')
      .select('id, nome, status')
      .eq('status', 'ativo')

    if (entidadesError) {
      console.error('❌ Erro ao buscar entidades:', entidadesError)
      throw entidadesError
    }

    console.log(`📊 Encontradas ${entidadesData.length} entidades ativas`)

    const taxaConversaoData = []

    for (const entidade of entidadesData) {
      try {
        // Get total demonstrações de interesse
        const { count: totalDemonstracoes, error: demonstracoesError } = await supabaseClient
          .from('demonstracoes_interesse')
          .select('*', { count: 'exact', head: true })
          .eq('entidade_id', entidade.id)

        if (demonstracoesError) {
          console.error(`❌ Erro ao contar demonstrações para entidade ${entidade.nome}:`, demonstracoesError)
          continue
        }

        // Get total participantes em eventos
        const { data: eventosIds, error: eventosError } = await supabaseClient
          .from('eventos')
          .select('id')
          .eq('entidade_id', entidade.id)

        if (eventosError) {
          console.error(`❌ Erro ao buscar eventos para entidade ${entidade.nome}:`, eventosError)
          continue
        }

        let totalParticipantes = 0
        if (eventosIds && eventosIds.length > 0) {
          const eventoIds = eventosIds.map(e => e.id)
          const { count: participantesCount, error: participantesError } = await supabaseClient
            .from('participantes_evento')
            .select('*', { count: 'exact', head: true })
            .in('evento_id', eventoIds)

          if (participantesError) {
            console.error(`❌ Erro ao contar participantes para entidade ${entidade.nome}:`, participantesError)
            continue
          }
          totalParticipantes = participantesCount || 0
        }



        // Calculate conversion rate
        const taxaConversao = totalDemonstracoes > 0 
          ? (totalParticipantes || 0) / totalDemonstracoes 
          : 0

        taxaConversaoData.push({
          nome: entidade.nome,
          total_demonstracoes: totalDemonstracoes || 0,
          total_participantes_eventos: totalParticipantes || 0,
          taxa_conversao: Math.round(taxaConversao * 10) / 10 // Round to 1 decimal place, percentage format
        })

        console.log(`✅ ${entidade.nome}: ${totalDemonstracoes} demonstrações, ${totalParticipantes} participantes, taxa: ${taxaConversao.toFixed(2)}%`)

      } catch (error) {
        console.error(`❌ Erro ao processar entidade ${entidade.nome}:`, error)
        continue
      }
    }

    // Step 3: Insert calculated data
    if (taxaConversaoData.length > 0) {
      console.log(`📥 Inserindo ${taxaConversaoData.length} registros...`)
      
      const { error: insertError } = await supabaseClient
        .from('taxa_conversao_entidades')
        .insert(taxaConversaoData)

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError)
        throw insertError
      }

      console.log('✅ Dados inseridos com sucesso')
    } else {
      console.log('⚠️ Nenhum dado calculado para inserir')
    }

    // Step 4: Verify results
    const { count: finalCount, error: countError } = await supabaseClient
      .from('taxa_conversao_entidades')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao verificar resultado final:', countError)
    } else {
      console.log(`🎯 Tabela atualizada com ${finalCount} registros`)
    }

    const responseData = {
      success: true,
      message: 'Tabela taxa_conversao_entidades atualizada com sucesso',
      records_processed: entidadesData.length,
      records_inserted: taxaConversaoData.length,
      final_count: finalCount || 0,
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
