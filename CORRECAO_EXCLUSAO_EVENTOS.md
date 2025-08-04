# Correção da Exclusão de Eventos

## Problema Identificado
A funcionalidade de exclusão de eventos pode não estar funcionando corretamente devido a problemas de autenticação ou configuração.

## Componentes Envolvidos

### 1. **Hook useDeleteEventoAsEntity**
**Arquivo**: `src/hooks/useDeleteEventoAsEntity.ts`
- Responsável por chamar a função RPC de exclusão
- Adicionados logs de debug para identificar problemas

### 2. **Função RPC delete_event_as_entity**
**Arquivo**: `supabase/migrations/20250726211022-07027dd0-827a-4a26-a730-49e87516c818.sql`
- Função que executa a exclusão no banco de dados
- Verifica autenticação da entidade
- Verifica se o evento pertence à entidade

### 3. **Função is_entity_authenticated**
**Arquivo**: `supabase/migrations/20250115000019_fix_entity_authentication.sql`
- Função que verifica se a entidade está autenticada
- Corrigida para funcionar corretamente

## Correções Aplicadas

### 1. **Logs de Debug Adicionados**
**Arquivo**: `src/hooks/useDeleteEventoAsEntity.ts`

```typescript
console.log('🗑️ Tentando excluir evento:', { eventoId, entidadeId });
console.log('📊 Resultado da exclusão:', { data, error });
console.log('✅ Evento excluído com sucesso');
```

### 2. **Função de Autenticação Corrigida**
**Arquivo**: `supabase/migrations/20250115000019_fix_entity_authentication.sql`

```sql
CREATE OR REPLACE FUNCTION public.is_entity_authenticated(_entidade_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Verificar se a entidade existe e tem credenciais
  SELECT EXISTS (
    SELECT 1 FROM public.entidade_credentials 
    WHERE entidade_id = _entidade_id
  );
$$;
```

### 3. **Arquivo de Teste Criado**
**Arquivo**: `test-delete-evento.html`
- Teste completo da função RPC
- Verificação de eventos e entidades existentes
- Teste de exclusão real

## Passos para Resolver

### Passo 1: Executar Migração
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute a migração: 20250115000019_fix_entity_authentication.sql
```

### Passo 2: Testar Exclusão
1. Acesse `test-delete-evento.html` para verificar se a função RPC funciona
2. Teste a exclusão de eventos na página de detalhes da entidade
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
WHERE routine_name = 'delete_event_as_entity';
```

### Verificar Autenticação da Entidade
```sql
-- Verificar se a entidade tem credenciais
SELECT ec.entidade_id, e.nome, ec.username
FROM public.entidade_credentials ec
JOIN public.entidades e ON e.id = ec.entidade_id
WHERE ec.entidade_id = 1; -- Substitua pelo ID da entidade
```

### Testar Exclusão de Evento
```sql
-- Testar a função diretamente
SELECT delete_event_as_entity(
  'uuid-do-evento',  -- evento_id
  1                  -- entidade_id
);
```

### Verificar Eventos Existentes
```sql
-- Verificar eventos com suas entidades
SELECT e.id, e.nome, e.entidade_id, ent.nome as entidade_nome
FROM public.eventos e
JOIN public.entidades ent ON ent.id = e.entidade_id
ORDER BY e.created_at DESC;
```

## Possíveis Problemas

### 1. **Problema de Autenticação**
- **Sintoma**: Erro "Entidade não encontrada ou não possui credenciais"
- **Solução**: Verificar se a entidade tem credenciais na tabela `entidade_credentials`

### 2. **Problema de Permissão**
- **Sintoma**: Erro "Evento não encontrado ou não pertence a esta entidade"
- **Solução**: Verificar se o `evento.entidade_id` corresponde ao `entidadeId` logado

### 3. **Problema de RLS**
- **Sintoma**: Erro de permissão no Supabase
- **Solução**: Verificar as políticas RLS da tabela `eventos`

## Próximos Passos
1. Execute a migração no Supabase
2. Teste a exclusão de eventos
3. Verifique os logs no console
4. Se funcionar, remova os arquivos de debug

## Arquivos Modificados
- `src/hooks/useDeleteEventoAsEntity.ts` (melhorado)
- `supabase/migrations/20250115000019_fix_entity_authentication.sql`
- `test-delete-evento.html` (novo)
- `CORRECAO_EXCLUSAO_EVENTOS.md` (novo) 