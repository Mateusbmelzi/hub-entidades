# Estado Atual da Implementação — Hub de Entidades Insper

> Gerado em: Fevereiro de 2026
> Propósito: Mapa completo do que está implementado, incompleto e ausente, para orientar a finalização do MVP antes da apresentação ao comitê do Insper.

---

## Resumo Executivo

O projeto está **~85% completo** em funcionalidades core. A plataforma já é funcional e utilizável, mas possui lacunas críticas que precisam ser fechadas antes do lançamento piloto: logging sem persistência, recomendações ausentes, limpeza de código de produção e features prometidas na proposta que ainda não foram construídas.

**Métricas do codebase:**
- 35 páginas (rotas)
- 112 componentes React
- 95 custom hooks
- 7 Edge Functions
- ~314 arquivos TypeScript/TSX
- ~920 console.logs (remover antes de produção)

---

## Funcionalidades por Status

### ALUNO

| Feature | Status | Notas |
|---------|--------|-------|
| Cadastro / Login via email | ✅ Completo | Supabase Auth |
| Verificação de email | ✅ Completo | Edge Function send-email-verification |
| Setup de perfil (onboarding) | ✅ Completo | ProfileSetup.tsx |
| Editar perfil | ✅ Completo | EditarPerfilAluno.tsx |
| Explorar entidades com filtros | ⚠️ Parcial | Filtro por área JSON limitado (TODO no código) |
| Ver página de uma entidade | ✅ Completo | EntidadeDetalhes.tsx |
| Demonstrar interesse em entidade | ✅ Completo | DemonstrarInteresse.tsx |
| Ver eventos com filtros | ✅ Completo | Eventos.tsx |
| Ver detalhes de evento | ✅ Completo | EventoDetalhes.tsx |
| Inscrever-se em evento | ✅ Completo | FormularioInscricaoEvento.tsx |
| Ver projetos das entidades | ✅ Completo | Projetos.tsx, ProjetoDetalhes.tsx |
| Reservar sala | ✅ Completo | ReservaSalaFormV2.tsx |
| Reservar auditório | ✅ Completo | ReservaAuditorioFormV3.tsx |
| Ver minhas reservas | ✅ Completo | MinhasReservas.tsx |
| Cronograma / calendário | ✅ Completo | Cronograma.tsx, CalendarioReservas.tsx |
| Gestão de áreas de interesse | ❌ Incompleto | Hardcoded, sem persistência no banco (TODO) |
| Notificações | ⚠️ Parcial | UI pronta, mas 48 console.logs; persistência incerta |
| Tracking de atividade | ❌ Incompleto | useActivityLogger.ts - todos RPCs comentados com TODO |
| Recomendações personalizadas de entidades | ❌ Ausente | Prometido na proposta, não iniciado |
| Ver ranking de entidades | ❌ Ausente | Prometido na proposta, não iniciado |
| Networking / ver ex-membros | ❌ Ausente | Prometido na proposta, não iniciado |
| Chatbot de dúvidas | ❌ Ausente | Prometido na proposta, não iniciado |
| Histórico longitudinal de participação | ❌ Ausente | Prometido na proposta, não iniciado |

---

### ENTIDADE

| Feature | Status | Notas |
|---------|--------|-------|
| Login de entidade | ✅ Completo | EntityLoginForm.tsx, useEntityAuth |
| Editar página da entidade | ✅ Completo | EditarEntidadeForm.tsx |
| Upload foto de perfil | ✅ Completo | UploadFotoPerfil.tsx |
| Criar / editar eventos | ✅ Completo | CriarEventoEntidade.tsx, EditarEventoEntidade.tsx |
| Vincular evento a reserva | ✅ Completo | VincularEventoReserva.tsx |
| Criar / editar projetos | ✅ Completo | CriarProjetoForm.tsx, EditarProjetoForm.tsx |
| Vincular membros a projetos | ✅ Completo | VincularMembrosProjeto.tsx |
| Gerenciar membros | ✅ Completo | GerenciarMembrosEntidade.tsx |
| Gerenciar cargos | ✅ Completo | GerenciarCargosEntidade.tsx |
| Gerenciar empresas parceiras | ✅ Completo | GerenciarEmpresasParceiras.tsx |
| Criar processo seletivo | ✅ Completo | |
| Gerenciar fases do PS | ✅ Completo | GerenciarFasesProcesso.tsx |
| Editar fases do PS | ✅ Completo | EditarProcessoSeletivo.tsx |
| Kanban de candidatos | ✅ Completo | KanbanColumnPS.tsx |
| Formulários por fase | ✅ Completo | FormularioFaseProcesso.tsx |
| Templates de formulários | ✅ Completo | GerenciarTemplatesFormularios.tsx, CriarEditarTemplate.tsx |
| Configurar formulário de inscrição | ✅ Completo | ConfigurarFormularioInscricao.tsx |
| Ver inscritos em evento | ✅ Completo | GerenciarInscritosEvento.tsx |
| Ver respostas de formulário | ✅ Completo | VisualizarRespostasFormulario.tsx |
| Ver demonstrações de interesse | ✅ Completo | DemonstracoesInteresse.tsx |
| Calendário da entidade | ✅ Completo | CalendarioEntidade.tsx |
| Exportar dados (CSV/Excel/PDF) | ✅ Completo | csv-export.ts, excel-export.ts, pdf-export.ts |
| Professores convidados | ✅ Completo | ProfessoresConvidadosManager.tsx |
| Dialog de detalhes de fase | ❌ Incompleto | TODO no AcompanhamentoFasesPS.tsx linha 104 |
| Contagem de templates/áreas na visão geral | ❌ Incompleto | Retorna 0 (TODO no EntidadeDetalhes.tsx) |
| Ranking interno da entidade | ❌ Ausente | Prometido na proposta, não iniciado |
| Horas de engajamento dos membros | ❌ Ausente | Prometido na proposta, não iniciado |
| Gestão de áreas internas | ⚠️ Parcial | GerenciarAreasInternas.tsx existe, verificar persistência |

