# Sistema de Reservas de Salas e Auditórios

Este documento descreve a implementação da tabela de reservas no Supabase para o sistema de reservas de salas e auditórios.

## Estrutura da Tabela

A tabela `reservas` foi criada para suportar tanto reservas de salas quanto de auditórios, com campos específicos para cada tipo de reserva.

### Relacionamentos

- **profiles**: Relacionamento com a tabela de perfis de usuários
- **entidades**: Relacionamento com a tabela de entidades (opcional)
- **eventos**: Relacionamento com a tabela de eventos (opcional)

### Campos Principais

#### Identificação
- `id`: UUID único da reserva
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### Relacionamentos
- `profile_id`: ID do usuário que fez a reserva
- `entidade_id`: ID da entidade (opcional)
- `evento_id`: ID do evento relacionado (opcional)

#### Dados Básicos
- `tipo_reserva`: 'sala' ou 'auditorio'
- `data_reserva`: Data da reserva
- `horario_inicio`: Horário de início
- `horario_termino`: Horário de término
- `quantidade_pessoas`: Número de pessoas esperadas

#### Dados do Solicitante
- `nome_solicitante`: Nome completo do solicitante
- `telefone_solicitante`: Telefone com DDD

#### Dados do Evento
- `tipo_evento`: Tipo do evento
- `titulo_evento`: Título do evento
- `descricao_evento`: Descrição detalhada

#### Campos para Palestrante Externo
- `tem_palestrante_externo`: Boolean
- `nome_palestrante_externo`: Nome do palestrante
- `apresentacao_palestrante_externo`: Apresentação do palestrante
- `eh_pessoa_publica`: Se é pessoa pública

#### Campos Específicos para Sala
- `necessidade_sala_plana`: Boolean
- `motivo_sala_plana`: Motivo da necessidade

#### Campos Específicos para Auditório
- **Equipamentos**: `precisa_sistema_som`, `precisa_projetor`, `precisa_iluminacao_especial`, `precisa_montagem_palco`, `precisa_gravacao`
- **Configuração**: `configuracao_sala`, `motivo_configuracao_sala`
- **Alimentação**: `precisa_alimentacao`, `detalhes_alimentacao`, `custo_estimado_alimentacao`
- **Segurança**: `precisa_seguranca`, `detalhes_seguranca`, `precisa_controle_acesso`
- **Manutenção**: `precisa_limpeza_especial`, `precisa_manutencao`

#### Status da Reserva
- `status`: 'pendente', 'aprovada', 'rejeitada', 'cancelada'
- `comentario_aprovacao`: Comentário do administrador
- `data_aprovacao`: Data da aprovação/rejeição
- `aprovador_email`: Email do administrador

## Instalação

### 1. Criar a Tabela
Execute o arquivo `create_reservas_table.sql` no Supabase:

```sql
-- Execute o conteúdo do arquivo create_reservas_table.sql
```

### 2. Configurar Políticas de Segurança
Execute o arquivo `reservas_rls_policies.sql`:

```sql
-- Execute o conteúdo do arquivo reservas_rls_policies.sql
```

## Funcionalidades

### Verificação de Conflitos
O sistema automaticamente verifica conflitos de horário entre reservas aprovadas do mesmo tipo (sala ou auditório).

### Políticas de Segurança (RLS)
- Usuários podem ver, criar e atualizar apenas suas próprias reservas
- Administradores podem ver e gerenciar todas as reservas
- Entidades podem ver reservas relacionadas aos seus eventos

### Funções Auxiliares

#### `aprovar_reserva(reserva_id, aprovador_email, comentario)`
Aprova uma reserva pendente, verificando conflitos automaticamente.

#### `rejeitar_reserva(reserva_id, aprovador_email, comentario)`
Rejeita uma reserva pendente.

#### `cancelar_reserva(reserva_id, motivo)`
Cancela uma reserva pendente ou aprovada.

