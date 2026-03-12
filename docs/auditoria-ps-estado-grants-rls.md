## Auditoria PS — Estado atual de GRANTs/RLS

Este documento registra o resultado da auditoria de privilégios de tabela (GRANTs) e o impacto esperado nas regras de Processo Seletivo (PS), para orientar o próximo ciclo de hardening.

### Escopo analisado

Foram inspecionadas as tabelas centrais de PS e reservas:

- `processos_seletivos_fases`
- `inscricoes_processo_seletivo`
- `inscricoes_fases_ps`
- `formularios_fases_ps`
- `fases_reservas`
- `candidatos_reservas`
- `membros_entidade`
- `reservas`
- `entidades`
- `templates_formularios`
- `profiles`

### Achado principal (GRANTs)

Para todas as tabelas acima, o dump de `information_schema.role_table_grants` mostrou que os roles abaixo possuem **todos** os privilégios de tabela:

- `anon`: `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE`
- `authenticated`: `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE`
- `service_role`: todos os privilégios (esperado para uso interno/backend)
- `postgres`: todos os privilégios (owner do banco)

Ou seja, em nível de GRANT:

- Qualquer usuário `anon` ou `authenticated` tem, a priori, permissão para **criar, alterar e apagar** linhas em todas as tabelas de PS, reservas, entidades, membros e perfis.
- A segurança efetiva hoje depende 100% de:
  - RLS corretamente habilitado e configurado **em todas essas tabelas**, e/ou
  - o fato de o app nunca expor diretamente essas operações (por exemplo, usar apenas RPCs `SECURITY DEFINER`).

Se houver **qualquer** tabela acima:

- com RLS desabilitado, ou
- com políticas permissivas demais,

então o conjunto de GRANTs atuais é suficiente para permitir acesso muito além da matriz de permissão definida no plano do PS.

### Impacto em relação ao plano de PS

O plano de verificação do PS exige, entre outros, que:

- **Aluno**:
  - só consiga cancelar inscrição geral quando `status = 'pendente'`;
  - só consiga ver/mexer nas suas próprias inscrições e fases;
  - não consiga atribuir reservas, aprovar fases, virar membro etc.
- **Entidade (owner)**:
  - consiga configurar fases e reservas da própria entidade;
  - consiga aprovar/reprovar candidatos e avançar fases;
  - consiga atribuir candidatos a reservas vinculadas à entidade.
- **Admin/SuperAdmin**:
  - tenha visão global/controlada via `profiles.role`.

Com os GRANTs atuais:

- Se uma policy de RLS for esquecida ou mal configurada:
  - `anon` ou `authenticated` podem alterar diretamente:
    - `inscricoes_processo_seletivo` (aprovar/reprovar, apagar, criar)
    - `inscricoes_fases_ps` (mudar status, feedback, formulário preenchido)
    - `fases_reservas` / `candidatos_reservas` (atribuição de reservas)
    - `membros_entidade` (inserir/remover membros)
    - `entidades` (config geral, incluindo parâmetros de PS)
  - isso quebra a separação clara entre aluno, owner e admin definida na arquitetura.

### Recomendações para o próximo passo (hardening)

Estas recomendações são o input direto para a próxima migração/ajuste de segurança:

- **1) Fechar completamente o role `anon` nessas tabelas de PS**
  - Objetivo: nenhum acesso direto (nem leitura) a dados sensíveis de PS/reservas/membros.
  - Caminho: `REVOKE ALL ON TABLE ... FROM anon;` para todas as tabelas da lista de escopo.
  - Exceção, se necessário: leitura pública de partes de `entidades`/`reservas` pode ser feita via *view* ou RPC específico, não via GRANT direto.

- **2) Restringir `authenticated` ao mínimo necessário**
  - Manter `SELECT` apenas onde o app realmente faz leitura direta.
  - Para operações sensíveis (inscrever, cancelar, aprovar, avançar fase, atribuir reserva, criar membro):
    - preferir **RPCs `SECURITY DEFINER`** com validações claras e, se possível, RLS mais apertado;
    - ou usar RLS robusto, garantindo que:
      - aluno só mexe nas próprias linhas;
      - owner só mexe em linhas da própria entidade;
      - admin tem visão/controlada via `profiles.role`.

- **3) Revisar e alinhar RLS após apertar os GRANTs**
  - Confirmar, tabela por tabela, que:
    - RLS está **habilitado** (`relrowsecurity = true`) nas tabelas de PS e reservas;
    - existe pelo menos uma política por comando relevante (`SELECT/INSERT/UPDATE/DELETE`);
    - as policies batem com a matriz mínima descrita no plano (aluno vs entidade vs admin).

### Como usar este documento

- Este arquivo é referência para o agente que irá:
  - escrever a migração de `REVOKE/GRANT` correta; e
  - ajustar/criar as políticas RLS necessárias.
- Combine este resumo com:
  - `docs/auditoria-ps-schema-rls.md` (colunas/constraints/relacionamentos);
  - o plano detalhado de PS no arquivo de plano associado.

