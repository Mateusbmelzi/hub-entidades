# Correção: Avanço Automático de Candidatos Entre Fases

## Problema Identificado

Quando um candidato era aprovado na **Pré-Inscrição** (Fase 0), ele **não era automaticamente movido** para a próxima fase (Fase 2 - Entrevista Individual).

### Causa Raiz

O código tinha duas falhas:

1. **No hook `useAplicacaoProcesso.ts` (linhas 91-98)**:
   - Ao criar uma inscrição, o sistema buscava especificamente pela "Fase 1" (`ordem === 1`)
   - Como a Pré-Inscrição tem `ordem = 0`, o candidato não era associado a nenhuma fase inicial
   - Resultado: `fase_atual` ficava `null`, impedindo o avanço automático

2. **No hook `useAcompanhamentoFases.ts` (linha 222)**:
   - A lógica de aprovação verificava `if (candidato?.fase_atual)`
   - Como `fase_atual` era `null`, o candidato nunca avançava para a próxima fase

## Solução Implementada

### 1. Correção no `useAplicacaoProcesso.ts`

**Arquivo:** `src/hooks/useAplicacaoProcesso.ts`

**Antes:**
```typescript
// Buscar Fase 1 ativa para criar inscrição automática
const { data: fase1, error: faseError } = await supabase
  .from('processos_seletivos_fases')
  .select('id, template_formulario_id')
  .eq('entidade_id', entidadeId)
  .eq('ordem', 1)  // ❌ Problema: só funciona se primeira fase for ordem = 1
  .eq('ativa', true)
  .single();
```

**Depois:**
```typescript
// Buscar a primeira fase ativa (menor ordem) para criar inscrição automática
const { data: primeiraFase, error: faseError } = await supabase
  .from('processos_seletivos_fases')
  .select('id, template_formulario_id, ordem, nome')
  .eq('entidade_id', entidadeId)
  .eq('ativa', true)
  .order('ordem', { ascending: true })  // ✅ Busca pela menor ordem
  .limit(1)
  .single();
```

**Mudanças:**
- ✅ Remove filtro `eq('ordem', 1)`
- ✅ Adiciona `order('ordem', { ascending: true })` para pegar a fase com menor ordem
- ✅ Adiciona `.limit(1)` para garantir apenas uma fase
- ✅ Adiciona logs de debug para facilitar troubleshooting

**Resultado:**
- Agora funciona corretamente com **qualquer fase inicial** (ordem 0, 1, 2, etc.)
- Candidato é automaticamente associado à primeira fase do processo

### 2. Melhorias no `useAcompanhamentoFases.ts`

**Arquivo:** `src/hooks/useAcompanhamentoFases.ts`

**Adicionado:**
- ✅ Logs detalhados do processo de aprovação
- ✅ Warning quando candidato não tem fase atual
- ✅ Confirmação visual de qual fase o candidato está sendo movido

**Código adicionado:**
```typescript
console.log(`📊 Fase atual: ${faseAtual.nome} (ordem ${faseAtual.ordem})`);
console.log(`🔍 Próxima fase: ${proximaFase ? `${proximaFase.nome} (ordem ${proximaFase.ordem})` : 'Nenhuma (última fase)'}`);

if (!proximaFase) {
  console.log('✅ Última fase - Aprovando candidato definitivamente');
  // ... aprovar definitivamente
} else {
  console.log(`🚀 Movendo candidato para: ${proximaFase.nome}`);
  // ... mover para próxima fase
}
```

### 3. Melhorias no `AcompanhamentoFasesPS.tsx`

**Arquivo:** `src/components/AcompanhamentoFasesPS.tsx`

**Melhorado:**
- ✅ Toast mostra **qual fase** o candidato foi movido
- ✅ Mensagens diferentes para aprovação intermediária vs. aprovação final
- ✅ Duração maior do toast (4 segundos) para mensagens importantes

**Antes:**
```typescript
const result = await aprovarCandidato(candidatoId);
if (result.success) {
  toast.success('Candidato aprovado com sucesso!');
}
```

**Depois:**
```typescript
const result = await aprovarCandidato(candidatoId);
if (result.success) {
  if (proximaFase) {
    toast.success(`Candidato aprovado e movido para: ${proximaFase.nome}!`, {
      duration: 4000,
    });
  } else if (faseAtual) {
    toast.success('Candidato aprovado definitivamente no processo seletivo!', {
      duration: 4000,
    });
  } else {
    toast.success('Candidato aprovado com sucesso!');
  }
}
```

## Como Funciona Agora

### Fluxo Completo

```
┌─────────────────────────────────────────────────┐
│  1. Estudante se inscreve no processo seletivo  │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  2. Sistema busca a primeira fase ativa         │
│     (menor ordem - ex: Pré-Inscrição, ordem 0) │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  3. Cria registro em inscricoes_fases_ps        │
│     - inscricao_id: ID da inscrição             │
│     - fase_id: ID da primeira fase              │
│     - status: 'pendente'                        │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  4. Candidato aparece na aba "Pré-Inscrição"    │
│     com status PENDENTE                         │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  5. Owner clica em "Aprovar"                    │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  6. Sistema marca fase atual como 'aprovado'    │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  7. Sistema busca próxima fase (ordem + 1)      │
│     Ex: Fase 2 - Entrevista Individual          │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  8. Cria novo registro em inscricoes_fases_ps   │
│     na próxima fase com status 'pendente'       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  9. Toast aparece: "Candidato aprovado e        │
│     movido para: Fase 2 - Entrevista..."       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  10. Candidato agora aparece na aba "Fase 2"    │
│      com status PENDENTE                        │
└─────────────────────────────────────────────────┘
```

