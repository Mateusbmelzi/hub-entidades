# Debug da Rota de Eventos

## Problema Identificado
A rota `/eventos` não está carregando após alterações no Supabase.

## Possíveis Causas

### 1. Políticas RLS (Row Level Security)
- **Problema**: As políticas de segurança podem estar bloqueando o acesso aos eventos
- **Sintomas**: Erro de permissão ou dados vazios
- **Solução**: Verificar e corrigir as políticas RLS

### 2. Campo `status_aprovacao`
- **Problema**: A consulta filtra por `status_aprovacao = 'aprovado'`
- **Sintomas**: Nenhum evento retornado se todos estiverem com status diferente
- **Solução**: Verificar se existem eventos com status 'aprovado'

### 3. Relação com `entidades`
- **Problema**: A consulta faz JOIN com a tabela `entidades`
- **Sintomas**: Erro se a relação estiver quebrada
- **Solução**: Verificar se a foreign key está funcionando

### 4. Configuração do Supabase
- **Problema**: Credenciais ou configuração incorreta
- **Sintomas**: Erro de conexão
- **Solução**: Verificar variáveis de ambiente

## Arquivos Criados para Debug

### 1. Página de Teste
- **Arquivo**: `src/pages/TestEventos.tsx`
- **Rota**: `/test-eventos`
- **Função**: Testar a conexão com eventos

### 2. Hook de Debug
- **Arquivo**: `src/hooks/useEventosDebug.ts`
- **Função**: Logs detalhados das consultas

### 3. Hook Simplificado
- **Arquivo**: `src/hooks/useEventosSimple.ts`
- **Função**: Consulta sem filtros complexos

### 4. Migração para Corrigir Políticas
- **Arquivo**: `supabase/migrations/20250115000014_fix_eventos_policies.sql`
- **Função**: Corrigir políticas RLS

### 5. Migração Temporária
- **Arquivo**: `supabase/migrations/20250115000015_disable_rls_temporarily.sql`
- **Função**: Desabilitar RLS temporariamente

### 6. Script de Verificação
- **Arquivo**: `check-eventos.sql`
- **Função**: Verificar estado da tabela no Supabase

## Passos para Resolver

### Passo 1: Verificar Estado Atual
1. Acesse `/test-eventos` para ver logs no console
2. Execute o script `check-eventos.sql` no Supabase
3. Verifique se há eventos na tabela

### Passo 2: Testar Sem RLS
1. Execute a migração `20250115000015_disable_rls_temporarily.sql`
2. Teste novamente a rota `/eventos`
3. Se funcionar, o problema é com as políticas RLS

### Passo 3: Corrigir Políticas
1. Execute a migração `20250115000014_fix_eventos_policies.sql`
2. Reabilite RLS com `ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;`
3. Teste novamente

### Passo 4: Verificar Dados
1. Verifique se existem eventos com `status_aprovacao = 'aprovado'`
2. Se não existirem, atualize alguns eventos:
```sql
UPDATE public.eventos 
SET status_aprovacao = 'aprovado' 
WHERE status_aprovacao IS NULL OR status_aprovacao = 'pendente'
LIMIT 5;
```

## Comandos Úteis

### Verificar Logs
```bash
# No console do navegador, acesse /test-eventos
# Verifique os logs com emojis 🔍📋✅❌
```

### Executar Migrações
```bash
# No Supabase Dashboard > SQL Editor
# Execute as migrações na ordem:
# 1. 20250115000014_fix_eventos_policies.sql
# 2. 20250115000015_disable_rls_temporarily.sql (se necessário)
```

### Verificar Dados
```sql
-- Verificar eventos aprovados
SELECT COUNT(*) FROM public.eventos WHERE status_aprovacao = 'aprovado';

-- Verificar estrutura
SELECT * FROM public.eventos LIMIT 1;
```

## Próximos Passos
1. Execute os testes sugeridos
2. Identifique a causa específica
3. Aplique a solução correspondente
4. Remova os arquivos de debug após resolver 