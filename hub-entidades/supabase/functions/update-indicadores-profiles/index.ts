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

    console.log('🔄 Iniciando atualização dos indicadores de profiles...')

    // Step 1: Clear existing data
    console.log('🗑️ Limpando dados existentes...')
    const { error: deleteError } = await supabaseClient
      .from('indicadores_profiles')
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('❌ Erro ao limpar dados existentes:', deleteError)
      throw deleteError
    }

    console.log('✅ Dados existentes removidos com sucesso')

    // Step 2: Calculate indicators
    console.log('🧮 Calculando indicadores...')
    
    const indicadores = []

    // 1. Total de usuários
    const { count: totalUsuarios, error: totalError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('❌ Erro ao contar total de usuários:', totalError)
      throw totalError
    }

    // 2. Perfis completos vs incompletos
    const { count: perfisCompletos, error: completosError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_completed', true)

    if (completosError) {
      console.error('❌ Erro ao contar perfis completos:', completosError)
      throw completosError
    }

    const taxaCompletude = totalUsuarios > 0 ? (perfisCompletos || 0) / totalUsuarios : 0

    // 3. Distribuição por curso
    const { data: cursosData, error: cursosError } = await supabaseClient
      .from('profiles')
      .select('curso')
      .not('curso', 'is', null)

    if (cursosError) {
      console.error('❌ Erro ao buscar cursos:', cursosError)
      throw cursosError
    }

    const cursosCount = cursosData.reduce((acc, profile) => {
      const curso = profile.curso || 'Não informado'
      acc[curso] = (acc[curso] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 4. Distribuição por semestre
    const { data: semestresData, error: semestresError } = await supabaseClient
      .from('profiles')
      .select('semestre')
      .not('semestre', 'is', null)

    if (semestresError) {
      console.error('❌ Erro ao buscar semestres:', semestresError)
      throw semestresError
    }

    const semestresCount = semestresData.reduce((acc, profile) => {
      const semestre = profile.semestre || 0
      acc[semestre] = (acc[semestre] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // 5. Áreas de interesse mais populares
    const { data: areasData, error: areasError } = await supabaseClient
      .from('profiles')
      .select('areas_interesse')
      .not('areas_interesse', 'is', null)

    if (areasError) {
      console.error('❌ Erro ao buscar áreas de interesse:', areasError)
      throw areasError
    }

    const areasCount: Record<string, number> = {}
    areasData.forEach(profile => {
      if (profile.areas_interesse && Array.isArray(profile.areas_interesse)) {
        profile.areas_interesse.forEach((area: string) => {
          areasCount[area] = (areasCount[area] || 0) + 1
        })
      }
    })

    // 6. Distribuição por idade (baseado em data_nascimento)
    const { data: nascimentoData, error: nascimentoError } = await supabaseClient
      .from('profiles')
      .select('data_nascimento')
      .not('data_nascimento', 'is', null)

    if (nascimentoError) {
      console.error('❌ Erro ao buscar datas de nascimento:', nascimentoError)
      throw nascimentoError
    }

    const idades = nascimentoData.map(profile => {
      const nascimento = new Date(profile.data_nascimento)
      const hoje = new Date()
      const idade = hoje.getFullYear() - nascimento.getFullYear()
      const mes = hoje.getMonth() - nascimento.getMonth()
      return mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()) ? idade - 1 : idade
    })

    const faixasEtarias = {
      '18-20': 0,
      '21-25': 0,
      '26-30': 0,
      '31-35': 0,
      '36+': 0
    }

    idades.forEach(idade => {
      if (idade >= 18 && idade <= 20) faixasEtarias['18-20']++
      else if (idade >= 21 && idade <= 25) faixasEtarias['21-25']++
      else if (idade >= 26 && idade <= 30) faixasEtarias['26-30']++
      else if (idade >= 31 && idade <= 35) faixasEtarias['31-35']++
      else if (idade > 35) faixasEtarias['36+']++
    })

    // 7. Crescimento por período (últimos 6 meses)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)

    const { count: usuariosRecentes, error: recentesError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', seisMesesAtras.toISOString())

    if (recentesError) {
      console.error('❌ Erro ao contar usuários recentes:', recentesError)
      throw recentesError
    }

    // Inserir indicadores principais
    const indicadoresPrincipais = [
      {
        tipo: 'total_usuarios',
        valor: totalUsuarios || 0,
        descricao: 'Total de usuários cadastrados',
        categoria: 'geral'
      },
      {
        tipo: 'perfis_completos',
        valor: perfisCompletos || 0,
        descricao: 'Perfis completos',
        categoria: 'completude'
      },
      {
        tipo: 'taxa_completude',
        valor: Math.round(taxaCompletude * 10000) / 10000,
        descricao: 'Taxa de completude dos perfis',
        categoria: 'completude'
      },
      {
        tipo: 'usuarios_recentes',
        valor: usuariosRecentes || 0,
        descricao: 'Usuários cadastrados nos últimos 6 meses',
        categoria: 'crescimento'
      }
    ]

    // Inserir distribuição por curso
    Object.entries(cursosCount).forEach(([curso, quantidade]) => {
      indicadores.push({
        tipo: 'distribuicao_curso',
        categoria: curso,
        valor: quantidade,
        descricao: `Usuários do curso ${curso}`,
        metadata: { curso }
      })
    })

    // Inserir distribuição por semestre
    Object.entries(semestresCount).forEach(([semestre, quantidade]) => {
      indicadores.push({
        tipo: 'distribuicao_semestre',
        categoria: `Semestre ${semestre}`,
        valor: quantidade,
        descricao: `Usuários do ${semestre}º semestre`,
        metadata: { semestre }
      })
    })

    // Inserir áreas de interesse mais populares
    Object.entries(areasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 áreas
      .forEach(([area, quantidade]) => {
        indicadores.push({
          tipo: 'area_interesse',
          categoria: area,
          valor: quantidade,
          descricao: `Usuários interessados em ${area}`,
          metadata: { area }
        })
      })

    // Inserir faixas etárias
    Object.entries(faixasEtarias).forEach(([faixa, quantidade]) => {
      indicadores.push({
        tipo: 'faixa_etaria',
        categoria: faixa,
        valor: quantidade,
        descricao: `Usuários na faixa etária ${faixa} anos`,
        metadata: { faixa_etaria: faixa }
      })
    })

    // Inserir todos os indicadores
    const todosIndicadores = [...indicadoresPrincipais, ...indicadores]

    if (todosIndicadores.length > 0) {
      console.log(`📥 Inserindo ${todosIndicadores.length} indicadores...`)
      
      const { error: insertError } = await supabaseClient
        .from('indicadores_profiles')
        .insert(todosIndicadores)

      if (insertError) {
        console.error('❌ Erro ao inserir indicadores:', insertError)
        throw insertError
      }

      console.log('✅ Indicadores inseridos com sucesso')
    }

    // Step 3: Verify results
    const { count: finalCount, error: countError } = await supabaseClient
      .from('indicadores_profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao verificar resultado final:', countError)
    } else {
      console.log(`🎯 Tabela atualizada com ${finalCount} indicadores`)
    }

    const responseData = {
      success: true,
      message: 'Indicadores de profiles atualizados com sucesso',
      total_usuarios: totalUsuarios || 0,
      perfis_completos: perfisCompletos || 0,
      taxa_completude: Math.round(taxaCompletude * 10000) / 10000,
      indicadores_inseridos: todosIndicadores.length,
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