---

### ADMIN / INSPER

| Feature | Status | Notas |
|---------|--------|-------|
| Dashboard Analytics completo | ✅ Completo | Dashboard.tsx com múltiplos charts |
| Aprovar eventos | ✅ Completo | AprovarEventosV2.tsx (V1 obsoleto) |
| Aprovar reservas | ✅ Completo | AprovarReservas.tsx |
| Gerenciar usuários | ✅ Completo | AdminCredenciais.tsx |
| Ver histórico de reservas | ✅ Completo | HistoricoReservas.tsx |
| Calendário de reservas | ✅ Completo | CalendarioReservas.tsx |
| Vinculação evento-reserva | ✅ Completo | fluxo completo |
| Exportar dashboard | ✅ Completo | ExportDashboardButton.tsx |
| Tracking de páginas visitadas | ❌ Incompleto | PageTrackingProvider.tsx simula sem gravar no banco |
| Análise longitudinal aluno-entidade | ❌ Ausente | Prometido na proposta |
| Integração com sistemas acadêmicos | ❌ Ausente | Roadmap longo prazo |

---

## Problemas Técnicos Identificados

### Críticos (Bloqueiam produção)

| Problema | Arquivo(s) | Impacto |
|----------|-----------|---------|
| Activity Logging sem DB | `useActivityLogger.ts` | Nenhuma atividade do usuário é gravada |
| Page Tracking sem DB | `PageTrackingProvider.tsx` | Analytics de navegação inexistente |
| Áreas de interesse do aluno não persistem | `GerenciarAreasInteresse.tsx` | Recomendações personalizadas impossíveis sem isso |
| Tipos do banco incompletos | `types.ts` | Só `templates_formularios` mapeado; resto sem type safety |

### Médios (Afetam qualidade da entrega)

| Problema | Arquivo(s) | Impacto |
|----------|-----------|---------|
| 920 console.logs | Todo o codebase | Exposição de dados internos em produção |
| Rotas de debug acessíveis | `App.tsx` | `/test-auth`, `/test-eventos` acessíveis publicamente |
| Componentes duplicados por versão | V2/V3 de formulários | Confusão de manutenção |
| Dialog de fase não implementado | `AcompanhamentoFasesPS.tsx:104` | UX incompleta no PS |
| Contagem 0 de templates/áreas | `EntidadeDetalhes.tsx:339,341` | Visão geral da entidade incorreta |
| Filtro de área limitado | `Entidades.tsx:92` | Descoberta de entidades prejudicada |

### Baixos (Organização)

| Problema | Impacto |
|----------|---------|
| ~30 arquivos .md na raiz | Navegação difícil |
| Nenhuma migration versionada no git | Risco de não reproduzir o banco |
| App_temp.tsx na raiz | Arquivo órfão |
| Estrutura duplicada (pasta hub-entidades dentro de hub-entidades) | Confusão de paths |

---

## Features Prometidas na Proposta NÃO Implementadas

Baseado em `HUB_de_Entidades_Documento_Explicativo.txt` e `PROPOSTA_VENDA_INSPER.md`:

1. **Chatbot especializado** — "tirar dúvidas sobre entidades, fornecer recomendações" (Seção 3 do documento)
2. **Recomendações personalizadas por IA** — "Saber quais entidades combinam comigo" (48 menções na pesquisa)
3. **Rankings de entidades** — "baseados em projetos, qualidade de convidados, engajamento de membros, impacto acadêmico"
4. **Networking / ex-membros** — "visualizar ex-membros de entidades e seus históricos"
5. **Horas de engajamento automáticas** — "sistema calcula automaticamente as horas de engajamento"
6. **Acompanhamento longitudinal** — "desde ingresso até graduação, análise do impacto no desempenho acadêmico"
7. **Integração WhatsApp/Email** para notificações de eventos
8. **Integração com sistemas institucionais** (notas, histórico do aluno)
9. **Perfil público do aluno com histórico de participação** — portfólio de entidades

---

## Edge Functions Existentes

| Função | Propósito | Status |
|--------|-----------|--------|
| `send-email-verification` | Verificação de email via Resend | ✅ |
| `update-dashboard` | Atualiza métricas do dashboard | ✅ |
| `update-indicadores-gerais` | Indicadores gerais (materialized views) | ✅ |
| `update-indicadores-profiles` | Indicadores por perfil | ✅ |
| `update-afinidade-curso-area` | Afinidade curso-área | ✅ |
| `update-taxa-conversao-entidades` | Taxa de conversão | ✅ |
| `update-top-entidades-interesse` | Top entidades por interesse | ✅ |

Todas são funções de analytics periódicas. Falta Edge Function para: envio de notificações push, integração de IA/chatbot.

---

## Próximo Passo

Ver `PLANO-IMPLEMENTACAO-COMPLETA.md` para o roadmap detalhado com prioridades, estimativas e instruções de implementação prontas para uso com Claude Code.
