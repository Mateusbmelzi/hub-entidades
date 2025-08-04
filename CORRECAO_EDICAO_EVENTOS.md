# Correção da Edição de Eventos

## Problema Identificado
Ao clicar em "Editar" um evento existente, a tela ficava branca devido a incompatibilidades entre os campos da tabela e o frontend.

## Problemas Encontrados

### 1. **Componente EditarEventoEntidade**
- **Problema**: Tentava usar `evento.data_evento` que não existe mais
- **Solução**: Corrigido para usar `evento.data` e `evento.horario`

### 2. **Função RPC update_event_as_entity**
- **Problema**: Tentava atualizar o campo `data_evento` que não existe
- **Solução**: Corrigida para usar os campos `data` e `horario`

### 3. **Tipo Evento no useEventosEntidade**
- **Problema**: Interface definia `data_evento` em vez de `data` e `horario`
- **Solução**: Atualizada para usar os campos corretos

## Correções Aplicadas

### 1. **Componente EditarEventoEntidade Corrigido**
**Arquivo**: `src/components/EditarEventoEntidade.tsx`

```typescript
// Antes
const [dataEvento, setDataEvento] = useState(
  new Date(evento.data_evento).toISOString().slice(0, 16)
);

// Depois
const [dataEvento, setDataEvento] = useState(() => {
  // Combinar data e horário para criar um datetime-local
  const data = new Date(evento.data);
  const horario = evento.horario;
  
  if (horario) {
    const [horas, minutos] = horario.split(':');
    data.setHours(parseInt(horas), parseInt(minutos), 0, 0);
  }
  
  return data.toISOString().slice(0, 16);
});
```

### 2. **Função RPC Corrigida**
**Arquivo**: `supabase/migrations/20250115000018_fix_update_event_function.sql`

```sql
-- Separar data e horário do timestamp se fornecido
IF _data_evento IS NOT NULL THEN
  _data := _data_evento::date;
  _horario := _data_evento::time;
END IF;

-- Update usando os campos corretos
UPDATE public.eventos 
SET 
  nome = COALESCE(_nome, nome),
  descricao = COALESCE(_descricao, descricao),
  local = COALESCE(_local, local),
  data = COALESCE(_data, data),
  horario = COALESCE(_horario, horario),
  capacidade = COALESCE(_capacidade, capacidade),
  status = COALESCE(_status, status),
  updated_at = now()
WHERE id = _evento_id AND entidade_id = _entidade_id;
```

### 3. **Tipo Evento Corrigido**
**Arquivo**: `src/hooks/useEventosEntidade.ts`

```typescript
// Antes
export interface Evento {
  data_evento: string;
  // ...
}

// Depois
export interface Evento {
  data: string;
  horario?: string;
  // ...
}
```

## Passos para Resolver

### Passo 1: Executar Migração
```sql
-- No Supabase Dashboard > SQL Editor
-- Execute a migração: 20250115000018_fix_update_event_function.sql
```

### Passo 2: Testar Edição
1. Acesse a página de detalhes de uma entidade
2. Clique em "Editar" em um evento existente
3. Verifique se o formulário carrega corretamente
4. Teste fazer uma alteração e salvar

### Passo 3: Verificar Funcionamento
1. Verifique se as alterações são salvas corretamente
2. Verifique se o evento atualizado aparece na lista
3. Verifique se a data e horário estão corretos

## Comandos Úteis

### Verificar Função RPC
```sql
-- Verificar se a função existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'update_event_as_entity';
```

### Testar Atualização de Evento
```sql
-- Testar a função diretamente
SELECT update_event_as_entity(
  'uuid-do-evento',  -- evento_id
  1,                  -- entidade_id
  'Novo Nome',       -- nome
  'Nova descrição',   -- descricao
  'Novo local',      -- local
  NOW(),             -- data_evento
  25                 -- capacidade
);
```

### Verificar Eventos Atualizados
```sql
-- Verificar eventos com data e horário
SELECT id, nome, data, horario, status_aprovacao 
FROM public.eventos 
ORDER BY data, horario;
```

## Próximos Passos
1. Execute a migração no Supabase
2. Teste a edição de eventos
3. Verifique se tudo funciona corretamente
4. Se funcionar, remova os arquivos de debug

## Arquivos Modificados
- `src/components/EditarEventoEntidade.tsx`
- `supabase/migrations/20250115000018_fix_update_event_function.sql`
- `src/hooks/useEventosEntidade.ts`
- `CORRECAO_EDICAO_EVENTOS.md` 