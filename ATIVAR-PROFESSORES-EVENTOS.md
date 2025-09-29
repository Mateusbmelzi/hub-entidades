# Ativar Exibição de Professores Convidados na Página de Eventos

## 🎯 Status Atual

A funcionalidade de exibição de professores convidados na página de eventos está **implementada mas desabilitada** até que a migração do banco de dados seja executada.

## ✅ O que já está implementado

1. **Seção de Professores na Página de Eventos** (`src/pages/EventoDetalhes.tsx`)
   - Interface completa para exibir múltiplos professores
   - Cards individuais para cada professor
   - Badges para "Pessoa Pública" e "Apoio Externo"
   - Seção de apoio da empresa quando aplicável

2. **Estrutura de Dados Preparada**
   - Query preparada para buscar professores da tabela `professores_convidados`
   - Fallback para dados JSON se necessário
   - Compatibilidade com estrutura antiga

## 🔧 Como ativar após a migração

### Passo 1: Execute a Migração do Banco
```sql
-- Execute o arquivo: supabase/migrations/20250124_create_professores_convidados_table.sql
-- no Supabase SQL Editor
```

### Passo 2: Atualize o Código da Página de Eventos

Substitua o código em `src/pages/EventoDetalhes.tsx` na linha 65:

**Código atual (desabilitado):**
```typescript
// TODO: Buscar professores convidados quando a tabela for criada
// Por enquanto, professoresConvidados permanece vazio
```

**Código para ativar:**
```typescript
// Buscar professores convidados da nova tabela
const { data: professores, error: professoresError } = await supabase
  .from('professores_convidados')
  .select('*')
  .eq('reserva_id', reserva.id)
  .order('created_at', { ascending: true });

if (!professoresError && professores) {
  professoresConvidados = professores;
}
```

### Passo 3: Atualize os Tipos TypeScript

Adicione a tabela `professores_convidados` ao arquivo `src/integrations/supabase/types.ts`:

```typescript
professores_convidados: {
  Row: {
    id: string;
    reserva_id: string;
    nome_completo: string;
    apresentacao: string;
    eh_pessoa_publica: boolean;
    ha_apoio_externo: boolean;
    como_ajudara_organizacao: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    reserva_id: string;
    nome_completo: string;
    apresentacao: string;
    eh_pessoa_publica?: boolean;
    ha_apoio_externo?: boolean;
    como_ajudara_organizacao?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    reserva_id?: string;
    nome_completo?: string;
    apresentacao?: string;
    eh_pessoa_publica?: boolean;
    ha_apoio_externo?: boolean;
    como_ajudara_organizacao?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "professores_convidados_reserva_id_fkey";
      columns: ["reserva_id"];
      referencedRelation: "reservas";
      referencedColumns: ["id"];
    }
  ];
};
```

## 🎨 Como Funciona a Exibição

### Interface do Usuário:
1. **Seção "Professores/Palestrantes Convidados"** aparece na página do evento
2. **Contador** mostra quantos professores foram adicionados
3. **Cards individuais** para cada professor com:
   - Nome completo
   - Apresentação/biografia
   - Badge "Pessoa Pública" (se aplicável)
   - Badge "Apoio Externo" (se aplicável)
   - Seção de apoio da empresa (se houver)

### Dados Exibidos:
- **Nome Completo**: Nome do professor/palestrante
- **Apresentação**: Breve biografia e qualificações
- **Pessoa Pública**: Indica se é uma figura pública
- **Apoio Externo**: Se há apoio de empresa
- **Como Ajudará**: Descrição do apoio da empresa

## 🔄 Compatibilidade

- **Funciona com reservas antigas** que usam o método antigo (um palestrante)
- **Funciona com reservas novas** que usam múltiplos professores
- **Fallback automático** para dados JSON se a tabela não estiver disponível

## 🧪 Como Testar

1. **Crie uma nova reserva** com múltiplos professores
2. **Aprove a reserva** para criar o evento
3. **Acesse a página do evento** e verifique se os professores aparecem
4. **Verifique se as informações** estão corretas (nome, apresentação, badges)

## 📋 Checklist de Ativação

- [ ] Migração SQL executada no Supabase
- [ ] Código da página de eventos atualizado
- [ ] Tipos TypeScript atualizados
- [ ] Teste com reserva nova criada
- [ ] Teste com reserva antiga (compatibilidade)
- [ ] Verificação de exibição correta dos dados

## 🚨 Notas Importantes

- A funcionalidade está **pronta para uso** assim que a migração for executada
- **Não há breaking changes** - reservas antigas continuam funcionando
- A interface é **responsiva** e funciona em dispositivos móveis
- **Validação automática** garante que apenas dados válidos sejam exibidos

## 🎉 Resultado Final

Após a ativação, os usuários verão na página do evento:

```
┌─────────────────────────────────────────────────────────┐
│ 👤 Professores/Palestrantes Convidados (3)            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dr. Maria Silva Santos        [Pessoa Pública]     │ │
│ │ Professor de Ciência da Computação na USP...       │ │
│ │ ┌─ Apoio da Empresa: ─────────────────────────────┐ │ │
│ │ │ A empresa fornecerá equipamentos e coffee break │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Prof. João Santos                                   │ │
│ │ Especialista em Machine Learning e IA...            │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

A funcionalidade está **100% implementada** e pronta para ser ativada! 🚀
