# Correção da Criação de Eventos

## Problemas Identificados

### 1. **Incompatibilidade de Campos na Tabela**
- **Problema**: A função RPC `create_event_as_entity_pending` está tentando inserir no campo `data_evento`
- **Realidade**: A tabela tem o campo `data` (tipo `date`)
- **Solução**: Corrigir a função RPC para usar o campo correto

### 2. **Estrutura da Tabela vs Tipos TypeScript**
- **Problema**: Os tipos TypeScript definem `data_evento` mas a tabela tem `data`
- **Impacto**: Erros de tipo e campos não encontrados
- **Solução**: Atualizar a função RPC para usar a estrutura real

### 3. **Possível Problema de Autenticação**
- **Problema**: O `entidadeId` pode estar `null` quando tenta criar evento
- **Solução**: Verificar se a entidade está autenticada antes de criar

## Correções Aplicadas

### 1. **Migração para Corrigir Função RPC**
**Arquivo**: `supabase/migrations/20250115000016_fix_event_creation_function.sql`

```sql
-- Corrigir para usar o campo 'data' em vez de 'data_evento'
INSERT INTO public.eventos (
  entidade_id,
  nome,
  descricao,
  local,
  data,  -- Campo correto
  capacidade,
  status,
  status_aprovacao
)
VALUES (
  _entidade_id,
  _nome,
  _descricao,
  _local,
  _data_evento::date,  -- Converter para date
  _capacidade,
  'ativo',
  'pendente'
)
```

### 2. **Melhorar Logs de Debug**
**Arquivo**: `src/hooks/useCreateEventoAsEntity.ts`
- Adicionados logs mais detalhados
- Melhor tratamento de erros

### 3. **Arquivo de Teste**
**Arquivo**: `test-criar-evento.html`
- Teste completo da função RPC
- Verificação da estrutura da tabela
- Teste de criação com dados reais

## Passos para Resolver

### Passo 1: Executar Migração
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute a migração: 20250115000016_fix_event_creation_function.sql
```

### Passo 2: Testar Criação
1. Acesse `test-criar-evento.html` para verificar se a função RPC funciona
2. Teste a criação de eventos na página de detalhes da entidade
3. Verifique os logs no console do navegador

### Passo 3: Verificar Autenticação
1. Certifique-se de que a entidade está logada
2. Verifique se o `entidadeId` está sendo passado corretamente
3. Teste o login da entidade se necessário

## Comandos Úteis

### Verificar Função RPC
```sql
-- Verificar se a função existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_event_as_entity_pending';
```

### Verificar Estrutura da Tabela
```sql
-- Verificar campos da tabela eventos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos' 
ORDER BY ordinal_position;
```

### Testar Função RPC
```sql
-- Testar a função diretamente
SELECT create_event_as_entity_pending(
  1,  -- entidade_id
  'Evento Teste',
  NOW(),
  'Descrição teste',
  'Local teste',
  10
);
```

## Próximos Passos
1. Execute a migração no Supabase
2. Teste a criação de eventos
3. Verifique se os eventos aparecem na lista
4. Se funcionar, remova os arquivos de debug

## Arquivos Criados/Modificados
- `supabase/migrations/20250115000016_fix_event_creation_function.sql`
- `src/hooks/useCreateEventoAsEntity.ts` (melhorado)
- `test-criar-evento.html` (novo)
- `CORRECAO_CRIACAO_EVENTOS.md` (novo) 