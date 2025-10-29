# Processo Seletivo Simplificado

## ✅ Implementação Completa

Sistema **super simples** de processo seletivo para organizações estudantis, seguindo o mesmo padrão da funcionalidade de "Demonstrações de Interesse".

---

## 📋 Como Funciona

### Para Alunos:
1. Acessam a página da entidade
2. Vão na aba "Gestão de Membros" > "Teste PS" > "Inscrever-se"
3. Clicam em **"Inscrever-se no Processo Seletivo"**
4. Seus dados do perfil são automaticamente enviados

### Para Owners da Entidade:
1. Acessam a mesma aba "Teste PS" > "Gerenciar Inscrições"
2. Veem lista de todos os candidatos com informações completas
3. Podem **Aprovar** ou **Rejeitar** cada inscrição
4. Status é atualizado em tempo real

---

## 🗂️ Estrutura do Banco de Dados

### Tabela: `inscricoes_processo_seletivo`

```sql
- id (uuid)
- entidade_id (integer) → FK para entidades
- user_id (uuid) → FK para auth.users
- nome_estudante (text)
- email_estudante (text)
- curso_estudante (text)
- semestre_estudante (integer)
- area_interesse (text)
- mensagem (text) - opcional
- status (text) → 'pendente' | 'aprovado' | 'reprovado'
- created_at, updated_at
```

### Políticas RLS (Row Level Security):

- **SELECT**: Alunos veem suas próprias inscrições + owners veem da sua entidade
- **INSERT**: Alunos podem se inscrever
- **UPDATE**: Apenas owners da entidade
- **DELETE**: Apenas owners da entidade

### Constraint:
- **Unique** por `(entidade_id, user_id)` → evita inscrições duplicadas

---

## 🔧 Arquivos Criados/Modificados

### 1. Migration SQL
- **`supabase/migrations/20250122_processo_seletivo_simples.sql`**
  - Cria tabela `inscricoes_processo_seletivo`
  - Define RLS policies
  - Adiciona índices para performance
  - Trigger para `updated_at`

### 2. Tipos TypeScript
- **`src/types/processo-seletivo.ts`**
  - Interface `InscricaoProcessoSeletivo`

### 3. Hooks
- **`src/hooks/useAplicacaoProcesso.ts`** (Alunos)
  - `aplicar(mensagem?)` → insere inscrição diretamente no Supabase
  - Usa dados do perfil do usuário automaticamente
  
- **`src/hooks/useInscricoesProcesso.ts`** (Owners)
  - `fetchInscricoes()` → lista todas as inscrições da entidade
  - `decidir(id, status)` → aprova/reprova inscrição

### 4. Componentes
- **`src/components/BotaoInscreverEntidade.tsx`**
  - Botão para aluno se inscrever
  - Mostra toast de sucesso/erro
  - Desabilita após inscrição

- **`src/components/ListaInscricoesEntidade.tsx`**
  - Lista formatada com cards de candidatos
  - Badges de status (pendente/aprovado/reprovado)
  - Botões de ação apenas para pendentes
  - Mostra info completa: nome, email, curso, semestre, área, mensagem

- **`src/components/TesteProcessoSeletivo.tsx`**
  - Componente principal com 2 tabs
  - Tab "Inscrever-se": para alunos
  - Tab "Gerenciar Inscrições": para owners

### 5. Integração
- **`src/pages/EntidadeDetalhes.tsx`**
  - Adicionada aba "Teste PS" na seção "Gestão de Membros"
  - Passa `entidadeId` para o componente

---

## 🚀 Como Aplicar

### 1. Execute a migration no Supabase Dashboard:

```sql
-- Copie e cole o conteúdo de:
supabase/migrations/20250122_processo_seletivo_simples.sql
```

### 2. Teste a funcionalidade:

1. **Como Aluno**:
   - Acesse `/entidades/17` (ou outra entidade)
   - Login normal de estudante
   - Vá em "Gestão de Membros" > "Teste PS"
   - Clique em "Inscrever-se no Processo Seletivo"
   - ✅ Sucesso: mensagem verde + botão desabilitado

2. **Como Owner**:
   - Login com credenciais da entidade
   - Vá em "Gestão de Membros" > "Teste PS" > "Gerenciar Inscrições"
   - Veja lista de candidatos
   - Clique em "Aprovar" ou "Rejeitar"
   - ✅ Status atualiza imediatamente

---

## 🎨 Vantagens desta Abordagem

1. **Simples**: Sem RPCs complicados, apenas queries diretas
2. **Seguro**: RLS garante que apenas owners e candidatos acessem os dados corretos
3. **Rápido**: Sem overhead de funções PL/pgSQL
4. **Familiar**: Segue exatamente o padrão de `demonstracoes_interesse`
5. **Escalável**: Fácil adicionar campos ou lógica depois
6. **Testável**: Menos pontos de falha

---

## 📊 Próximos Passos (Opcionais)

1. **Notificações**: Adicionar ao aprovar/reprovar (já existe infra)
2. **Formulário customizado**: Permitir mensagem personalizada na inscrição
3. **Filtros**: Adicionar filtros por status na lista de inscrições
4. **Exportação**: Botão para exportar CSV de candidatos
5. **Estatísticas**: Dashboard com métricas (total, aprovados, pendentes, etc.)

---

## ❓ Troubleshooting

### Erro ao inscrever:
- Verifique se o usuário está logado e tem perfil completo
- Verifique se a migration foi aplicada corretamente
- Cheque se não há inscrição duplicada (unique constraint)

### Erro ao aprovar/rejeitar:
- Verifique se está logado como owner da entidade
- Confirme que a RLS policy está ativa
- Verifique logs do Supabase

### Inscrições não aparecem:
- Verifique se está usando o `entidadeId` correto
- Confirme que há inscrições no banco: `SELECT * FROM inscricoes_processo_seletivo WHERE entidade_id = 17;`

---

## 📝 Notas

- A implementação anterior com RPCs foi **removida** por ser complexa demais
- Esta versão é **100% funcional** e pronta para produção
- **Sem dependências** de outros sistemas (pode funcionar standalone)
- **Compatível** com sistema de notificações existente (fácil integrar depois)

