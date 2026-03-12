## Roteiro manual — Owner de Entidade (Processo Seletivo)

### Escopo

Roteiro manual detalhado para validar o fluxo completo do owner de entidade no Processo Seletivo: configurar PS, criar/editar/deletar fases, vincular reservas, gerir inscrições, acompanhar por fase e finalizar candidatos (incluindo bordas críticas).

---

## 1. Acesso e navegação da área de Processo Seletivo

- **Pré-condições**
  - Usuário autenticado como **Entidade Owner**.
  - Entidade de teste já existente e associada ao usuário.

- **Passos**
  1. Acessar a página de detalhes da entidade (`EntidadeDetalhes`).
  2. Verificar se as tabs de Processo Seletivo estão visíveis:
     - `Configuração`,
     - `Fases`,
     - `Inscrições`,
     - `Acompanhamento`.
  3. Confirmar que essas tabs aparecem mesmo com `processo_seletivo_ativo = false` no banco.

- **Resultados esperados**
  - Área de PS acessível para configuração mesmo com PS inativo.
  - Todas as tabs carregam sem erro de JS nem telas em branco.

---

## 2. Configuração do Processo Seletivo

- **Pré-condições**
  - Tabela `entidades` com colunas de PS (`processo_seletivo_ativo`, `abertura_processo_seletivo`, `fechamento_processo_seletivo`, `numero_total_fases`, `areas_processo_seletivo` etc.) migradas e com RLS correta.

- **Passos**
  1. Na tab `Configuração`, localizar:
     - controle de **ativar/desativar** o PS;
     - campos de **abertura** e **fechamento** (data/datetime);
     - campo de **número total de fases**;
     - configuração de **áreas do processo seletivo** (multi-select ou lista).
  2. Definir cenário base e salvar:
     - `processo_seletivo_ativo = false`;
     - `abertura_processo_seletivo = hoje - 1 dia`;
     - `fechamento_processo_seletivo = hoje + 7 dias`;
     - `numero_total_fases = 3`;
     - `areas_processo_seletivo` com pelo menos 2 itens (ex: Marketing, Operações).
  3. Tentar salvar com `abertura_processo_seletivo > fechamento_processo_seletivo` para validar a UX de erro.
  4. Ajustar para intervalo válido, marcar `processo_seletivo_ativo = true` e salvar novamente.

- **Resultados esperados**
  - Validação impede salvar quando abertura > fechamento, com mensagem clara.
  - Após reload, valores persistem corretamente.
  - Ativar/desativar PS não esconde tabs nem destrói configuração.
  - `numero_total_fases` é persistido e usado depois para saber qual é a última fase.

---

## 3. Fases (criação, edição, deleção)

- **Pré-condições**
  - PS ativo e configurado.
  - Tabela `processos_seletivos_fases` migrada (campos `ordem`, `ativa`, `data_inicio`, `data_fim`, `presencial`, `template_formulario_id` etc.).

- **Passos — criação**
  1. Ir à tab `Fases`.
  2. Criar 3 fases:
     - Fase 1:
       - `ordem = 1`;
       - `ativa = true`;
       - `data_inicio = hoje`;
       - `data_fim = hoje + 2 dias`;
       - `presencial = false`;
       - associar um `template_formulario_id` (se houver templates).
     - Fase 2:
       - `ordem = 2`;
       - `ativa = true`;
       - `data_inicio = hoje + 2 dias`;
       - `data_fim = hoje + 4 dias`;
       - `presencial = true` (para testar reservas);
       - sem template, mas com formulário próprio da fase, se disponível.
     - Fase 3:
       - `ordem = 3`;
       - `ativa = true`;
       - `data_inicio = hoje + 4 dias`;
       - `data_fim = hoje + 6 dias`;
       - `presencial = false`;
       - sem template nem formulário próprio.
  3. Tentar criar fase com `ordem` duplicada (ex: nova fase com ordem 2).
  4. Tentar criar fase com datas fora do período global do PS.

