# Correção dos Tipos TypeScript - Tabela Eventos

## Problema Identificado
Os tipos TypeScript estão definindo `data_evento` mas a tabela real tem campos separados `data` e `horario`.

## Estrutura Real da Tabela
```sql
-- Campos reais da tabela eventos:
- id: uuid
- nome: text
- descricao: text
- data: date                    -- ✅ Campo correto
- horario: time without time zone -- ✅ Campo correto
- local: text
- entidade_id: bigint
- capacidade: integer
- status: text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- status_aprovacao: text
- comentario_aprovacao: text
- data_aprovacao: timestamp with time zone
- aprovador_email: text
```

## Tipos TypeScript Atuais (INCORRETOS)
```typescript
// ❌ INCORRETO - campo data_evento não existe
eventos: {
  Row: {
    data_evento: string  // ❌ Este campo não existe na tabela
  }
}
```

## Tipos TypeScript Corrigidos (CORRETOS)
```typescript
// ✅ CORRETO - campos reais da tabela
eventos: {
  Row: {
    id: string
    nome: string
    descricao: string | null
    data: string                    // ✅ Campo correto (date)
    horario: string | null          // ✅ Campo correto (time)
    local: string | null
    entidade_id: number | null
    capacidade: number | null
    status: string | null
    created_at: string
    updated_at: string
    status_aprovacao: string | null
    comentario_aprovacao: string | null
    data_aprovacao: string | null
    aprovador_email: string | null
  }
}
```

## Arquivos que Precisam ser Atualizados

### 1. **src/integrations/supabase/types.ts**
- Atualizar a definição da tabela `eventos`
- Remover `data_evento`
- Adicionar `data` e `horario`

### 2. **src/hooks/useEventos.ts**
- Atualizar queries para usar `data` e `horario`
- Atualizar ordenação

### 3. **src/pages/Eventos.tsx**
- Atualizar exibição para usar `data` e `horario`
- Atualizar formatação

### 4. **src/hooks/useEventosEntidade.ts**
- Atualizar queries para usar `data` e `horario`

### 5. **src/pages/EntidadeDetalhes.tsx**
- Atualizar exibição para usar `data` e `horario`

## Comandos para Atualizar Tipos

### 1. Regenerar Tipos do Supabase
```bash
# No terminal, na pasta do projeto
npx supabase gen types typescript --project-id lddtackcnpzdswndqgfs > src/integrations/supabase/types.ts
```

### 2. Ou Atualizar Manualmente
Editar `src/integrations/supabase/types.ts` e substituir a definição da tabela `eventos`.

## Próximos Passos

1. **Execute o script SQL** `corrigir_funcao_rpc_eventos.sql` no Supabase
2. **Atualize os tipos TypeScript** conforme documentado acima
3. **Teste a criação de eventos** usando o arquivo `test-data-debug.html`
4. **Verifique se o problema foi resolvido**

## Verificação

Após as correções, teste criando um evento e verifique se:
- A data é salva corretamente no campo `data`
- O horário é salvo corretamente no campo `horario`
- Não há mais eventos com data 05/08/2025 