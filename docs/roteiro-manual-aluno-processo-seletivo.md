## Roteiro manual — Aluno (Processo Seletivo)

### Escopo

Roteiro manual detalhado para validar o fluxo completo do aluno no Processo Seletivo: elegibilidade, inscrição inicial, acompanhamento no perfil, preenchimento de formulários de fase e cancelamento de inscrição (apenas enquanto o status geral estiver `pendente`).

---

## 1. Elegibilidade de inscrição

- **Pré-condições**
  - Tabela `entidades` configurada com Processo Seletivo ativo para a entidade de teste:
    - `processo_seletivo_ativo = true`;
    - `abertura_processo_seletivo` e `fechamento_processo_seletivo` definidos;
    - `numero_total_fases` configurado (ex.: 3);
    - `areas_processo_seletivo` com pelo menos 1 item (ou vazio, para testar fallback).
  - Usuário autenticado como **Aluno de teste** com perfil completo.
  - Não existir inscrição prévia desse aluno na entidade de teste em `inscricoes_processo_seletivo`.

- **Cenário 1 — PS inativo**
  1. No banco, definir `processo_seletivo_ativo = false` para a entidade.
  2. Logar como aluno, acessar a página de detalhes da entidade (mesma entidade de teste).
  3. Localizar a área de Processo Seletivo / botão de inscrição.

  - **Resultados esperados**
    - Botão de inscrição desabilitado ou ausência de CTA para inscrever-se.
    - Mensagem clara indicando que o processo seletivo não está aberto/ativo.
    - Nenhuma tentativa de criar `inscricoes_processo_seletivo`.

- **Cenário 2 — Fora do período (antes da abertura)**
  1. Ajustar no banco:
     - `processo_seletivo_ativo = true`;
     - `abertura_processo_seletivo = hoje + 1 dia`;
     - `fechamento_processo_seletivo = hoje + 10 dias`.
  2. Com o aluno logado, acessar a página da entidade.

  - **Resultados esperados**
    - UI indica que o PS ainda não começou.
    - Botão de inscrição desabilitado ou CTA com mensagem explicando o período.
    - Nenhuma inscrição criada ao tentar interagir com a UI.

- **Cenário 3 — Fora do período (após o fechamento)**
  1. Ajustar no banco:
     - `processo_seletivo_ativo = true`;
     - `abertura_processo_seletivo = hoje - 10 dias`;
     - `fechamento_processo_seletivo = hoje - 1 dia`.
  2. Acessar a página da entidade como aluno.

  - **Resultados esperados**
    - CTA de inscrição desabilitado.
    - Mensagem indicando que o período de inscrição foi encerrado.
    - Nenhuma inscrição nova criada.

- **Cenário 4 — PS ativo e dentro do período**
  1. Ajustar no banco:
     - `processo_seletivo_ativo = true`;
     - `abertura_processo_seletivo = hoje - 1 dia`;
     - `fechamento_processo_seletivo = hoje + 7 dias`.
  2. Com o aluno logado, acessar a página da entidade.

  - **Resultados esperados**
    - Botão/CTA de inscrição visível e habilitado.
    - Mensagem convidando o aluno a se inscrever.

---

## 2. Inscrição inicial no Processo Seletivo

- **Pré-condições**
  - Elegibilidade confirmada pelo cenário 4 acima.
  - Aluno sem inscrição prévia para essa entidade (unique `(entidade_id, user_id)` respeitado).

- **Passos**
  1. Na página da entidade, clicar no botão de inscrição do Processo Seletivo.
  2. Verificar o formulário/modal inicial de inscrição:
     - campos de prefill com dados do perfil:
       - nome,
       - e-mail,
       - curso,
       - semestre/período;
     - campo de **área de interesse**:
       - se `areas_processo_seletivo` tiver itens, deve aparecer como lista/seleção;
       - se estiver vazio, deve permitir entrada de texto livre.
  3. Preencher os campos obrigatórios e enviar a inscrição.
  4. Tentar enviar com campos obrigatórios vazios para validar mensagens de erro.

- **Resultados esperados**
  - Ao enviar com dados válidos:
    - registro criado em `inscricoes_processo_seletivo` com:
      - `status = 'pendente'`;
      - `entidade_id` e `user_id` corretos;
      - área de interesse persistida conforme selecionada/digitada;
    - registro criado automaticamente em `inscricoes_fases_ps` para a **fase 1** do PS:
      - `fase_id` da Fase 1;
      - `status` inicial conforme regra implementada (ex.: `pendente`);
      - `formulario_preenchido = false` se a Fase 1 exigir formulário (template ou próprio).
  - Ao tentar reenviar a inscrição para a mesma entidade:
    - bloqueio na UI (sem criar segunda inscrição);
    - se a UI deixar tentar, o unique `(entidade_id, user_id)` deve impedir duplicação no banco, com tratamento de erro amigável.

