# Sistema de Gestão de Membros das Organizações Estudantis

## Visão Geral

Sistema completo para gerenciar membros e cargos das organizações estudantis, com permissões customizáveis por cargo.

## Características Principais

- ✅ **Cargos Customizáveis**: Cada entidade pode criar seus próprios cargos
- ✅ **Permissões Granulares**: Controle fino sobre o que cada cargo pode fazer
- ✅ **Hierarquia Flexível**: Sistema de níveis hierárquicos configuráveis
- ✅ **Múltiplas Entidades**: Alunos podem participar de várias organizações estudantis
- ✅ **Histórico de Membros**: Membros inativos são mantidos para histórico
- ✅ **Segurança RLS**: Políticas de Row Level Security no Supabase

## Estrutura do Banco de Dados

### Tabelas

#### `cargos_entidade`
Armazena os cargos customizados de cada entidade.

```sql
- id (uuid)
- entidade_id (int)
- nome (text)
- descricao (text)
- nivel_hierarquia (int) - 1 = mais alto, 10 = mais baixo
- cor (text) - cor do badge em hexadecimal
- created_at, updated_at
```

#### `membros_entidade`
Relacionamento entre alunos e entidades com seus cargos.

```sql
- id (uuid)
- user_id (uuid) - referência para auth.users
- entidade_id (int)
- cargo_id (uuid)
- data_entrada (timestamp)
- ativo (boolean)
- created_at, updated_at
```

#### `permissoes_cargo`
Permissões específicas de cada cargo.

```sql
- id (uuid)
- cargo_id (uuid)
- permissao (text) - enum de permissões
- created_at
```

### Permissões Disponíveis

- `visualizar` - Visualizar informações da entidade
- `criar_eventos` - Criar e gerenciar eventos
- `editar_projetos` - Criar e editar projetos
- `editar_entidade` - Editar informações da entidade
- `aprovar_conteudo` - Aprovar conteúdo e solicitações
- `gerenciar_membros` - Adicionar, remover e alterar cargos de membros
- `gerenciar_cargos` - Criar, editar e remover cargos

### Cargos Padrão

Ao criar uma nova entidade, 3 cargos padrão são criados automaticamente:

