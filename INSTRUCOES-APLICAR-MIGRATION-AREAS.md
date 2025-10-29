# 🚀 Instruções para Aplicar a Migration de Separação de Áreas

## ⚠️ IMPORTANTE: Ordem de Execução

Execute as migrations **EXATAMENTE nesta ordem**:

1. **PRIMEIRO**: Migration `20250128_add_areas_internas.sql` (se ainda não foi aplicada)
2. **DEPOIS**: Migration `20250129_separate_ps_areas.sql`

## 📝 Passo a Passo

### Etapa 1: Verificar se a primeira migration foi aplicada

1. Acesse o SQL Editor do Supabase:
   - URL: https://supabase.com/dashboard/project/lddtackcnpzdswndqgfs/editor/sql

2. Execute este comando para verificar:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entidades' 
AND column_name = 'areas_internas';
```

**Resultado esperado:**
- Se retornar 1 linha com `areas_internas | ARRAY`: ✅ Migration 1 já foi aplicada, pule para Etapa 3
- Se retornar 0 linhas: ⚠️ Você precisa aplicar a Migration 1 primeiro (vá para Etapa 2)

### Etapa 2: Aplicar Migration 1 (se necessário)

Cole e execute este SQL:

```sql
-- Migration 1: Adicionar campo areas_internas
ALTER TABLE public.entidades
ADD COLUMN IF NOT EXISTS areas_internas TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.entidades.areas_internas IS 'Array de áreas internas disponíveis para candidatos escolherem durante o processo seletivo';
```

✅ **Confirmação**: Execute novamente a query de verificação da Etapa 1. Agora deve retornar 1 linha.

### Etapa 3: Aplicar Migration 2 (Separação de Áreas)

Cole e execute este SQL:

```sql
-- Migration 2: Separar áreas internas das áreas do processo seletivo

-- Renomear campo atual para deixar claro que são áreas organizacionais
ALTER TABLE public.entidades
RENAME COLUMN areas_internas TO areas_estrutura_organizacional;

-- Criar novo campo para áreas do processo seletivo
ALTER TABLE public.entidades
ADD COLUMN areas_processo_seletivo TEXT[] DEFAULT '{}';

-- Copiar dados existentes para o novo campo (inicialmente todas as áreas estarão no PS)
UPDATE public.entidades
SET areas_processo_seletivo = areas_estrutura_organizacional
WHERE areas_estrutura_organizacional IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.entidades.areas_estrutura_organizacional IS 'Departamentos/áreas da estrutura organizacional da entidade';
COMMENT ON COLUMN public.entidades.areas_processo_seletivo IS 'Áreas com vagas abertas no processo seletivo (subset de areas_estrutura_organizacional)';
```

### Etapa 4: Verificar se tudo funcionou

Execute esta query para confirmar:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'entidades' 
AND column_name IN ('areas_estrutura_organizacional', 'areas_processo_seletivo')
ORDER BY column_name;
```

**✅ Resultado esperado:**
```
areas_estrutura_organizacional | ARRAY    | '{}'::text[]
areas_processo_seletivo        | ARRAY    | '{}'::text[]
```

### Etapa 5: Testar com dados reais

Se você tem uma entidade com ID 6 (AgroInsper), teste:

```sql
-- Ver os dados atuais
SELECT 
  id, 
  nome, 
  areas_estrutura_organizacional, 
  areas_processo_seletivo,
  processo_seletivo_ativo
FROM entidades 
WHERE id = 6;

-- (Opcional) Adicionar áreas de teste
-- DESCOMENTE E EXECUTE APENAS SE QUISER TESTAR:
-- UPDATE entidades 
-- SET 
--   areas_estrutura_organizacional = ARRAY['Marketing', 'Finanças', 'Projetos', 'Tecnologia', 'Eventos'],
--   areas_processo_seletivo = ARRAY['Marketing', 'Finanças', 'Projetos']
-- WHERE id = 6;
```

## 🎯 Como Usar Após a Migration

### Para Owners da Entidade:

#### 1️⃣ Gerenciar Áreas Internas (Estrutura Organizacional)
- **Onde**: Menu "Áreas Internas" no perfil da entidade
- **O que fazer**: Adicione todos os departamentos/times da sua organização
- **Exemplo**: Marketing, Finanças, Projetos, Tecnologia, Eventos, RH, etc.

#### 2️⃣ Selecionar Áreas com Vagas no Processo Seletivo
- **Onde**: Aba "Processo Seletivo" → "Configuração" → Seção "Áreas com Vagas no Processo Seletivo"
- **O que fazer**: 
  1. Clique em "Gerenciar Áreas do PS"
  2. Marque apenas as áreas que têm vagas abertas neste processo
  3. Salve

**💡 Diferença chave:**
- **Áreas Internas**: Todos os departamentos da organização (estrutura completa)
- **Áreas do PS**: Apenas as áreas com vagas abertas no processo seletivo atual

### Para Estudantes:

Ao se inscrever no processo seletivo:
1. O campo "Área de Interesse" será um **dropdown**
2. Aparecerão **apenas as áreas com vagas abertas** (não todas as áreas da entidade)
3. Selecione a área de seu interesse e complete a inscrição

## 🔧 Troubleshooting

### ❌ Erro: "column areas_internas already exists"
**Solução**: A Migration 1 já foi aplicada. Pule direto para a Etapa 3 (Migration 2).

### ❌ Erro: "column areas_internas does not exist"
**Situação**: Você tentou aplicar a Migration 2 sem ter aplicado a Migration 1.
**Solução**: Volte para a Etapa 2 e aplique a Migration 1 primeiro.

### ❌ Erro: "column areas_estrutura_organizacional already exists"
**Solução**: A Migration 2 já foi aplicada! Você está pronto. Execute a query de verificação da Etapa 4 para confirmar.

### ⚠️ As áreas não aparecem no dropdown do formulário
**Verificações:**
1. A entidade tem `processo_seletivo_ativo = true`?
2. A entidade tem áreas cadastradas em `areas_processo_seletivo`?
3. Você atualizou a página após cadastrar as áreas?

**Como verificar:**
```sql
SELECT 
  id, 
  nome, 
  processo_seletivo_ativo,
  areas_processo_seletivo
FROM entidades 
WHERE id = SUA_ENTIDADE_ID;
```

### ⚠️ Botão "Gerenciar Áreas" não abre o modal
**Solução**: Atualize a página (F5). O código foi corrigido para abrir o modal diretamente.

## 📊 Fluxo Completo de Uso

```
1. Owner cadastra Áreas Internas
   ↓
2. Owner ativa o Processo Seletivo
   ↓
3. Owner seleciona quais áreas têm vagas
   ↓
4. Estudante vê apenas áreas com vagas ao se inscrever
   ↓
5. Estudante escolhe uma área e se inscreve
   ↓
6. Owner vê a área escolhida na inscrição
```

## ✅ Checklist Final

- [ ] Migration 1 aplicada (campo `areas_internas` criado ou já existia)
- [ ] Migration 2 aplicada (campos `areas_estrutura_organizacional` e `areas_processo_seletivo` criados)
- [ ] Verificação executada (ambas as colunas aparecem no `information_schema`)
- [ ] Teste com entidade real (dados foram migrados corretamente)
- [ ] Interface testada (botões de gerenciar áreas funcionando)
- [ ] Formulário de inscrição testado (dropdown com áreas aparece)

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase (Dashboard → Logs)
3. Execute as queries de verificação acima
4. Confirme que está autenticado como owner da entidade

---

**📌 Lembre-se**: Esta é uma migração de dados importantes. Se tiver dúvidas, faça um backup antes de executar!

