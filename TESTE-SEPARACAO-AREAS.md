# 🧪 Guia de Teste: Separação de Áreas Internas e Áreas do Processo Seletivo

## ✅ Implementação Concluída

Todas as alterações foram implementadas com sucesso! Agora você pode testar o novo sistema.

## 📋 O Que Foi Implementado

### 1. **Separação de Áreas em Dois Tipos**

| Tipo | Coluna no DB | Descrição | Uso |
|------|-------------|-----------|-----|
| **Áreas Internas** | `areas_estrutura_organizacional` | Estrutura completa da organização | Organizacional e gestão de membros |
| **Áreas do PS** | `areas_processo_seletivo` | Áreas com vagas abertas | Inscrições no processo seletivo |

### 2. **Novos Componentes**

- ✅ `GerenciarAreasProcessoSeletivo.tsx` - Gerenciar áreas com vagas no PS
- ✅ `EditarProcessoSeletivo.tsx` - Modal dedicado para editar PS
- 🔄 `GerenciarAreasInternas.tsx` - Atualizado para usar `areas_estrutura_organizacional`
- 🔄 `BotaoInscreverEntidade.tsx` - Atualizado para usar `areasPS` no dropdown

### 3. **Hook Atualizado**

- `useAreasInternas` agora retorna:
  - `areasInternas` (estrutura organizacional)
  - `areasPS` (áreas do processo seletivo)

### 4. **Migrations Criadas**

- ✅ `20250128_add_areas_internas.sql` - Adiciona campo inicial
- ✅ `20250129_separate_ps_areas.sql` - Separa em dois campos distintos

## 🚀 Como Testar (Passo a Passo)

### Preparação: Aplicar Migrations

1. **Abra o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/lddtackcnpzdswndqgfs/editor/sql
   ```

2. **Execute as migrations** (consulte `INSTRUCOES-APLICAR-MIGRATION-AREAS.md`)

3. **Verifique se deu certo** executando `verify-areas-migration.sql`

### Teste 1: Gerenciar Áreas Internas (Owner)

**Objetivo:** Cadastrar a estrutura organizacional completa da entidade.

1. **Acesse o perfil da sua entidade** (ex: AgroInsper)
2. **Localize a seção "Áreas Internas"** (menu de navegação)
3. **Clique no botão "Gerenciar Áreas Internas"**
4. **Adicione áreas:**
   - Marketing
   - Finanças
   - Projetos
   - Tecnologia
   - Eventos
   - RH
5. **Clique em "Salvar"**

**✅ Resultado esperado:**
- Toast de sucesso aparece
- Áreas são salvas no banco (`areas_estrutura_organizacional`)

### Teste 2: Selecionar Áreas com Vagas no PS (Owner)

**Objetivo:** Definir quais áreas têm vagas abertas no processo seletivo.

1. **Vá para "Processo Seletivo" → "Configuração"**
2. **Encontre o card "Áreas com Vagas no Processo Seletivo"**
3. **Clique em "Gerenciar Áreas do PS"**
4. **Marque apenas 3 áreas** (ex: Marketing, Finanças, Projetos)
5. **Clique em "Salvar"**

**✅ Resultado esperado:**
- Modal mostra todas as áreas internas como checkboxes
- Apenas as áreas marcadas são salvas em `areas_processo_seletivo`
- Card exibe as 3 áreas selecionadas

**🔍 Verificação no DB:**
```sql
SELECT 
  nome,
  areas_estrutura_organizacional,
  areas_processo_seletivo
FROM entidades
WHERE id = 6; -- substitua pelo ID da sua entidade
```

### Teste 3: Inscrição de Estudante

**Objetivo:** Verificar que estudantes veem apenas áreas com vagas abertas.

1. **Desautentique como owner** (ou use navegação anônima)
2. **Acesse o perfil da entidade**
3. **Clique em "Inscrever-se no Processo Seletivo"**
4. **Observe o campo "Área de Interesse"**

**✅ Resultado esperado:**
- Campo é um **dropdown** (não texto livre)
- Dropdown mostra **apenas as 3 áreas** marcadas no PS (Marketing, Finanças, Projetos)
- **NÃO** mostra as outras áreas internas (Tecnologia, Eventos, RH)

### Teste 4: Editar Processo Seletivo (Owner)

**Objetivo:** Verificar que o modal dedicado está funcionando.

1. **Na aba "Configuração" do Processo Seletivo**
2. **Clique em "Editar Processo Seletivo"** (botão verde)
3. **Observe o modal que abre**

**✅ Resultado esperado:**
- Modal é dedicado ao processo seletivo (não é o modal de editar entidade)
- Mostra toggle de ativação
- Mostra campos de datas (abertura, fechamento, fases)
- Botão "Salvar Alterações" funciona

### Teste 5: Remover Área do PS (Owner)

**Objetivo:** Verificar que é possível remover áreas do PS mantendo nas áreas internas.

1. **Volte para "Gerenciar Áreas do PS"**
2. **Desmarque uma área** (ex: Projetos)
3. **Salve**
4. **Abra o formulário de inscrição novamente**

**✅ Resultado esperado:**
- Dropdown agora mostra **apenas 2 áreas** (Marketing, Finanças)
- As áreas internas ainda têm as 6 áreas originais (verifique no DB)

### Teste 6: Integração com Demonstrações de Interesse

**Objetivo:** Verificar que o sistema antigo ainda funciona quando PS está inativo.

1. **Desative o processo seletivo:**
   - Vá para "Editar Processo Seletivo"
   - Desative o toggle "Processo Seletivo Ativo"
   - Salve

2. **Acesse o perfil da entidade (sem autenticação)**
3. **Observe o botão de inscrição**

**✅ Resultado esperado:**
- Botão muda para **"Demonstrar Interesse"**
- Ao clicar, usa o sistema antigo (`demonstracoes_interesse`)
- Campo "Área de Interesse" volta a ser texto livre

## 🐛 Cenários de Erro para Testar

### Cenário 1: Entidade sem Áreas Internas

1. **Crie uma nova entidade (ou use uma de teste)**
2. **NÃO cadastre áreas internas**
3. **Tente abrir "Gerenciar Áreas do PS"**

**✅ Resultado esperado:**
- Modal mostra: "Nenhuma área interna cadastrada"
- Instrui a cadastrar áreas internas primeiro
- Botão "Salvar" fica desabilitado

### Cenário 2: PS Ativo sem Áreas

1. **Ative o processo seletivo**
2. **Remova todas as áreas do PS**
3. **Acesse o formulário de inscrição**

**✅ Resultado esperado:**
- Campo "Área de Interesse" mostra: "Nenhuma área disponível no processo seletivo"
- Estudante ainda pode se inscrever (área fica vazia)

### Cenário 3: Botão "Gerenciar Áreas" no Header

1. **Como owner, no topo da página da entidade**
2. **Observe o botão "Gerenciar Áreas Internas"**

**✅ Resultado esperado:**
- Botão está **visível** com fundo semi-transparente branco
- **NÃO** está oculto (não precisa passar o mouse)
- Ao clicar, abre o modal de gerenciar áreas internas

## 📊 Queries de Verificação

### Ver estrutura da tabela:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entidades' 
AND column_name IN ('areas_estrutura_organizacional', 'areas_processo_seletivo');
```

