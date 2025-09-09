# Empresas Parceiras - Documentação

## Visão Geral

A funcionalidade de Empresas Parceiras permite que entidades cadastrem e gerenciem empresas parceiras, criando relacionamentos estruturados entre entidades e empresas com base em áreas de atuação.

## Estrutura do Banco de Dados

### Tabela `empresas_parceiras`

A nova tabela substitui a coluna JSONB `empresas_parceiras` da tabela `entidades`, oferecendo melhor estrutura e relacionamentos:

```sql
CREATE TABLE empresas_parceiras (
    id BIGSERIAL PRIMARY KEY,
    entidade_id BIGINT NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    site_url TEXT,
    logo_url TEXT,
    email_contato TEXT,
    telefone_contato TEXT,
    area_atuacao TEXT[], -- Array de áreas de atuação da empresa
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relacionamentos

- **entidade_id**: Foreign key para a tabela `entidades`
- **area_atuacao**: Array de strings que pode ser relacionado com as áreas de atuação das entidades

## Migrações

### 1. Criação da Tabela
- **Arquivo**: `20241220_create_empresas_parceiras_table.sql`
- **Função**: Cria a nova tabela e migra dados existentes da coluna JSONB

### 2. Remoção da Coluna JSONB
- **Arquivo**: `20241220_remove_empresas_parceiras_jsonb_column.sql`
- **Função**: Remove a coluna JSONB após confirmação da migração

## Componentes e Hooks

### Hook `useEmpresasParceiras`

```typescript
const {
  empresas,
  loading,
  error,
  fetchEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresasByArea
} = useEmpresasParceiras(entidadeId);
```

**Métodos disponíveis:**
- `createEmpresa(data)`: Cria nova empresa parceira
- `updateEmpresa(id, data)`: Atualiza empresa existente
- `deleteEmpresa(id)`: Remove empresa (soft delete)
- `getEmpresasByArea(area)`: Busca empresas por área de atuação

### Componente `GerenciarEmpresasParceiras`

Interface completa para gerenciar empresas parceiras:

```tsx
<GerenciarEmpresasParceiras 
  entidadeId={entidadeId} 
  entidadeNome={entidadeNome} 
/>
```

**Funcionalidades:**
- Listar empresas parceiras
- Criar nova empresa
- Editar empresa existente
- Excluir empresa
- Gerenciar áreas de atuação
- Visualizar informações de contato

## Tipos TypeScript

### `EmpresaParceira`
```typescript
interface EmpresaParceira {
  id: number;
  entidade_id: number;
  nome: string;
  descricao?: string;
  site_url?: string;
  logo_url?: string;
  email_contato?: string;
  telefone_contato?: string;
  area_atuacao: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### `CreateEmpresaParceiraData`
```typescript
interface CreateEmpresaParceiraData {
  entidade_id: number;
  nome: string;
  descricao?: string;
  site_url?: string;
  logo_url?: string;
  email_contato?: string;
  telefone_contato?: string;
  area_atuacao?: string[];
  ativo?: boolean;
}
```

## Como Usar

### 1. Executar Migrações

```bash
# Aplicar migração de criação da tabela
supabase db push

# Verificar se os dados foram migrados corretamente
# Depois aplicar migração de remoção da coluna JSONB
supabase db push
```

### 2. Integrar no Frontend

```tsx
import { GerenciarEmpresasParceiras } from './components/GerenciarEmpresasParceiras';

function EntidadeDetalhes({ entidade }) {
  return (
    <div>
      {/* Outros componentes */}
      <GerenciarEmpresasParceiras 
        entidadeId={entidade.id} 
        entidadeNome={entidade.nome} 
      />
    </div>
  );
}
```

### 3. Buscar Empresas por Área

```tsx
import { useEmpresasParceiras } from './hooks/useEmpresasParceiras';

function EmpresasPorArea({ area }) {
  const { getEmpresasByArea, loading } = useEmpresasParceiras();
  
  useEffect(() => {
    const fetchEmpresas = async () => {
      const empresas = await getEmpresasByArea(area);
      // Processar empresas
    };
    fetchEmpresas();
  }, [area]);
}
```

## Benefícios da Nova Estrutura

1. **Relacionamentos Estruturados**: Foreign keys garantem integridade referencial
2. **Consultas Eficientes**: Índices otimizados para busca por área de atuação
3. **Flexibilidade**: Array de áreas de atuação permite múltiplas categorizações
4. **Auditoria**: Timestamps automáticos para created_at e updated_at
5. **Soft Delete**: Campo `ativo` permite desativação sem perda de dados
6. **Type Safety**: Tipos TypeScript completos para desenvolvimento seguro

## Índices de Performance

- `idx_empresas_parceiras_entidade_id`: Busca por entidade
- `idx_empresas_parceiras_ativo`: Filtro por status ativo
- `idx_empresas_parceiras_area_atuacao`: Busca por área de atuação (GIN)

## Triggers Automáticos

- **update_updated_at_column**: Atualiza automaticamente o campo `updated_at` em modificações