1. **Presidente** (nível 1)
   - Todas as permissões
   - Cor: roxo (#9333ea)

2. **Gerente** (nível 2)
   - Criar eventos
   - Editar projetos
   - Visualizar
   - Cor: azul (#3b82f6)

3. **Membro** (nível 3)
   - Visualizar
   - Cor: verde (#10b981)

## Como Usar

### Para Entidades (Owners)

1. **Acessar Gestão de Membros**
   - Entre na página da sua organização estudantil
   - Role até a seção "Gestão de Membros"
   - Você verá duas abas: Membros e Cargos

2. **Gerenciar Membros**
   - Clique em "Adicionar Membro"
   - Busque o aluno por nome ou e-mail
   - Selecione o cargo desejado
   - Confirme a adição

3. **Alterar Cargo de Membro**
   - Na lista de membros, clique no menu de ações (⋮)
   - Selecione "Alterar Cargo"
   - Escolha o novo cargo
   - Confirme

4. **Remover Membro**
   - Na lista de membros, clique no menu de ações (⋮)
   - Selecione "Remover Membro"
   - Confirme a remoção
   - **Nota**: Não é possível remover o último presidente

5. **Criar Cargo Customizado**
   - Vá para a aba "Cargos"
   - Clique em "Novo Cargo"
   - Preencha:
     - Nome do cargo
     - Descrição (opcional)
     - Nível hierárquico (1-10)
     - Cor do badge
     - Permissões desejadas
   - Salve

6. **Editar Cargo**
   - Na lista de cargos, clique no ícone de editar
   - Altere as informações desejadas
   - Salve as alterações

7. **Excluir Cargo**
   - Na lista de cargos, clique no ícone de excluir
   - **Nota**: Só é possível excluir cargos sem membros ativos

### Para Desenvolvedores

#### Hooks Disponíveis

**usePermissoesUsuario**
```typescript
import { usePermissoesUsuario } from '@/hooks/usePermissoesUsuario';

const { 
  permissoes, 
  hasPermission, 
  hasAnyPermission,
  hasAllPermissions,
  loading 
} = usePermissoesUsuario({ entidadeId });

// Verificar uma permissão
if (hasPermission('gerenciar_membros')) {
  // usuário pode gerenciar membros
}

// Verificar múltiplas permissões (OR)
if (hasAnyPermission(['criar_eventos', 'editar_projetos'])) {
  // usuário tem pelo menos uma dessas permissões
}

// Verificar múltiplas permissões (AND)
if (hasAllPermissions(['criar_eventos', 'editar_entidade'])) {
  // usuário tem todas essas permissões
}
```

**useCargosEntidade**
```typescript
import { useCargosEntidade } from '@/hooks/useCargosEntidade';

const { 
  cargos, 
  createCargo, 
  updateCargo, 
  deleteCargo,
  loading 
} = useCargosEntidade({ 
  entidadeId,
  includePermissoes: true,
  includeTotalMembros: true
});

// Criar novo cargo
await createCargo({
  entidade_id: 1,
  nome: 'Diretor de Marketing',
  descricao: 'Responsável pela comunicação',
  nivel_hierarquia: 2,
  cor: '#f59e0b',
  permissoes: ['criar_eventos', 'editar_projetos']
});
```

**useMembrosEntidade**
```typescript
import { useMembrosEntidade } from '@/hooks/useMembrosEntidade';

const { 
  membros, 
  addMembro, 
  removeMembro, 
  updateMembroCargo,
  getTotalMembros,
  loading 
} = useMembrosEntidade({ 
  entidadeId,
  includeInativos: false
});

// Adicionar membro
await addMembro({
  user_id: 'uuid-do-usuario',
  entidade_id: 1,
  cargo_id: 'uuid-do-cargo'
});

// Alterar cargo
await updateMembroCargo('id-do-membro', 'novo-cargo-id');

// Remover membro
await removeMembro('id-do-membro');
```

#### Componentes

**GerenciarMembrosEntidade**
```tsx
import { GerenciarMembrosEntidade } from '@/components/GerenciarMembrosEntidade';

<GerenciarMembrosEntidade entidadeId={entidade.id} />
```

**GerenciarCargosEntidade**
```tsx
import { GerenciarCargosEntidade } from '@/components/GerenciarCargosEntidade';

<GerenciarCargosEntidade entidadeId={entidade.id} />
```

**BuscadorAlunos**
```tsx
import { BuscadorAlunos } from '@/components/BuscadorAlunos';

<BuscadorAlunos
  entidadeId={entidade.id}
  cargos={cargos}
  onAlunoSelecionado={(userId, cargoId) => {
    // Lógica de adicionar membro
  }}
  membrosAtuaisIds={membrosIds}
/>
```

## Funções RPC do Supabase

### check_entity_permission
Verifica se um usuário tem uma permissão específica em uma entidade.

```typescript
const { data } = await supabase.rpc('check_entity_permission', {
  _user_id: 'uuid-do-usuario',
  _entidade_id: 1,
  _permissao: 'gerenciar_membros'
});

// data será true ou false
```

### get_user_entity_permissions
Retorna todas as permissões de um usuário em uma entidade.

```typescript
const { data } = await supabase.rpc('get_user_entity_permissions', {
  _user_id: 'uuid-do-usuario',
  _entidade_id: 1
});

// data será um array de objetos: [{ permissao: 'criar_eventos' }, ...]
```

## Regras de Negócio

1. **Presidente Único**: Toda entidade deve ter pelo menos 1 presidente ativo
2. **Não pode remover último presidente**: Sistema impede a remoção do último presidente
3. **Um cargo ativo por entidade**: Cada aluno só pode ter um cargo ativo por entidade
4. **Múltiplas entidades**: Alunos podem participar de várias entidades simultaneamente
5. **Cargos não podem ser excluídos se tiverem membros**: Primeiro mova ou remova os membros
6. **Histórico mantido**: Membros removidos ficam com `ativo = false` para manter histórico
7. **Super admins têm acesso total**: Admins ignoram todas as restrições de permissões

## Migração de Dados

O sistema migra automaticamente os dados existentes de `entity_leaders`:
- Líderes existentes recebem o cargo de "Presidente" automaticamente
- A tabela `entity_leaders` é mantida por compatibilidade (deprecated)
- Novos líderes devem ser criados usando o sistema de membros

## Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- Membros só veem outros membros da mesma entidade
- Apenas membros com permissão "gerenciar_membros" podem adicionar/remover
- Apenas membros com permissão "gerenciar_cargos" podem criar/editar cargos
- Super admins têm acesso total a todas as operações

## Troubleshooting

### "Não é possível remover o único presidente"
- Adicione outro presidente antes de remover o atual

### "Este cargo possui membros ativos"
- Remova ou transfira os membros para outro cargo antes de excluir o cargo

### "Usuário já é membro ativo"
- O sistema impede adicionar o mesmo usuário duas vezes com cargo ativo
- Se quiser alterar o cargo, use a função "Alterar Cargo"

### Permissões não funcionando
- Verifique se o RLS está habilitado
- Confira se o cargo tem as permissões corretas configuradas
- Verifique se o membro está marcado como `ativo = true`

## Próximas Funcionalidades (Futuro)

- [ ] Sistema de processos seletivos completo
- [ ] Histórico de atividades dos membros
- [ ] Notificações de mudanças de cargo
- [ ] Exportação de lista de membros
- [ ] Estatísticas de engajamento dos membros
- [ ] Integração com eventos (participação de membros)