### Caso Especial: Última Fase

Se o candidato for aprovado na **última fase** do processo:

```
┌─────────────────────────────────────────────────┐
│  1. Owner aprova candidato na última fase       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  2. Sistema não encontra próxima fase           │
│     (ordem + 1 não existe)                      │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  3. Atualiza inscricoes_processo_seletivo       │
│     - status: 'aprovado'                        │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  4. Toast: "Candidato aprovado definitivamente  │
│     no processo seletivo!"                      │
└─────────────────────────────────────────────────┘
```

## Como Testar

### Teste 1: Nova Inscrição

1. **Como estudante, inscreva-se** no processo seletivo de uma entidade
2. **Verifique o console do navegador** (F12):
   - Deve aparecer: `✅ Criando inscrição na primeira fase: Pré-Inscrição (ordem 0)`
   - Deve aparecer: `✅ Candidato adicionado à primeira fase com sucesso`
3. **Como owner, acesse "Acompanhamento"**
4. **Verifique que o candidato aparece na aba "Pré-Inscrição"** com status Pendente

### Teste 2: Aprovar e Avançar

1. **Na aba "Pré-Inscrição", clique em "Aprovar"** no candidato
2. **Observe o toast** que aparece:
   - Deve dizer: `Candidato aprovado e movido para: Fase 2 - Entrevista Individual!`
3. **Verifique o console**:
   - `📊 Fase atual: Pré-Inscrição (ordem 0)`
   - `🔍 Próxima fase: Fase 2 - Entrevista Individual (ordem 2)`
   - `🚀 Movendo candidato para: Fase 2 - Entrevista Individual`
4. **Clique na aba "Fase 2"**
5. **Verifique que o candidato agora aparece lá** com status Pendente

### Teste 3: Aprovação Final

1. **Avance o candidato até a última fase** aprovando em cada fase
2. **Na última fase, clique em "Aprovar"**
3. **Observe o toast**:
   - Deve dizer: `Candidato aprovado definitivamente no processo seletivo!`
4. **Verifique o console**:
   - `📊 Fase atual: [Nome da Última Fase] (ordem N)`
   - `🔍 Próxima fase: Nenhuma (última fase)`
   - `✅ Última fase - Aprovando candidato definitivamente`

### Teste 4: Inscrição Legacy (Candidatos Antigos)

Se houver candidatos que já estão aprovados na Pré-Inscrição mas não foram movidos:

1. **Os logs vão mostrar**:
   - `⚠️ Candidato sem fase atual - não pode ser movido para próxima fase`
2. **Solução**: Esses candidatos precisam ser **manualmente adicionados** a uma fase via SQL:

```sql
-- Buscar ID da primeira fase ativa
SELECT id, nome, ordem 
FROM processos_seletivos_fases 
WHERE entidade_id = SUA_ENTIDADE_ID 
AND ativa = true 
ORDER BY ordem ASC 
LIMIT 1;

-- Adicionar candidato à primeira fase
INSERT INTO inscricoes_fases_ps (inscricao_id, fase_id, status, respostas_formulario)
VALUES ('ID_DA_INSCRICAO', 'ID_DA_PRIMEIRA_FASE', 'aprovado', '{}');
```

## Arquivos Alterados

- ✅ `src/hooks/useAplicacaoProcesso.ts` - Correção da busca da primeira fase
- ✅ `src/hooks/useAcompanhamentoFases.ts` - Logs de debug adicionados
- ✅ `src/components/AcompanhamentoFasesPS.tsx` - Toasts melhorados

## Benefícios

1. **Automação completa**: Candidatos avançam automaticamente ao serem aprovados
2. **Funciona com qualquer estrutura de fases**: Não importa se começa em ordem 0, 1, ou 10
3. **Feedback claro**: Owner vê exatamente para qual fase o candidato foi movido
4. **Debug facilitado**: Logs detalhados no console para troubleshooting
5. **Mensagens contextuais**: Toasts diferentes para aprovação intermediária vs. final

## Notas Importantes

### ⚠️ Candidatos Existentes

Candidatos que foram aprovados **antes desta correção** podem não ter `fase_atual`. Para esses casos:

1. O sistema vai logar: `⚠️ Candidato sem fase atual`
2. Será necessário adicioná-los manualmente a uma fase (ver SQL acima)
3. Ou reprovar e pedir para se inscreverem novamente

### ✅ Novos Candidatos

Todos os **novos candidatos** (após esta correção) serão automaticamente:
- Associados à primeira fase ao se inscrever
- Movidos para a próxima fase ao serem aprovados
- Aprovados definitivamente ao completarem a última fase

---

**Status:** ✅ Correção implementada e testada

**Data:** 2025-01-29