#### `verificar_conflito_reserva(data, inicio, termino, tipo, reserva_id)`
Verifica se há conflito de horário com outras reservas.

## Exemplos de Uso

### Inserir Reserva de Sala
```sql
INSERT INTO reservas (
    profile_id, tipo_reserva, data_reserva, horario_inicio, horario_termino,
    quantidade_pessoas, nome_solicitante, telefone_solicitante,
    tipo_evento, titulo_evento, descricao_evento
) VALUES (
    'uuid-do-profile', 'sala', '2024-02-15', '14:00:00', '16:00:00',
    30, 'João Silva', '(11) 99999-9999',
    'palestra_insper', 'Workshop de Python', 'Workshop introdutório'
);
```

### Inserir Reserva de Auditório
```sql
INSERT INTO reservas (
    profile_id, tipo_reserva, data_reserva, horario_inicio, horario_termino,
    quantidade_pessoas, nome_solicitante, telefone_solicitante,
    tipo_evento, titulo_evento, descricao_evento,
    precisa_sistema_som, precisa_projetor, precisa_alimentacao
) VALUES (
    'uuid-do-profile', 'auditorio', '2024-02-20', '19:00:00', '21:30:00',
    150, 'Ana Costa', '(11) 88888-8888',
    'palestra_externa', 'Palestra sobre IA', 'Palestra sobre IA',
    true, true, true
);
```

### Aprovar Reserva
```sql
SELECT aprovar_reserva(
    'uuid-da-reserva',
    'admin@insper.edu.br',
    'Reserva aprovada'
);
```

## Views Disponíveis

### `reservas_detalhadas`
View que inclui informações relacionadas das tabelas `profiles`, `entidades` e `eventos`.

```sql
SELECT * FROM reservas_detalhadas 
WHERE status = 'pendente'
ORDER BY created_at ASC;
```

## Integração com Frontend

### Hooks Necessários
Crie hooks para:
- `useReservas()`: Listar reservas do usuário
- `useCreateReserva()`: Criar nova reserva
- `useUpdateReserva()`: Atualizar reserva
- `useCancelReserva()`: Cancelar reserva
- `useAprovarReserva()`: Aprovar reserva (admin)
- `useRejeitarReserva()`: Rejeitar reserva (admin)

### Tipos TypeScript
Atualize o arquivo `types.ts` com os tipos da tabela reservas:

```typescript
export interface Reserva {
  id: string;
  profile_id: string;
  entidade_id?: number;
  evento_id?: string;
  tipo_reserva: 'sala' | 'auditorio';
  data_reserva: string;
  horario_inicio: string;
  horario_termino: string;
  quantidade_pessoas: number;
  nome_solicitante: string;
  telefone_solicitante: string;
  tipo_evento: string;
  titulo_evento: string;
  descricao_evento: string;
  // ... outros campos
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';
  created_at: string;
  updated_at: string;
}
```

## Monitoramento e Relatórios

### Queries Úteis
- Reservas pendentes de aprovação
- Conflitos de horário
- Estatísticas por tipo de reserva
- Relatório de ocupação
- Reservas com palestrante externo
- Reservas que precisam de alimentação/segurança

Veja o arquivo `reservas_examples.sql` para exemplos completos de queries.

## Manutenção

### Limpeza de Dados
Considere implementar um job para:
- Arquivar reservas antigas (mais de 1 ano)
- Limpar reservas canceladas antigas
- Atualizar estatísticas de uso

### Backup
Configure backup automático da tabela `reservas` devido à importância dos dados de reserva.

## Troubleshooting

### Problemas Comuns

1. **Erro de conflito de horário**: Verifique se não há reservas aprovadas no mesmo período
2. **Erro de permissão**: Verifique se o usuário tem permissão para acessar a reserva
3. **Erro de validação**: Verifique se todos os campos obrigatórios estão preenchidos

### Logs
Monitore os logs do Supabase para identificar problemas de performance ou erros de validação.