---

## 3. Acompanhamento no perfil do aluno

- **Pré-condições**
  - Inscrição criada com sucesso para o aluno na entidade de teste.
  - Pelo menos 1 fase configurada (Fase 1), idealmente 2 ou 3 fases para ver progressão depois.

- **Passos**
  1. Logar como o aluno de teste.
  2. Acessar a página de perfil (`Perfil`), na seção de Processos Seletivos / Minhas inscrições (conforme nome usado na UI).
  3. Localizar a inscrição criada para a entidade de teste.
  4. Verificar as informações exibidas:
     - nome da entidade;
     - status geral da inscrição (`pendente`, `aprovado`, `reprovado`);
     - fase atual (ex.: "Fase 1", "Entrevista", etc.);
     - status da fase atual (ex.: pendente, aguardando formulário, concluída).

- **Resultados esperados**
  - Inscrição aparece listada com:
    - status geral `pendente` logo após a inscrição inicial;
    - fase atual apontando para Fase 1.
  - Se a fase atual tiver formulário pendente, deve existir:
    - CTA claro para preencher o formulário da fase;
    - indicação visual de que o formulário ainda não foi preenchido.
  - Se houver seção de estatísticas no perfil, garantir que:
    - dados de `inscricoes_processo_seletivo` não entrem em conflito visual com `demonstracoes_interesse`.

---

## 4. Preenchimento de formulários de fase

- **Pré-condições**
  - Fase 1 ou outra fase configurada com:
    - `template_formulario_id` associado **ou**
    - formulário próprio em `formularios_fases_ps`.
  - Inscrição de fase correspondente existente em `inscricoes_fases_ps` com `formulario_preenchido = false`.

- **Passos — acesso ao formulário**
  1. Logar como o aluno que está na fase com formulário pendente.
  2. No perfil, acessar a inscrição da entidade de teste.
  3. Clicar no CTA para preencher o formulário da fase (ex.: "Preencher formulário da Fase 1").
  4. Verificar:
     - quais campos são renderizados (confirmar se vieram do template ou do formulário próprio);
     - indicação de quais campos são obrigatórios.

- **Passos — envio do formulário**
  5. Tentar enviar o formulário com campos obrigatórios vazios:
     - observar mensagens de validação campo a campo.
  6. Preencher todos os campos obrigatórios com valores válidos.
  7. Enviar o formulário.

- **Resultados esperados**
  - UI:
    - bloqueia envio quando campos obrigatórios não estão preenchidos, com feedback claro;
    - após envio bem-sucedido, atualiza o estado visual da inscrição/fase para indicar que o formulário foi preenchido.
  - Banco:
    - `inscricoes_fases_ps.formulario_preenchido` muda para `true` para a fase correspondente;
    - `inscricoes_fases_ps.respostas_formulario` guarda as respostas (estrutura conforme implementação);
    - nenhum registro duplicado de inscrição de fase é criado apenas pelo preenchimento do formulário.

---

## 5. Reação da UI a decisões da entidade (acompanhamento dinâmico)

- **Pré-condições**
  - Aluno com inscrição `pendente` em Fase 1 ou em outra fase.
  - Entidade owner capaz de aprovar/reprovar e avançar o aluno entre fases.

- **Passos — aprovação e avanço de fase**
  1. Logar como Entidade Owner em outra sessão.
  2. Na tela de gestão de inscrições da entidade, aprovar o aluno na Fase atual:
     - se não for a última fase, o sistema deve criar inscrição para a próxima fase;
     - se for a última fase, o sistema deve aprovar o PS e criar membro da entidade.
  3. Voltar para a visão do aluno (recarregar o perfil).

- **Resultados esperados**
  - Após aprovação em fase intermediária:
    - no perfil do aluno, a fase atual atualiza para a próxima fase;
    - status da fase anterior reflete que foi concluída/aprovada;
    - se a próxima fase tiver formulário, CTA de preenchimento aparece.
  - Após aprovação na última fase:
    - status geral da inscrição passa a `aprovado`;
    - a inscrição não deve mais ser cancelável pelo aluno;
    - se houver alguma seção de "minhas entidades", o novo vínculo pode aparecer conforme implementação.

- **Passos — reprovação**
  4. Em novo cenário (ou com outro aluno de teste), o owner reprova o candidato em uma fase.
  5. Recarregar o perfil do aluno.

- **Resultados esperados**
  - Status geral da inscrição muda para `reprovado`.
  - A inscrição deixa de ser cancelável (não faz sentido cancelar algo já reprovado).
  - CTA de formulário ou de acompanhamento deve refletir que o processo foi encerrado.

