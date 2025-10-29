# Implementação: Separação de Áreas Internas e Áreas do Processo Seletivo

## Resumo

Implementada a separação entre **Áreas Internas** (estrutura organizacional) e **Áreas do Processo Seletivo** (áreas com vagas abertas). As áreas do PS são um subset selecionável das áreas internas.

---

## Arquivos Criados

### 1. `supabase/migrations/20250129_separate_ps_areas.sql`
Migration que:
- Renomeia `areas_internas` → `areas_estrutura_organizacional`
- Cria novo campo `areas_processo_seletivo`
- Copia dados existentes para o novo campo

### 2. `src/components/GerenciarAreasProcessoSeletivo.tsx`
Novo componente com modal de checkboxes para selecionar quais áreas internas têm vagas no PS.

**Funcionalidades:**
- Lista todas as áreas internas
- Permite marcar/desmarcar áreas
- Valida que pelo menos uma área interna existe
- Salva no campo `areas_processo_seletivo`

---

## Arquivos Modificados

### 1. `src/hooks/useAreasInternas.ts`
**Antes:**
```typescript
return { areas, loading, error, refetch };
```

**Depois:**
```typescript
return { areasInternas, areasPS, loading, error, refetch };
```

Agora retorna ambos os tipos de áreas separadamente.

### 2. `src/components/GerenciarAreasInternas.tsx`
**Linha 64:** Alterado campo do update
```typescript
// Antes
.update({ areas_internas: areasInternas })

// Depois
.update({ areas_estrutura_organizacional: areasInternas })
```

### 3. `src/components/BotaoInscreverEntidade.tsx`
**Linha 26:** Usa `areasPS` ao invés de `areas`
```typescript
// Antes
const { areas } = useAreasInternas(entidadeId || 0);

// Depois
const { areasPS } = useAreasInternas(entidadeId || 0);
```

**Linhas 267-296:** Dropdown usa `areasPS`
- Mostra apenas áreas com vagas abertas
- Mensagem atualizada: "Nenhuma área disponível no processo seletivo"

### 4. `src/pages/EntidadeDetalhes.tsx`
**Adicionado import:**
```typescript
import GerenciarAreasProcessoSeletivo from '@/components/GerenciarAreasProcessoSeletivo';
```

**Linha 526:** Atualizado `GerenciarAreasInternas` na seção de cabeçalho
```typescript
areasAtuais={entidade.areas_estrutura_organizacional || []}
```

**Linhas 1836-1881:** Substituído card de "Áreas de Interesse" por novo card
- Título: "Áreas com Vagas no Processo Seletivo"
- Usa componente `GerenciarAreasProcessoSeletivo`
- Exibe badges de `entidade.areas_processo_seletivo`

**Linha 2064:** Atualizado `GerenciarAreasInternas` na seção 'areas'
```typescript
areasAtuais={entidade.areas_estrutura_organizacional || []}
```

---

## Fluxo de Uso Completo

### 1. Owner Cadastra Áreas Internas
1. Acessa seção "Áreas Internas"
2. Clica "Gerenciar Áreas Internas"
3. Adiciona: Marketing, Finanças, Projetos, Tecnologia, Design
4. Salva → dados vão para `areas_estrutura_organizacional`

### 2. Owner Seleciona Áreas para o PS
1. Vai em "Processo Seletivo" → "Configuração"
2. Seção "Áreas com Vagas no Processo Seletivo"
3. Clica "Gerenciar Áreas do PS"
4. Marca apenas: Marketing, Finanças, Tecnologia
5. Salva → dados vão para `areas_processo_seletivo`

### 3. Estudante Se Inscreve
1. Acessa página da entidade
2. Clica "Inscrever-se no Processo Seletivo"
3. No campo "Área de Interesse" vê dropdown com apenas:
   - Marketing
   - Finanças
   - Tecnologia
4. Seleciona uma área e envia

---

## Estrutura de Dados

