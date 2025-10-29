# Instruções para Aplicar a Migration de Áreas Internas

## Resumo das Alterações

Foi implementado um sistema de **Áreas Internas** para o processo seletivo, permitindo que:
1. Entidades cadastrem suas áreas internas (ex: Marketing, Finanças, Projetos, etc.)
2. Estudantes escolham uma área de interesse ao se inscrever no processo seletivo
3. As áreas sejam gerenciadas diretamente na aba "Configuração" do Processo Seletivo

## Arquivos Criados/Modificados

### 1. Migration SQL
- **Arquivo**: `supabase/migrations/20250128_add_areas_internas.sql`
- **Descrição**: Adiciona o campo `areas_internas` (array de texto) na tabela `entidades`

### 2. Hook para Áreas Internas
- **Arquivo**: `src/hooks/useAreasInternas.ts`
- **Descrição**: Hook para buscar as áreas internas de uma entidade

### 3. Componente de Gerenciamento
- **Arquivo**: `src/components/GerenciarAreasInternas.tsx`
- **Descrição**: Interface para adicionar, visualizar e remover áreas internas

### 4. Botão de Inscrição Atualizado
- **Arquivo**: `src/components/BotaoInscreverEntidade.tsx`
- **Alteração**: Campo "Área de Interesse" agora é um dropdown com as áreas cadastradas pela entidade

### 5. Página de Detalhes da Entidade
- **Arquivo**: `src/pages/EntidadeDetalhes.tsx`
- **Alteração**: Nova seção "Áreas de Interesse" na aba "Configuração" do Processo Seletivo

## Como Aplicar as Migrations

⚠️ **IMPORTANTE**: Execute as migrations na ordem correta!

### Migration 1: Adicionar campo areas_internas (se ainda não foi aplicada)

**Arquivo:** `supabase/migrations/20250128_add_areas_internas.sql`

```sql
ALTER TABLE public.entidades
ADD COLUMN IF NOT EXISTS areas_internas TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.entidades.areas_internas IS 'Array de áreas internas disponíveis para candidatos escolherem durante o processo seletivo';
```

### Migration 2: Separar Áreas Internas das Áreas do Processo Seletivo

**Arquivo:** `supabase/migrations/20250129_separate_ps_areas.sql`

```sql
-- Renomear campo atual para deixar claro que são áreas organizacionais
ALTER TABLE public.entidades
RENAME COLUMN areas_internas TO areas_estrutura_organizacional;

-- Criar novo campo para áreas do processo seletivo
ALTER TABLE public.entidades
ADD COLUMN areas_processo_seletivo TEXT[] DEFAULT '{}';

-- Copiar dados existentes para o novo campo
UPDATE public.entidades
SET areas_processo_seletivo = areas_estrutura_organizacional
WHERE areas_estrutura_organizacional IS NOT NULL;

-- Comentários
COMMENT ON COLUMN public.entidades.areas_estrutura_organizacional IS 'Departamentos/áreas da estrutura organizacional da entidade';
COMMENT ON COLUMN public.entidades.areas_processo_seletivo IS 'Áreas com vagas abertas no processo seletivo (subset de areas_estrutura_organizacional)';
```

### Aplicação via Supabase Dashboard (Recomendado)
1. Acesse https://supabase.com/dashboard/project/lddtackcnpzdswndqgfs/editor/sql
2. Execute primeiro a Migration 1 (se ainda não foi executada)
3. Execute depois a Migration 2
4. Verifique se ambas foram aplicadas com sucesso

## Como Usar o Sistema

### Para Owners da Entidade:

#### 1. Cadastrar Áreas Internas da Organização
1. Acesse a seção **"Áreas Internas"** (disponível no menu de navegação)
2. Clique no botão **"Gerenciar Áreas Internas"**
3. Adicione as áreas/departamentos da sua organização (ex: Marketing, Finanças, Projetos, Desenvolvimento, etc.)
4. Clique em **"Salvar"**

#### 2. Selecionar Áreas com Vagas no Processo Seletivo
1. Vá para **"Processo Seletivo" → "Configuração"**
2. Encontre a seção **"Áreas com Vagas no Processo Seletivo"**
3. Clique no botão **"Gerenciar Áreas do PS"**
4. Marque as áreas internas que têm vagas abertas neste processo
5. Clique em **"Salvar"**

### Para Estudantes:

1. **Acesse a página da entidade**
2. **Clique em "Inscrever-se no Processo Seletivo"**
3. **No formulário, o campo "Área de Interesse" será um dropdown** com apenas as áreas que têm vagas abertas
4. **Selecione a área de seu interesse**
5. **Complete o formulário e envie**

## Comportamento do Sistema

### Separação de Áreas
- **Áreas Internas (Estrutura Organizacional)**: Todos os departamentos/times da entidade
- **Áreas do Processo Seletivo**: Subset das áreas internas com vagas abertas

### No Formulário de Inscrição
- **Se há áreas do PS cadastradas**: O campo "Área de Interesse" aparece como um dropdown com apenas as áreas com vagas
- **Se não há áreas do PS**: O campo aparece como texto livre com aviso "Nenhuma área disponível no processo seletivo"
- **Integração com demonstrações de interesse**: O sistema de áreas SOMENTE é usado quando `processo_seletivo_ativo = true`. Caso contrário, usa o antigo sistema de `demonstracoes_interesse`

## Verificando se Funcionou

Após aplicar as migrations, você pode verificar no SQL Editor:
```sql
-- Ver se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entidades' 
AND column_name IN ('areas_estrutura_organizacional', 'areas_processo_seletivo');

-- Ver as áreas de uma entidade
SELECT id, nome, areas_estrutura_organizacional, areas_processo_seletivo 
FROM entidades 
WHERE id = 6; -- substitua pelo ID da sua entidade

-- Testar update de áreas
UPDATE entidades 
SET areas_estrutura_organizacional = ARRAY['Marketing', 'Finanças', 'Projetos', 'Tecnologia'],
    areas_processo_seletivo = ARRAY['Marketing', 'Finanças']
WHERE id = 6;
```

## Troubleshooting

### Erro "column areas_estrutura_organizacional does not exist"
- A migration 2 ainda não foi aplicada. Execute a migration `20250129_separate_ps_areas.sql`

### Erro "column areas_internas does not exist" 
- Isso é esperado após aplicar a migration 2, pois o campo foi renomeado para `areas_estrutura_organizacional`

### Dropdown não aparece no formulário
- Verifique se a entidade tem **áreas do processo seletivo** cadastradas (não apenas áreas internas)
- Verifique se `processo_seletivo_ativo = true` para a entidade
- Verifique no console do navegador se há erros

### Não consigo salvar áreas
- Verifique se você está autenticado como owner da entidade
- Verifique as políticas RLS da tabela `entidades`

### As áreas não aparecem no modal de seleção do PS
- Certifique-se de ter cadastrado **áreas internas** primeiro
- As áreas do PS são um subset das áreas internas

## Suporte

Se encontrar problemas, verifique:
1. Os logs do navegador (F12 → Console)
2. Os logs do Supabase
3. As políticas RLS da tabela `entidades`