---

## 6. Cancelamento da inscrição pelo aluno (apenas status pendente)

- **Pré-condições**
  - Inscrição do aluno em `inscricoes_processo_seletivo` com:
    - `status = 'pendente'`;
    - inscrições de fase associadas em `inscricoes_fases_ps` (pelo menos Fase 1);
    - possivelmente vínculos em `candidatos_reservas` (para testar cascata).

- **Passos — visibilidade do botão**
  1. Logar como o aluno.
  2. Acessar o perfil e localizar a inscrição da entidade de teste.
  3. Verificar se existe botão/ação de cancelar inscrição.

  - **Resultados esperados**
    - Botão de cancelar aparece **somente** quando `status === 'pendente'`.
    - Em inscrições com status `aprovado` ou `reprovado`, o botão não deve ser exibido.

- **Passos — execução do cancelamento**
  4. Com a inscrição em estado `pendente`, clicar no botão de cancelar.
  5. Confirmar o cancelamento em eventual diálogo/modal.
  6. Observar o comportamento da UI após a ação.

  - **Resultados esperados — UI**
    - Inscrição some da lista de processos seletivos do perfil do aluno **ou** passa a estado claramente cancelado, conforme design definido.
    - Mensagem de sucesso clara é exibida.
    - O botão de cancelamento deixa de aparecer.

  - **Resultados esperados — Banco**
    - `inscricoes_processo_seletivo` correspondente é removida **ou** marcada como cancelada, conforme implementação; em qualquer caso:
      - a regra de negócio "aluno pode se reinscrever depois de cancelar" deve ser viável.
    - Registros dependentes são limpos/cancelados:
      - `inscricoes_fases_ps` associados à inscrição geral;
      - `candidatos_reservas` relacionados, se existirem.

- **Passos — reinscrição após cancelamento**
  7. Ainda como o mesmo aluno, voltar à página de detalhes da entidade.
  8. Verificar se o botão de inscrição está novamente disponível.
  9. Tentar se inscrever novamente.

  - **Resultados esperados**
    - Aluno consegue criar nova inscrição (unique `(entidade_id, user_id)` não bloqueia, pois o estado anterior foi removido/ajustado corretamente).
    - Novo fluxo de inscrição recria `inscricoes_processo_seletivo` e `inscricoes_fases_ps` para esse aluno.

---

## 7. Casos de borda importantes na visão do aluno

- **Cenário — Múltiplas inscrições em diferentes entidades**
  1. Criar Processos Seletivos ativos em duas entidades diferentes.
  2. Com o mesmo aluno, inscrever-se em ambas.
  3. Acessar o perfil.

  - **Resultados esperados**
    - Listagem clara das inscrições por entidade.
    - Cada linha mostra corretamente fase atual e status para aquela entidade, sem mistura de dados.

- **Cenário — RLS / privacidade**
  1. Com o aluno A autenticado, tentar acessar (via URL direta) o detalhe de inscrição de outro aluno B, se houver rota com `id` na URL.

  - **Resultados esperados**
    - Acesso negado / redirecionamento / tela vazia segura.
    - Nenhuma informação de inscrições de outros usuários é exibida.

- **Cenário — Mudança de configuração do PS durante a inscrição**
  1. Criar inscrição para o aluno enquanto o PS tem `numero_total_fases = 3`.
  2. Após a inscrição, como owner, alterar `numero_total_fases` para 2.
  3. Avaliar, aprovar ou reprovar o aluno até chegar no fim do fluxo.

  - **Resultados esperados (do ponto de vista do aluno)**
    - UI não entra em estado quebrado (ex.: fase atual mostrando algo inexistente).
    - O aluno enxerga um fluxo coerente de fases (mesmo que haja ajustes internos).

---

## 8. Como registrar resultados deste roteiro (aluno)

- **Formato sugerido**
  - Para cada cenário deste roteiro:
    - cenário (ex.: "Elegibilidade — PS inativo");
    - passos executados (resumo);
    - resultado esperado;
    - resultado observado (OK/bug);
    - notas de usabilidade (confusão, textos pouco claros, etc.);
    - severidade (bloqueador/alto/médio/baixo).

- **Critério de conclusão do to-do**
  - Todos os cenários principais deste roteiro executados em ambiente real com usuário de teste.
  - Principais divergências entre esperado e observado mapeadas como bugs com severidade.
  - Fluxo principal do aluno (elegibilidade → inscrição → acompanhamento → formulários de fase → decisões da entidade → cancelamento, quando pendente) funcionando ponta a ponta ou com bloqueios claramente identificados para correção posterior.