### Banco de Dados (`entidades` table)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `areas_estrutura_organizacional` | `TEXT[]` | Todas as áreas/departamentos da entidade |
| `areas_processo_seletivo` | `TEXT[]` | Subset de áreas com vagas abertas no PS |

**Exemplo:**
```json
{
  "areas_estrutura_organizacional": ["Marketing", "Finanças", "Projetos", "Tecnologia", "Design"],
  "areas_processo_seletivo": ["Marketing", "Finanças", "Tecnologia"]
}
```

### Hook `useAreasInternas` Response

```typescript
{
  areasInternas: string[],  // Todas as áreas da estrutura
  areasPS: string[],         // Áreas com vagas no PS
  loading: boolean,
  error: string | null,
  refetch: () => void
}
```

---

## Componentes e Responsabilidades

| Componente | Gerencia | Campo no Banco |
|------------|----------|----------------|
| `GerenciarAreasInternas` | Estrutura organizacional | `areas_estrutura_organizacional` |
| `GerenciarAreasProcessoSeletivo` | Áreas com vagas no PS | `areas_processo_seletivo` |
| `BotaoInscreverEntidade` | Exibe áreas no formulário | Lê `areas_processo_seletivo` |

---

## Validações Implementadas

### No `GerenciarAreasProcessoSeletivo`
1. ✅ Verifica se há áreas internas cadastradas
2. ✅ Desabilita botão "Salvar" se não há áreas internas
3. ✅ Mostra mensagem orientando a cadastrar áreas internas primeiro

### No `BotaoInscreverEntidade`
1. ✅ Renderiza dropdown apenas se `areasPS.length > 0`
2. ✅ Fallback para input de texto se não há áreas no PS
3. ✅ Mensagem clara: "Nenhuma área disponível no processo seletivo"

---

## Testes Recomendados

### Teste 1: Fluxo Completo
1. ✅ Cadastrar 5 áreas internas
2. ✅ Selecionar 3 áreas para o PS
3. ✅ Verificar que formulário de inscrição mostra apenas as 3 áreas
4. ✅ Desmarcar todas as áreas do PS
5. ✅ Verificar que formulário mostra input de texto livre

### Teste 2: Caso Sem Áreas Internas
1. ✅ Nova entidade sem áreas cadastradas
2. ✅ Tentar abrir "Gerenciar Áreas do PS"
3. ✅ Verificar mensagem: "Nenhuma área interna cadastrada"
4. ✅ Botão "Salvar" deve estar desabilitado

### Teste 3: Persistência de Dados
1. ✅ Cadastrar áreas internas
2. ✅ Selecionar áreas para PS
3. ✅ Recarregar página
4. ✅ Verificar que ambas as seleções foram mantidas

---

## Benefícios da Implementação

1. **Clareza Conceitual**
   - Separação clara entre estrutura organizacional e vagas abertas
   - Nomenclatura mais descritiva

2. **Flexibilidade**
   - Entidade pode ter muitas áreas mas poucas com vagas
   - Fácil ativar/desativar vagas por área

3. **Experiência do Usuário**
   - Estudantes veem apenas áreas relevantes (com vagas)
   - Owners têm controle granular sobre o processo

4. **Manutenibilidade**
   - Dados bem separados no banco
   - Componentes com responsabilidades claras
   - Código autodocumentado

---

## Próximos Passos

1. ✅ Aplicar migration `20250129_separate_ps_areas.sql`
2. ✅ Testar fluxo completo em ambiente de desenvolvimento
3. ✅ Verificar se dados existentes foram migrados corretamente
4. ✅ Validar com entidades reais (ex: AgroInsper)
5. ⏳ Deploy em produção

---

## Notas Importantes

- ⚠️ **Migration irreversível**: O campo `areas_internas` será renomeado
- ✅ **Dados preservados**: Migration copia dados para o novo campo
- 🔄 **Compatibilidade**: Código antigo que usa `areas_internas` deve ser atualizado
- 📝 **Documentação**: `MIGRATION_INSTRUCTIONS.md` foi atualizado com instruções completas

