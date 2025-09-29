// Script de teste para verificar se a tabela professores_convidados foi criada
// Execute este script no console do navegador na página de eventos

console.log('🧪 Testando funcionalidade de professores convidados...');

// Teste 1: Verificar se a tabela existe
fetch('/api/rest/v1/professores_convidados?select=*&limit=1', {
  method: 'GET',
  headers: {
    'apikey': 'YOUR_SUPABASE_ANON_KEY', // Substitua pela sua chave
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY' // Substitua pela sua chave
  }
})
.then(response => {
  if (response.ok) {
    console.log('✅ Tabela professores_convidados existe e está acessível');
    return response.json();
  } else {
    console.log('❌ Erro ao acessar tabela professores_convidados:', response.status);
    throw new Error('Tabela não encontrada');
  }
})
.then(data => {
  console.log('📊 Dados da tabela:', data);
})
.catch(error => {
  console.log('❌ Erro:', error.message);
});

// Teste 2: Verificar se há reservas com professores
console.log('🔍 Verificando reservas aprovadas...');

// Este teste deve ser executado na página de eventos para verificar se os professores aparecem
