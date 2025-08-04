# Correção dos Campos Data e Horário

## Problema Identificado
Você atualizou a estrutura da tabela `eventos` no Supabase para ter campos separados `data` e `horario`, mas o frontend ainda estava tentando usar o campo `data_evento`.

## Estrutura Atual da Tabela
- **Campo**: `data` (tipo: `date`)
- **Campo**: `horario` (tipo: `time without time zone`)

## Correções Aplicadas

### 1. **Função RPC Corrigida**
**Arquivo**: `supabase/migrations/20250115000017_fix_event_creation_data_horario.sql`

```sql
-- Separar data e horário do timestamp
_data := _data_evento::date;
_horario := _data_evento::time;

INSERT INTO public.eventos (
  entidade_id,
  nome,
  descricao,
  local,
  data,      -- Campo correto
  horario,   -- Campo correto
  capacidade,
  status,
  status_aprovacao
)
```

### 2. **Hook useEventos Corrigido**
**Arquivo**: `src/hooks/useEventos.ts`
- Adicionado ordenação por `horario`
- Mantida ordenação por `data`

### 3. **Página Eventos Corrigida**
**Arquivo**: `src/pages/Eventos.tsx`
- Função `getEventoStatus` atualizada para usar `data` e `horario`
- Formatação de data e horário corrigida
- Funções de status atualizadas

### 4. **Hook useEventosEntidade Corrigido**
**Arquivo**: `src/hooks/useEventosEntidade.ts`
- Ordenação atualizada para usar `data` e `horario`

### 5. **Página EntidadeDetalhes Corrigida**
**Arquivo**: `src/pages/EntidadeDetalhes.tsx`
- Formatação de data e horário corrigida

## Passos para Resolver

### Passo 1: Executar Migração
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute a migração: 20250115000017_fix_event_creation_data_horario.sql
```

### Passo 2: Testar Criação
1. Tente criar um evento na página de detalhes da entidade
2. Verifique se os campos `data` e `horario` são salvos corretamente
3. Verifique se o evento aparece na lista

### Passo 3: Verificar Exibição
1. Acesse a rota `/eventos` para verificar se os eventos aparecem
2. Verifique se a data e horário estão formatados corretamente
3. Verifique se o status (futuro/próximo/finalizado) está funcionando

## Comandos Úteis

### Verificar Estrutura Atual
```sql
-- Verificar campos da tabela eventos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos' 
ORDER BY ordinal_position;
```

### Testar Criação de Evento
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

### Verificar Eventos Criados
```sql
-- Verificar eventos com data e horário
SELECT id, nome, data, horario, status_aprovacao 
FROM public.eventos 
ORDER BY data, horario;
```

## Próximos Passos
1. Execute a migração no Supabase
2. Teste a criação de eventos
3. Verifique se os eventos aparecem corretamente
4. Se funcionar, remova os arquivos de debug

## Arquivos Modificados
- `supabase/migrations/20250115000017_fix_event_creation_data_horario.sql`
- `src/hooks/useEventos.ts`
- `src/pages/Eventos.tsx`
- `src/hooks/useEventosEntidade.ts`
- `src/pages/EntidadeDetalhes.tsx`
- `CORRECAO_CAMPOS_DATA_HORARIO.md` 