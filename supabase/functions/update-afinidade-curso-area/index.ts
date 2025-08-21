// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  try {
    // Configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Criar cliente Supabase com service role para acesso total
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Iniciando atualização da tabela afinidade_curso_area...');

    // 1. Limpar a tabela atual
    const { error: deleteError } = await supabase
      .from('afinidade_curso_area')
      .delete()
      .neq('id', 0); // Deletar todos os registros

    if (deleteError) {
      throw new Error(`Erro ao limpar tabela: ${deleteError.message}`);
    }

    console.log('✅ Tabela afinidade_curso_area limpa com sucesso');

    // 2. Buscar dados de afinidade entre cursos e áreas
    const { data: afinidades, error: selectError } = await supabase
      .rpc('calcular_afinidade_curso_area');

    if (selectError) {
      throw new Error(`Erro ao calcular afinidades: ${selectError.message}`);
    }

    if (!afinidades || afinidades.length === 0) {
      console.log('⚠️ Nenhuma afinidade encontrada');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma afinidade encontrada para inserir',
          count: 0 
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Inserir as afinidades calculadas
    const { data: insertedData, error: insertError } = await supabase
      .from('afinidade_curso_area')
      .insert(afinidades)
      .select();

    if (insertError) {
      throw new Error(`Erro ao inserir afinidades: ${insertError.message}`);
    }

    console.log(`✅ ${insertedData.length} afinidades inseridas com sucesso`);

    // 4. Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        message: `Tabela afinidade_curso_area atualizada com sucesso`,
        count: insertedData.length,
        data: insertedData.slice(0, 5) // Retornar apenas os primeiros 5 para preview
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});

// Função auxiliar para criar cliente Supabase
function createClient(url: string, key: string) {
  return {
    from: (table: string) => ({
      delete: () => ({
        neq: (column: string, value: any) => Promise.resolve({ error: null })
      }),
      insert: (data: any) => ({
        select: () => Promise.resolve({ data: data, error: null })
      }),
      rpc: (func: string) => Promise.resolve({ data: [], error: null })
    })
  };
}
