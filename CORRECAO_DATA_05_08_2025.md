# Correção do Problema da Data 05/08/2025

## Problema Identificado
Ao criar ou editar eventos, a data está sendo automaticamente definida como **05/08/2025** em vez da data selecionada pelo usuário.

## Possíveis Causas

### 1. **Valor Padrão na Tabela**
- Pode haver um valor padrão (DEFAULT) na coluna `data_evento` da tabela `eventos`
- O valor padrão pode estar definido como `'2025-08-05'` ou similar

### 2. **Função RPC com Bug**
- A função `create_event_as_entity_pending` pode ter um bug no tratamento da data
- Pode estar ignorando o parâmetro `_data_evento` e usando um valor fixo

### 3. **Problema de Formatação**
- O frontend pode estar enviando a data em formato incorreto
- Pode haver problema de timezone ou conversão

## Arquivos de Debug Criados

### 1. **test-data-debug.html**
- Teste completo para identificar o problema
- Verifica formatação de data
- Testa criação de eventos
- Busca eventos com data problemática

### 2. **fix_event_date_function.sql**
- Script SQL para corrigir a função RPC
- Adiciona logs de debug
- Melhora validação de parâmetros
- Tratamento correto da data

## Passos para Resolver

### Passo 1: Executar Script de Debug
1. Abra o arquivo `test-data-debug.html` no navegador
2. Execute todos os testes para identificar o problema
3. Verifique se há eventos com data 05/08/2025

### Passo 2: Verificar Estrutura da Tabela
```sql
-- No Supabase Dashboard > SQL Editor
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'eventos' 
ORDER BY ordinal_position;
```

### Passo 3: Verificar Valores Padrão
```sql
-- Verificar se há valores padrão problemáticos
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'eventos' 
AND column_default IS NOT NULL;
```

### Passo 4: Executar Correção da Função
```sql
-- Executar o script fix_event_date_function.sql
-- No Supabase Dashboard > SQL Editor
```

### Passo 5: Testar Criação de Evento
1. Use o arquivo `test-data-debug.html`
2. Tente criar um evento com data atual
3. Verifique se a data foi salva corretamente

## Comandos SQL Úteis

### Verificar Eventos Problemáticos
```sql
-- Buscar eventos com data 05/08/2025
SELECT id, nome, data_evento, created_at, entidade_id
FROM public.eventos 
WHERE data_evento >= '2025-08-05T00:00:00'
AND data_evento < '2025-08-06T00:00:00'
ORDER BY created_at DESC;
```

### Verificar Função RPC
```sql
-- Verificar definição da função
SELECT routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_event_as_entity_pending';
```

### Testar Função Corrigida
```sql
-- Testar com data atual
SELECT create_event_as_entity_pending(
  1,  -- entidade_id
  'Evento Teste Correção',
  NOW()::TEXT,  -- data atual
  'Teste da função corrigida',
  'Local Teste',
  10
);
```

## Verificações no Frontend

### 1. **Componente CriarEventoEntidade.tsx**
- Verificar se `dataEvento` está sendo enviado corretamente
- Verificar logs no console do navegador

### 2. **Hook useCreateEventoAsEntity.ts**
- Verificar se a data está sendo passada para a RPC
- Verificar logs de debug

### 3. **Formato da Data**
- Verificar se está usando formato ISO correto
- Verificar timezone

## Logs de Debug

### Frontend
```javascript
console.log('📅 Data selecionada:', dataEvento);
console.log('📅 Data como Date:', new Date(dataEvento));
console.log('📅 Data ISO:', new Date(dataEvento).toISOString());
```

### Backend (Função RPC)
```sql
RAISE NOTICE 'Criando evento: entidade_id=%, nome=%, data_evento=%, descricao=%, local=%, capacidade=%', 
  _entidade_id, _nome, _data_evento, _descricao, _local, _capacidade;
```

## Próximos Passos

1. **Execute o debug** usando `test-data-debug.html`
2. **Identifique a causa** do problema
3. **Execute a correção** usando `fix_event_date_function.sql`
4. **Teste a criação** de eventos
5. **Verifique se o problema foi resolvido**

## Arquivos Criados
- `test-data-debug.html` - Debug completo
- `fix_event_date_function.sql` - Correção da função RPC
- `CORRECAO_DATA_05_08_2025.md` - Esta documentação

## Contato
Se o problema persistir após seguir estes passos, verifique:
1. Logs do Supabase
2. Console do navegador
3. Network tab do DevTools
4. Estrutura atual da tabela eventos 