### Ver dados da entidade:
```sql
SELECT 
  id, 
  nome, 
  processo_seletivo_ativo,
  areas_estrutura_organizacional AS areas_internas,
  areas_processo_seletivo AS areas_vagas_ps
FROM entidades 
WHERE id = 6; -- AgroInsper
```

### Verificar inscrições:
```sql
SELECT 
  i.id,
  i.nome,
  i.area_interesse,
  i.fase_atual,
  e.nome AS entidade
FROM inscricoes_processo_seletivo i
JOIN entidades e ON e.id = i.entidade_id
WHERE i.entidade_id = 6
ORDER BY i.created_at DESC
LIMIT 10;
```

## ✅ Checklist de Testes

- [ ] Migration 1 aplicada (`areas_internas` → `areas_estrutura_organizacional`)
- [ ] Migration 2 aplicada (`areas_processo_seletivo` criado)
- [ ] Verificação SQL executada com sucesso
- [ ] **Teste 1:** Cadastrar áreas internas ✅
- [ ] **Teste 2:** Selecionar áreas do PS ✅
- [ ] **Teste 3:** Dropdown no formulário mostra apenas áreas do PS ✅
- [ ] **Teste 4:** Modal de editar PS funciona ✅
- [ ] **Teste 5:** Remover área do PS funciona ✅
- [ ] **Teste 6:** Sistema antigo (demonstrações) ainda funciona ✅
- [ ] **Cenário 1:** Entidade sem áreas internas ✅
- [ ] **Cenário 2:** PS ativo sem áreas ✅
- [ ] **Cenário 3:** Botão no header visível ✅

## 🆘 Problemas Comuns

### ❌ "column areas_estrutura_organizacional does not exist"
**Causa:** Migration não foi aplicada.
**Solução:** Execute as migrations conforme `INSTRUCOES-APLICAR-MIGRATION-AREAS.md`.

### ❌ Dropdown não aparece no formulário
**Causas possíveis:**
1. `processo_seletivo_ativo = false` → Ative o PS
2. `areas_processo_seletivo` está vazio → Cadastre áreas no PS
3. Cache do navegador → Force refresh (Ctrl+Shift+R)

**Verificação:**
```sql
SELECT processo_seletivo_ativo, areas_processo_seletivo 
FROM entidades 
WHERE id = SUA_ENTIDADE_ID;
```

### ❌ Botão "Gerenciar Áreas" não faz nada
**Solução:** Limpe o cache do navegador ou force refresh (Ctrl+Shift+R).

### ❌ Modal de editar PS não abre
**Causas:**
1. Erro de console no navegador → F12 e verifique
2. Componente não foi importado corretamente → Verifique `EntidadeDetalhes.tsx`

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `supabase/migrations/20250129_separate_ps_areas.sql`
- ✅ `src/components/GerenciarAreasProcessoSeletivo.tsx`
- ✅ `src/components/EditarProcessoSeletivo.tsx`
- ✅ `INSTRUCOES-APLICAR-MIGRATION-AREAS.md`
- ✅ `SEPARACAO-AREAS-IMPLEMENTACAO.md`
- ✅ `verify-areas-migration.sql`
- ✅ `TESTE-SEPARACAO-AREAS.md` (este arquivo)

### Arquivos Modificados:
- 🔄 `src/hooks/useAreasInternas.ts`
- 🔄 `src/components/GerenciarAreasInternas.tsx`
- 🔄 `src/components/BotaoInscreverEntidade.tsx`
- 🔄 `src/pages/EntidadeDetalhes.tsx`
- 🔄 `MIGRATION_INSTRUCTIONS.md`

## 🎯 Próximos Passos

1. ✅ **Aplicar migrations** (seguir `INSTRUCOES-APLICAR-MIGRATION-AREAS.md`)
2. ✅ **Executar verificação** (`verify-areas-migration.sql`)
3. ✅ **Testar todos os cenários** (este documento)
4. ✅ **Validar com entidade real** (ex: AgroInsper)
5. 🚀 **Deploy para produção** (se tudo estiver funcionando)

---

**🎉 Pronto para testar!** Execute as migrations e comece pelos testes na ordem apresentada.

