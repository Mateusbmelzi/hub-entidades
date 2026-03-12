# Auditoria — Schema / Constraints / RLS do Processo Seletivo (PS)

Este documento consolida **o que auditar no Supabase** para garantir que o fluxo de Processo Seletivo funcione ponta-a-ponta com **cancelamento** e **reservas** sem “pontos mortos”.

## Como executar a auditoria

- Abra o **Supabase Dashboard → SQL Editor** do projeto.
- Rode o script **read-only** em `docs/auditoria-ps-schema-rls.sql`.
- Salve o output (print ou export do resultado) para rastreabilidade.

## Escopo (tabelas esperadas)

O script assume os nomes abaixo (ajuste a lista dentro do SQL se o seu schema usar nomes diferentes):

- `entidades` (configuração do PS e janelas)
- `processos_seletivos_fases` (definição das fases)
- `inscricoes_processo_seletivo` (inscrição “geral” por aluno/entidade)
- `inscricoes_fases_ps` (inscrição por fase vinculada à inscrição geral)
- `formularios_fases_ps` (opcional; formulário próprio por fase)
- `templates_formularios` (templates reutilizáveis)
- `fases_reservas` (vínculo de reservas a fases presenciais)
- `candidatos_reservas` (alocação do candidato em uma reserva)
- `reservas` (reserva de espaço)
- `membros_entidade` (conversão ao final)
- `profiles` (papéis/roles para admins)

## O que validar nos resultados

### 1) Colunas críticas de PS e coerência de tipos

- `entidades` deve ter campos compatíveis com:
  - `processo_seletivo_ativo` (boolean)
  - `abertura_processo_seletivo` / `fechamento_processo_seletivo` (timestamp/date)
  - `numero_total_fases` (int)
  - `areas_processo_seletivo` (array/jsonb conforme implementação)

- `processos_seletivos_fases` deve permitir:
  - `ordem` (int), `ativa` (boolean), janelas de datas
  - `template_formulario_id` (quando usar template)
  - flag de `presencial` (se existir) para permitir vínculo com reservas

- `inscricoes_processo_seletivo` deve ter:
  - `user_id` (uuid), `entidade_id` (int), `status`
  - timestamps (`created_at`, etc.)

- `inscricoes_fases_ps` deve ter:
  - `inscricao_id` (FK para inscrição geral), `fase_id` (FK fase)
  - `status`, `feedback`
  - `formulario_preenchido` e `respostas_formulario` (jsonb), se a fase tiver formulário

### 2) Constraints e idempotência (sem duplicidades)

Verifique se existem (ou equivalente):

- **Uma inscrição por aluno por entidade**, com regra de negócio para re-inscrição:
  - índice unique (possivelmente **parcial**) em `(user_id, entidade_id)`
- **Uma inscrição por fase**:
  - unique `(inscricao_id, fase_id)`

Além disso, valide CHECK constraints para status:

- `inscricoes_processo_seletivo.status` limitado a um conjunto coerente (ex.: `pendente/aprovado/reprovado`)
- `inscricoes_fases_ps.status` limitado (ex.: `pendente/em_avaliacao/aprovado/reprovado`)

### 3) Dependências para cancelamento (o ponto mais importante)

O plano define que **cancelamento do aluno** (quando `status = 'pendente'`) deve:

- remover `inscricoes_processo_seletivo`
- remover dependências:
  - `inscricoes_fases_ps`
  - `candidatos_reservas` (e quaisquer vínculos derivados de reserva/PS)

Na auditoria, confira no bloco **FKs envolvendo PS/Reservas**:

- se as FKs que apontam para `inscricoes_processo_seletivo` e `inscricoes_fases_ps` estão com **ON DELETE CASCADE**
  - se **não estiverem**, o cancelamento precisa ser implementado com deleções explícitas (em ordem correta) ou via RPC transacional.

Checklist prático:

- `inscricoes_fases_ps.inscricao_id -> inscricoes_processo_seletivo.id` com **CASCADE** (recomendado)
- `candidatos_reservas` deve depender de algo que permita limpeza ao cancelar:
  - idealmente via FK para `inscricoes_fases_ps` ou `inscricoes_processo_seletivo` com **CASCADE**
  - ou, no mínimo, FK com DELETE permissivo + deleção manual segura

### 4) Reservas por fase e visibilidade mínima para o aluno

Se o aluno precisa ver “qual reserva” foi atribuída:

- o aluno precisa conseguir **ler** o vínculo em `candidatos_reservas` e, dependendo do desenho, **ler campos específicos** de `reservas`
  - alternativa: expor isso via **view**/RPC (SECURITY DEFINER) com retorno filtrado (sem abrir a tabela inteira).

Valide também:

- owner da entidade consegue inserir/atualizar `fases_reservas` e `candidatos_reservas`
- aluno **não** consegue atribuir reserva (somente ler sua própria atribuição)

### 5) RLS: matriz mínima de permissões por tabela

No output de **RLS habilitado** + **políticas**, confirme que não existe “buraco” (e que não está tudo aberto).

Matriz mínima (esperada):

- `processos_seletivos_fases`
  - **SELECT**: público/autenticado (para aluno ver fases ativas da entidade)
  - **INSERT/UPDATE/DELETE**: apenas owners da entidade (ou admin)

- `inscricoes_processo_seletivo`
  - **INSERT**: autenticado com `user_id = auth.uid()`
  - **SELECT**: aluno (próprias inscrições) e owners da entidade (candidatos da entidade)
  - **UPDATE**: owner/admin para aprovar/reprovar; aluno não deve conseguir aprovar
  - **DELETE**: aluno apenas quando `status = 'pendente'` (regra de cancelamento)

- `inscricoes_fases_ps`
  - **SELECT**: aluno (próprias) e owner (da entidade)
  - **UPDATE**:
    - aluno: preencher formulário (apenas seus registros; idealmente só campos de resposta)
    - owner/admin: atualizar status/feedback
  - **INSERT**: preferir owner/RPC (para avançar fase de forma idempotente)

- `fases_reservas` e `candidatos_reservas`
  - **SELECT**:
    - owner: todos da entidade
    - aluno: apenas a própria atribuição (se necessário)
  - **INSERT/UPDATE/DELETE**: owner/admin

## O que já está versionado neste repo (constraints PS)

Existe uma migração de integridade em `supabase/migrations/20260226180004_integrity_constraints.sql` que adiciona:

- índice unique (parcial) `uq_inscricoes_ps_user_entidade` em `inscricoes_processo_seletivo(user_id, entidade_id)` com predicado `status != 'reprovado'`
- unique `uq_inscricoes_fases_ps_inscricao_fase` em `inscricoes_fases_ps(inscricao_id, fase_id)`
- CHECKs de status para:
  - `inscricoes_processo_seletivo.status`
  - `inscricoes_fases_ps.status`

Importante: essa migração **não cria** as tabelas de PS; ela apenas hardena constraints.

## Saída esperada desta auditoria

Ao final, você deve conseguir responder objetivamente:

- Quais são as colunas reais de PS (e se batem com o app).
- Quais constraints garantem idempotência e integridade.
- Se o cancelamento vai “limpar” tudo por **cascade** (ou se exige deleção manual/RPC).
- Quais tabelas têm RLS habilitado e quais políticas existem por comando (SELECT/INSERT/UPDATE/DELETE).