- **Passos — edição**
  5. Editar Fase 2:
     - alterar `ordem` (ex: 2 → 3) e verificar como a UI lida com conflito;
     - ajustar datas para não invadir a Fase 1 e observar validações.
  6. Desativar uma fase (`ativa = false`) e salvar.

- **Passos — deleção**
  7. Deletar uma fase sem inscrições nem reservas vinculadas (deve ser permitido).
  8. Depois que houver inscrições (seção 6), tentar deletar a Fase 1 ou uma fase com reservas/candidatos.

- **Resultados esperados**
  - `ordem` sem colisão: UI bloqueia ou corrige conflitos com feedback.
  - Datas respeitam período do PS e sequência entre fases.
  - Deleção bloqueada para fases com vínculos (inscrições/reservas), com mensagem clara.
  - Fases desativadas não entram como fase atual em novas inscrições, salvo regra explícita.

---

## 4. Formulários por fase (híbrido: template vs próprio)

- **Objetivo**
  - Validar precedência:
    - se `template_formulario_id` existir → usar **template**;
    - senão, se houver `formularios_fases_ps` ativo → usar **formulário próprio**;
    - senão → fase sem formulário.

- **Passos**
  1. Criar templates em `templates_formularios` (via UI existente).
  2. Fase 1:
     - associar explicitamente um `template_formulario_id`.
  3. Fase 2:
     - não associar template;
     - configurar formulário próprio da fase (seção específica na UI).
  4. Fase 3:
     - manter sem template e sem formulário próprio.
  5. Com alunos inscritos (ver seção 6), navegar como aluno:
     - observar tela de formulário da Fase 1 e Fase 2.

- **Resultados esperados**
  - Fase 1 exibe campos do template.
  - Fase 2 exibe campos do formulário próprio.
  - Fase 3 não exige formulário.
  - Campos obrigatórios bloqueiam envio até serem preenchidos.
  - Após envio, `inscricoes_fases_ps.formulario_preenchido = true`.

---

## 5. Reservas por fase (fase presencial)

- **Pré-condições**
  - Tabelas `fases_reservas` e `candidatos_reservas` migradas.
  - Reservas aprovadas existentes (salas/auditório) para uso de teste.
  - Fase 2 marcada como `presencial = true`.

- **Passos**
  1. Na gestão de reservas por fase, vincular:
     - uma reserva com `status_reserva = 'aprovada'`;
     - tentar vincular uma reserva com outro status (para validar bloqueio).
  2. Verificar se há validação de conflito de horário/capacidade (se implementado).
  3. Com candidatos já na Fase 2 (ver seção 6), usar a UI de atribuição (`AtribuirCandidatosReserva` ou similar) para:
     - atribuir um ou mais candidatos à reserva vinculada.

- **Resultados esperados**
  - Somente reservas aprovadas podem ser vinculadas à fase.
  - Conflitos ou sobrecapacidade, se implementados, bloqueiam operação com mensagem adequada.
  - Atribuições aparecem:
     - na visão de acompanhamento da fase para o owner;
     - na visão do aluno (se houver), com data/horário corretos.

---

## 6. Inscrições, decisão e avanço de fase

- **Pré-condições**
  - Pelo menos dois alunos de teste (Aluno A e Aluno B) com perfil completo.
  - Unique `(entidade_id, user_id)` ativa em `inscricoes_processo_seletivo`.

- **Passos — criação de inscrições**
  1. Logar como Aluno A, abrir detalhes da entidade e se inscrever no PS:
     - botão deve estar habilitado (PS ativo, dentro do período, sem inscrição prévia).
  2. Repetir fluxo para Aluno B.
  3. Verificar no banco:
     - `inscricoes_processo_seletivo` criado para ambos;
     - `inscricoes_fases_ps` criada automaticamente para Fase 1;
     - `formulario_preenchido = false` se Fase 1 tiver formulário.

