# Instruções para Funcionalidade de Múltiplos Professores Convidados

## 🎯 Funcionalidade Implementada

A funcionalidade de múltiplos professores convidados foi implementada com sucesso! Agora é possível adicionar mais de um professor/palestrante externo em uma única reserva de sala ou auditório.

## ✨ O que foi implementado

### 1. **Novo Componente de Gerenciamento**
- Criado o componente `ProfessoresConvidadosManager` que permite:
  - Adicionar múltiplos professores
  - Editar informações de cada professor individualmente
  - Remover professores
  - Validação completa para cada professor

### 2. **Atualização dos Formulários**
- **Formulário de Reserva de Auditório** (`ReservaAuditorioFormV3.tsx`)
- **Formulário de Reserva de Sala** (`ReservaSalaFormV2.tsx`)
- Ambos agora incluem o novo gerenciador de professores

### 3. **Estrutura de Dados Atualizada**
- Nova interface `ProfessorConvidado` em `src/types/reserva.ts`
- Campo `professores_convidados` adicionado ao `ReservaFormData`
- Compatibilidade mantida com campos antigos

### 4. **Banco de Dados**
- Nova tabela `professores_convidados` criada
- Migração SQL incluída em `supabase/migrations/20250124_create_professores_convidados_table.sql`
- Dados existentes migrados automaticamente

## 🚀 Como usar

### Para o Usuário Final:
1. **Acesse o formulário de reserva** (sala ou auditório)
2. **No Passo 3** (Informações Adicionais), você verá a seção "Professores/Palestrantes Convidados"
3. **Clique em "Adicionar Professor"** para adicionar um novo professor
4. **Preencha as informações** de cada professor:
   - Nome completo
   - Breve apresentação
   - Se é pessoa pública
   - Se haverá apoio externo (se for pessoa pública)
5. **Adicione quantos professores quiser** clicando no botão "Adicionar Professor"
6. **Remova professores** clicando no ícone de lixeira de cada card

### Para o Desenvolvedor:

#### Executar a Migração do Banco:
```sql
-- Execute o arquivo: supabase/migrations/20250124_create_professores_convidados_table.sql
-- no Supabase SQL Editor
```

#### Estrutura dos Dados:
```typescript
interface ProfessorConvidado {
  id: string;
  nomeCompleto: string;
  apresentacao: string;
  ehPessoaPublica: boolean;
  haApoioExterno?: boolean;
  comoAjudaraOrganizacao?: string;
}
```

## 🔧 Funcionalidades Técnicas

### Validação:
- Nome: mínimo 5, máximo 100 caracteres
- Apresentação: mínimo 10, máximo 500 caracteres
- Apoio externo: obrigatório se for pessoa pública e tiver apoio

### Armazenamento:
- **Tabela principal**: `reservas` (compatibilidade com JSON)
- **Tabela específica**: `professores_convidados` (estrutura normalizada)
- **Migração automática** de dados existentes

### Segurança:
- Row Level Security (RLS) habilitado
- Políticas de acesso baseadas no usuário autenticado
- Validação tanto no frontend quanto no backend

## 📋 Campos por Professor

Cada professor convidado possui:
- **Nome Completo** (obrigatório)
- **Apresentação** (obrigatório)
- **É pessoa pública?** (checkbox)
- **Haverá apoio externo?** (se for pessoa pública)
- **Como a empresa ajudará?** (se houver apoio externo)

## 🔄 Compatibilidade

- **Campos antigos mantidos** para compatibilidade
- **Migração automática** de dados existentes
- **Funciona com reservas antigas** sem problemas

## 🎨 Interface

- **Design consistente** com o resto da aplicação
- **Cards individuais** para cada professor
- **Botões intuitivos** para adicionar/remover
- **Validação visual** com mensagens de erro
- **Contadores de caracteres** para campos de texto

## ✅ Status da Implementação

- ✅ Tipos TypeScript atualizados
- ✅ Componente de gerenciamento criado
- ✅ Formulários de reserva atualizados
- ✅ Validações implementadas
- ✅ Migração do banco criada
- ✅ Hook de criação atualizado
- ✅ Compatibilidade mantida

## 🚨 Próximos Passos

1. **Execute a migração SQL** no Supabase
2. **Teste a funcionalidade** criando uma nova reserva
3. **Verifique se os dados** estão sendo salvos corretamente
4. **Teste a visualização** dos professores em reservas existentes

A funcionalidade está pronta para uso! 🎉
