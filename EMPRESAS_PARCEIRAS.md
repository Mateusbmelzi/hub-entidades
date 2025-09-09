# Funcionalidade: Empresas Parceiras

## Visão Geral

Esta funcionalidade permite que entidades cadastrem e gerenciem suas empresas parceiras, exibindo essas informações em seu perfil.

## Implementação

### 1. Banco de Dados

- **Nova coluna**: `empresas_parceiras` na tabela `entidades`
- **Tipo**: JSONB (array de objetos JSON)
- **Estrutura**: 
  ```json
  [
    {
      "id": "string",
      "nome": "string",
      "site": "string (opcional)",
      "descricao": "string (opcional)",
      "logo_url": "string (opcional)"
    }
  ]
  ```

### 2. Migração SQL

Execute a migração em `supabase/migrations/20241220_add_empresas_parceiras.sql`:

```sql
ALTER TABLE entidades 
ADD COLUMN empresas_parceiras JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN entidades.empresas_parceiras IS 'Array de objetos JSON contendo informações das empresas parceiras. Estrutura: [{"nome": "string", "site": "string", "descricao": "string", "logo_url": "string"}]';

CREATE INDEX idx_entidades_empresas_parceiras ON entidades USING GIN (empresas_parceiras);
```

### 3. Componentes Criados

#### `GerenciarEmpresasParceiras.tsx`
- Componente para gerenciar (adicionar, editar, remover) empresas parceiras
- Interface intuitiva com modal para edição
- Validação de campos obrigatórios

#### `EmpresasParceirasDisplay.tsx`
- Componente para exibir empresas parceiras em modo visualização
- Layout responsivo em grid
- Suporte a logos e links externos

### 4. Tipos TypeScript

#### `empresa-parceira.ts`
```typescript
export interface EmpresaParceira {
  id: string;
  nome: string;
  site?: string;
  descricao?: string;
  logo_url?: string;
}

export type EmpresasParceiras = EmpresaParceira[];
```

### 5. Integração

- **Formulário de edição**: `EditarEntidadeForm.tsx` foi atualizado para incluir o gerenciamento de empresas parceiras
- **Hook de atualização**: `useUpdateEntidade.ts` foi atualizado para suportar a nova coluna
- **Tipos do Supabase**: `types.ts` foi atualizado com a nova coluna

## Como Usar

### Para Entidades

1. Acesse o formulário de edição da entidade
2. Role até a seção "Empresas Parceiras"
3. Clique em "Adicionar Empresa" para cadastrar uma nova empresa
4. Preencha os campos:
   - **Nome**: Obrigatório
   - **Site**: URL da empresa (opcional)
   - **Descrição**: Breve descrição (opcional)
   - **URL do Logo**: Link para a logo da empresa (opcional)
5. Salve as alterações

### Para Visualização

As empresas parceiras são exibidas automaticamente no perfil da entidade com:
- Nome da empresa
- Descrição (se fornecida)
- Link para o site (se fornecido)
- Logo da empresa (se fornecida)

## Funcionalidades

- ✅ Adicionar empresas parceiras
- ✅ Editar empresas existentes
- ✅ Remover empresas
- ✅ Validação de campos obrigatórios
- ✅ Suporte a logos e links externos
- ✅ Interface responsiva
- ✅ Persistência no banco de dados
- ✅ Exibição visual atrativa

## Próximos Passos

Para usar esta funcionalidade em produção:

1. Execute a migração SQL no banco de dados
2. Atualize os tipos TypeScript executando `supabase gen types typescript`
3. Teste a funcionalidade no ambiente de desenvolvimento
4. Faça deploy das alterações

## Estrutura de Arquivos

```
src/
├── components/
│   ├── GerenciarEmpresasParceiras.tsx
│   ├── EmpresasParceirasDisplay.tsx
│   └── EditarEntidadeForm.tsx (atualizado)
├── types/
│   └── empresa-parceira.ts
├── hooks/
│   └── useUpdateEntidade.ts (atualizado)
└── integrations/supabase/
    └── types.ts (atualizado)

supabase/
└── migrations/
    └── 20241220_add_empresas_parceiras.sql
```