- **Passos — listagem no owner**
  4. Logar como Entidade Owner e ir à tab `Inscrições`:
     - conferir que aparecem apenas candidatos da entidade;
     - testar filtro por fase (Fase 1, Fase 2, etc.).

- **Passos — decisão e avanço**
  5. Na Fase 1:
     - aprovar Aluno A;
     - reprovar Aluno B.
  6. Verificar:
     - para Aluno A:
       - nova inscrição de fase criada para Fase 2;
       - `inscricoes_processo_seletivo.status` permanece `pendente`;
     - para Aluno B:
       - `inscricoes_processo_seletivo.status = 'reprovado'`;
       - nenhuma nova inscrição de fase criada.
  7. Na Fase 2:
     - aprovar Aluno A;
     - verificar criação de inscrição para Fase 3 e interação com reservas (se atribuídas).
  8. Na Fase 3 (última):
     - aprovar Aluno A;
     - verificar:
       - `inscricoes_processo_seletivo.status = 'aprovado'`;
       - criação de registro em `membros_entidade` para Aluno A.
  9. Testar idempotência:
     - clicar duas vezes em “aprovar” na mesma fase para o mesmo candidato;
     - garantir que não sejam criadas inscrições de fase duplicadas.

- **Resultados esperados**
  - Tab `Inscrições` mostra apenas candidatos da entidade.
  - Aprovar em fase intermediária cria exatamente uma inscrição na próxima fase.
  - Aprovar na última fase aprova o PS para o aluno e cria `membros_entidade` uma única vez.
  - Reprovar atualiza status geral para `reprovado`.
  - Nenhuma duplicidade de inscrições de fase, mesmo com cliques repetidos.

---

## 7. Acompanhamento por fase (visão owner)

- **Passos**
  1. Abrir tab `Acompanhamento` (componente `AcompanhamentoFasesPS`).
  2. Para cada fase, verificar:
     - contagem de candidatos por status (pendente, aprovado, reprovado...);
     - indicação de formulário preenchido ou pendente.
  3. Conferir dados de Aluno A em cada fase:
     - status da fase acompanha as decisões tomadas;
     - em fases presenciais com reserva atribuída, a reserva aparece.

- **Resultados esperados**
  - Dados coerentes com o que aparece em `Inscrições`.
  - Contagens e status consistentes com ações de aprovação/reprovação/avanço.

---

## 8. Casos de borda importantes para o owner

- **Alterar `numero_total_fases` com candidatos em andamento**
  - Reduzir de 3 para 2 quando já houver candidatos na Fase 3.
  - Esperado: sistema bloqueia ou ajusta sem deixar candidatos em estado inválido.

- **Desativar uma fase com candidatos nela**
  - Marcar `ativa = false` em uma fase com inscrições.
  - Esperado: UI comunica o impacto e nenhuma inscrição fica “presa”.

- **Deletar fase com reservas ou inscrições**
  - Tentar deletar fase com registros em `fases_reservas` ou `inscricoes_fases_ps`.
  - Esperado: deleção é bloqueada com mensagem clara.

- **RLS (multi-owners)**
  - Logar como owner de outra entidade e tentar acessar URL direta das telas de PS desta entidade de teste.
  - Esperado: acesso negado / sem vazamento de dados de candidatos.

---

## 9. Como registrar resultados deste roteiro

- **Formato sugerido**
  - Para cada cenário acima, registrar:
    - cenário;
    - passos executados (resumo);
    - resultado esperado;
    - resultado observado (OK/bug);
    - notas;
    - severidade (bloqueador/alto/médio/baixo).

- **Critério de conclusão do to-do**
  - Todos os cenários executados ao menos uma vez em ambiente real.
  - Diferenças entre esperado e observado registradas como bugs com severidade.
  - Fluxo principal (configurar PS → fases → reservas → inscrições → decisões → membro) funcionando ponta a ponta, ou bloqueios claramente mapeados para correção.

