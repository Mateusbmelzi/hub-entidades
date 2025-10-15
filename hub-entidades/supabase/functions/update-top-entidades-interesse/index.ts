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

    console.log('🔄 Iniciando atualização da tabela top_entidades_interesse...')

    // Step 1: Clear existing data
    console.log('🗑️ Limpando dados existentes...')
    const { error: deleteError } = await supabaseClient
      .from('top_entidades_interesse')
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('❌ Erro ao limpar dados existentes:', deleteError)
      throw deleteError
    }

    console.log('✅ Dados existentes removidos com sucesso')

    // Step 2: Calculate top entidades by interest demonstrations
    console.log('🧮 Calculando top entidades por demonstrações de interesse...')
    
    // Query to get entidades with their total interest demonstrations
    const { data: entidadesInteresse, error: queryError } = await supabaseClient
      .from('demonstracoes_interesse')
      .select(`
        entidade_id,
        entidades!inner(
          id,
          nome,
          status
        )
      `)
      .eq('entidades.status', 'ativo')

    if (queryError) {
      console.error('❌ Erro ao buscar demonstrações de interesse:', queryError)
      throw queryError
    }

    console.log(`📊 Encontradas ${entidadesInteresse.length} demonstrações de interesse`)

    // Group by entidade and count demonstrations
    const entidadeCounts = new Map<string, { nome: string, count: number }>()
    
    for (const demonstracao of entidadesInteresse) {
      const entidadeId = demonstracao.entidade_id
      const entidadeNome = demonstracao.entidades?.nome
      
      if (entidadeNome) {
        if (entidadeCounts.has(entidadeId)) {
          entidadeCounts.get(entidadeId)!.count++
        } else {
          entidadeCounts.set(entidadeId, { nome: entidadeNome, count: 1 })
        }
      }
    }

    // Convert to array and sort by count (descending)
    const topEntidadesData = Array.from(entidadeCounts.entries())
      .map(([entidadeId, data]) => ({
        nome_entidade: data.nome,
        total_demonstracoes: data.count
      }))
      .sort((a, b) => b.total_demonstracoes - a.total_demonstracoes)
      .slice(0, 10) // Top 10

    console.log(`📈 Top 10 entidades calculadas:`)
    topEntidadesData.forEach((entidade, index) => {
      console.log(`${index + 1}. ${entidade.nome_entidade}: ${entidade.total_demonstracoes} demonstrações`)
    })

    // Step 3: Insert calculated data
    if (topEntidadesData.length > 0) {
      console.log(`📥 Inserindo ${topEntidadesData.length} registros...`)
      
      const { error: insertError } = await supabaseClient
        .from('top_entidades_interesse')
        .insert(topEntidadesData)

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
      .from('top_entidades_interesse')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao verificar resultado final:', countError)
    } else {
      console.log(`🎯 Tabela atualizada com ${finalCount} registros`)
    }

    const responseData = {
      success: true,
      message: 'Tabela top_entidades_interesse atualizada com sucesso',
      records_processed: entidadesInteresse.length,
      records_inserted: topEntidadesData.length,
      final_count: finalCount || 0,
      top_entidades: topEntidadesData,
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
