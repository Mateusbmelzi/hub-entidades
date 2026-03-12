# Plano de Implementação Completa — Hub de Entidades Insper

> Para usar com Claude Code: cada seção é um prompt pronto ou uma tarefa clara.
> Contexto do projeto está em `CLAUDE.md`.
> Estado atual detalhado em `ESTADO-ATUAL-IMPLEMENTACAO.md`.

---

## Priorização

```
FASE 1 — Fechar Lacunas Críticas (MVP sólido)
FASE 2 — Limpeza de Produção (qualidade de entrega)
FASE 3 — Features de Alto Impacto da Proposta (WOW factor para o comitê)
FASE 4 — Funcionalidades Futuras (roadmap)
```

---

## FASE 1 — Fechar Lacunas Críticas

### 1.1 — Activity Logging com Persistência Real

**Por que:** O `useActivityLogger.ts` tem todos os RPC calls comentados com TODO. Sem isso, não há dados de engajamento real para o dashboard do Insper, que é um dos principais valores prometidos.

**Arquivos a modificar:**
- `src/hooks/useActivityLogger.ts` — descomentar e implementar RPCs
- Supabase: criar tabela `activity_logs`

**SQL para executar no Supabase Dashboard:**
```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  action_type TEXT NOT NULL, -- 'page_visit', 'search', 'interest_click', 'event_view', etc.
  entity_id INT REFERENCES public.entidades(id) ON DELETE SET NULL,
  evento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Usuários inserem apenas seus próprios logs
CREATE POLICY "Users can insert own logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin vê todos os logs
CREATE POLICY "Admins can view all logs"
  ON public.activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Índices para performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
```

**Prompt para Claude Code:**
```
Implemente o activity logging real no Hub de Entidades Insper.

1. Leia src/hooks/useActivityLogger.ts — todos os RPC calls estão comentados com TODO
2. Crie a tabela activity_logs no Supabase (SQL acima já foi executado)
3. Implemente as funções: logActivity(), logPageVisit(), logSearch(), logInterestDemonstration()
   - Usar supabase.from('activity_logs').insert() ao invés dos RPCs comentados
4. Leia PageTrackingProvider.tsx e implemente o rastreamento real chamando os hooks de useActivityLogger
5. Não adicione console.logs novos
```

---

### 1.2 — Gestão de Áreas de Interesse do Aluno com Persistência

**Por que:** `GerenciarAreasInteresse.tsx` tem dados hardcoded e os saves são simulados (TODO nas linhas 49 e 92). Sem isso, o sistema de recomendações e a feature "quais entidades combinam comigo" são impossíveis.

**SQL para executar no Supabase:**
```sql
-- Verificar se a coluna já existe em profiles
-- Se não existir:
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS areas_interesse TEXT[] DEFAULT '{}';

-- Função RPC para atualizar áreas
CREATE OR REPLACE FUNCTION public.update_student_areas_interesse(
  p_user_id UUID,
  p_areas TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET areas_interesse = p_areas, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
```

**Prompt para Claude Code:**
```
Implemente a persistência das áreas de interesse do aluno:

1. Leia src/components/GerenciarAreasInteresse.tsx — TODOs nas linhas 49 e 92
2. Leia src/hooks/useUpdateStudentAreaInteresse.ts para entender o hook existente
3. Conecte o componente ao hook real, removendo os dados hardcoded
4. As áreas de interesse devem ser salvas na coluna areas_interesse da tabela profiles
5. Atualize a query de busca de perfil para incluir areas_interesse
```

---

### 1.3 — Contagens Reais em EntidadeDetalhes

**Por que:** A visão geral da entidade mostra 0 para templates e áreas (TODOs nas linhas 339 e 341 de `EntidadeDetalhes.tsx`).

**Prompt para Claude Code:**
```
Corrija as contagens na visão geral da entidade em EntidadeDetalhes.tsx:

1. Leia src/pages/EntidadeDetalhes.tsx, localize os TODOs nas linhas ~339 e ~341:
   - totalTemplates: 0, // TODO: implementar contagem de templates
   - totalAreas: 0 // TODO: implementar contagem de áreas

2. Implemente contagem real de templates:
   - Usar supabase.from('templates_formularios').select('id', { count: 'exact' }).eq('entidade_id', id)
   - Pode ser feito dentro do hook de dados existente ou como query separada

3. Implemente contagem real de áreas internas:
   - Verificar a tabela de áreas_internas (ou similar) e contar registros da entidade

4. Exibir os valores reais na UI
```

---

### 1.4 — Dialog de Detalhes de Fase no Processo Seletivo

**Por que:** `AcompanhamentoFasesPS.tsx:104` tem TODO "Implementar dialog de detalhes". Cliques em fases do processo seletivo não abrem detalhes completos.

**Prompt para Claude Code:**
```
Implemente o dialog de detalhes de fase no processo seletivo:

1. Leia src/components/AcompanhamentoFasesPS.tsx — encontre o TODO na linha ~104
2. Leia src/components/DetalhesCandidatoPS.tsx para referência de padrão de dialog de detalhes
3. Leia src/types/acompanhamento-processo.ts para entender os tipos disponíveis
4. Implemente um Dialog (shadcn/ui Dialog) que mostra:
   - Nome e tipo da fase
   - Datas de início e fim
   - Descrição/instruções
   - Número de candidatos nessa fase
   - Status (ativa/futura/passada)
5. O dialog deve abrir ao clicar em uma fase na timeline
```

---

### 1.5 — Filtro de Áreas Funcional em Entidades

**Por que:** `Entidades.tsx:92` tem TODO "Implementar filtro JSON quando o Supabase suportar melhor arrays JSON". O filtro por área de atuação das entidades pode não estar funcionando corretamente.

**Prompt para Claude Code:**
```
Corrija o filtro de área de atuação na página de entidades:

1. Leia src/pages/Entidades.tsx, localize o TODO na linha ~92
2. Entenda como as áreas das entidades são armazenadas (campo JSON ou array)
3. Implemente o filtro client-side se o Supabase não suportar bem a query:
   - Buscar todas as entidades
   - Filtrar no frontend por área selecionada
   - Usar useMemo para performance
4. Alternativa: usar supabase .contains() ou .overlaps() dependendo do tipo do campo
5. Garantir que o filtro é case-insensitive
```

---

## FASE 2 — Limpeza de Produção

### 2.1 — Remover Console.Logs de Produção

**Por que:** 920 console.logs expõem dados internos, poluem o console e podem revelar informações sensíveis.

**Prompt para Claude Code:**
```
Remova os console.logs de produção do Hub de Entidades Insper.

REGRAS:
- Manter console.error() para erros reais (não console.log de erros)
- Remover TODOS os console.log usados para debug
- Não remover logs que estejam dentro de funções de teste em /test-* pages

Arquivos com mais logs para priorizar (em ordem):
1. src/hooks/useNotificationSystem.ts (48 logs)
2. src/hooks/useAcompanhamentoFases.ts (25 logs)
3. src/hooks/useAlterarSalaReserva.ts (23 logs)
4. src/components/NotificationBell.tsx (22 logs)
5. src/hooks/useUpdateProjeto.ts (23 logs)
6. src/hooks/useEventEditApprovals.ts (12 logs)
7. src/hooks/useEventosEntidade.ts (15 logs)
8. src/hooks/useAprovarReservas.ts (29 logs)

Use busca global por console.log e remova sistematicamente.
Depois de remover, verifique que o build ainda funciona com `npm run build`.
```

---

### 2.2 — Remover Rotas e Componentes de Debug

**Por que:** Rotas como `/test-auth`, `/test-eventos` são acessíveis publicamente em produção.

**Prompt para Claude Code:**
```
Remova rotas e componentes de debug do Hub de Entidades Insper para produção:

1. Leia src/App.tsx e remova as seguintes rotas:
   - /test-auth → TestAuth
   - /test-eventos → TestEventos

2. Remova os imports dos componentes de debug em App.tsx:
   - TestReservaSala
   - ReservaSalaFormV2Debug
   - ReservaSalaFormV2Simple

3. Remova rotas não mais usadas no App.tsx se existirem para:
   - ReservaSalaFormV2Debug
   - ReservaSalaFormV2Simple
   - TestReservaSala

4. NÃO delete os arquivos ainda — apenas remova das rotas.
   Os arquivos podem ser deletados em limpeza posterior.

5. Verifique que o build funciona após as mudanças.
```

---

### 2.3 — Consolidar Componentes com Múltiplas Versões

**Por que:** Existem versões V1/V2/V3 de componentes de formulário, criando confusão de manutenção.

**Prompt para Claude Code:**
```
Consolide os componentes com múltiplas versões no Hub de Entidades:

Investigue qual versão está sendo REALMENTE usada em produção para cada um:

1. ReservaSalaForm.tsx vs ReservaSalaFormV2.tsx vs ReservaSalaFormV2Debug.tsx vs ReservaSalaFormV2Simple.tsx
   - Grep por imports de cada um em pages/ e components/
   - A versão ativa deve ser a única mantida

2. ReservaAuditorioForm.tsx vs ReservaAuditorioFormV2.tsx vs ReservaAuditorioFormV3.tsx
   - Mesma análise

3. AprovarEventos.tsx vs AprovarEventosV2.tsx
   - Verificar qual está sendo usada nas rotas do App.tsx

Para cada grupo:
- Identifique a versão atual/ativa
- Documente qual é qual (comentário no topo do arquivo da versão ativa)
- NÃO delete os outros ainda — apenas identifique e reporte o que pode ser removido
```

---

### 2.4 — Atualizar Tipos do Supabase

**Por que:** `src/integrations/supabase/types.ts` só tem `templates_formularios` mapeado. O resto do banco não tem type safety.

**Prompt para Claude Code:**
```
Atualize os tipos TypeScript do Supabase no Hub de Entidades:

1. Execute: npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
   (ou --local se estiver rodando localmente)

2. Se o comando acima não funcionar, mapeie manualmente as tabelas principais em types.ts:
   - entidades (id, nome, descricao, area_atuacao, logo_url, etc.)
   - eventos (id, nome, descricao, data_evento, status_aprovacao, reserva_id, etc.)
   - reservas (id, sala_id, data_reserva, status_reserva, evento_id, etc.)
   - profiles (id, nome, curso, semestre, areas_interesse, etc.)
   - processos_seletivos (id, entidade_id, nome, etc.)
   - fases_processo (id, processo_id, nome, tipo, data_inicio, data_fim, etc.)

3. Verifique se há erros de TypeScript após a atualização com: npm run build
```

---

## FASE 3 — Features de Alto Impacto (WOW para o Comitê)

### 3.1 — Sistema de Recomendação "Quais Entidades Combinam Comigo"

**Por que:** A pesquisa com 73 alunos mostrou que 38 (52%) querem saber quais entidades combinam com eles. Esta é a feature #2 mais desejada na pesquisa e está no centro da proposta de valor.

**Lógica de recomendação:**
- Cruzar `areas_interesse` do aluno com `area_atuacao` das entidades
- Considerar curso do aluno vs perfil de membros da entidade
- Ranquear por número de demonstrações de interesse de alunos do mesmo curso

**SQL para executar no Supabase:**
```sql
-- Função de recomendação baseada em áreas de interesse
CREATE OR REPLACE FUNCTION public.get_entidades_recomendadas(p_user_id UUID)
RETURNS TABLE(
  entidade_id INT,
  nome TEXT,
  score FLOAT,
  motivo TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_areas TEXT[];
  v_curso TEXT;
BEGIN
  -- Buscar perfil do aluno
  SELECT areas_interesse, curso
  INTO v_areas, v_curso
  FROM public.profiles
  WHERE id = p_user_id;

  -- Retornar entidades ordenadas por relevância
  RETURN QUERY
  SELECT
    e.id as entidade_id,
    e.nome,
    -- Score baseado em overlap de áreas
    CARDINALITY(
      ARRAY(
        SELECT unnest(v_areas)
        INTERSECT
        SELECT unnest(string_to_array(e.area_atuacao, ','))
      )
    )::FLOAT as score,
    'Área de atuação alinhada com seus interesses' as motivo
  FROM public.entidades e
  WHERE e.ativa = true
  ORDER BY score DESC, e.nome ASC;
END;
$$;
```

**Prompt para Claude Code:**
```
Implemente o sistema de recomendação de entidades "Quais entidades combinam comigo":

1. Leia src/pages/Entidades.tsx e src/hooks/useEntidades.ts para entender a estrutura atual
2. Leia src/pages/Perfil.tsx para ver como as áreas de interesse do aluno são exibidas
3. Crie src/hooks/useEntidadesRecomendadas.ts que:
   - Busca as áreas de interesse do aluno logado
   - Busca as entidades com overlap de área
   - Retorna ordenado por relevância
4. Crie um componente src/components/EntidadesRecomendadas.tsx que:
   - Exibe até 3 cards de entidades recomendadas
   - Mostra o motivo da recomendação ("Área X alinhada com seus interesses")
   - Tem link para ver todas as entidades
5. Integre o componente na página Home.tsx (após o hero, antes da seção de entidades)
6. Se o aluno não tiver áreas de interesse configuradas, mostrar CTA para configurar perfil
```

---

### 3.2 — Ranking de Entidades

**Por que:** Prometido na proposta ("rankings de entidades baseados em projetos, engajamento, qualidade de convidados"). Cria engajamento competitivo saudável entre entidades e transparência para alunos.

**Métricas para ranking:**
- Número de eventos realizados (aprovados)
- Número de projetos ativos
- Número de demonstrações de interesse recebidas
- Número de membros
- Número de processos seletivos conduzidos

**Prompt para Claude Code:**
```
Implemente o ranking de entidades no Hub de Entidades Insper:

1. Crie src/hooks/useRankingEntidades.ts que calcula um score para cada entidade baseado em:
   - Quantidade de eventos aprovados (peso: 3 pontos cada)
   - Quantidade de projetos ativos (peso: 5 pontos cada)
   - Quantidade de demonstrações de interesse (peso: 1 ponto cada)
   - Quantidade de membros ativos (peso: 2 pontos cada)
   - Quantidade de PS realizados (peso: 10 pontos cada)
   - Fazer em query única com agregações do Supabase

2. Crie src/components/RankingEntidades.tsx que:
   - Exibe top 5 entidades com posição (#1, #2, ...)
   - Mostra ícone/troféu para top 3
   - Exibe o score total e breakdown por categoria
   - Design atraente com cores do Insper (vermelho #C8102E)
   - Animação sutil de entrada

3. Adicione a página ou seção:
   - Uma aba "Ranking" na página /entidades
   - Ou uma seção na Home abaixo da seção principal

4. No detalhe da entidade (EntidadeDetalhes.tsx), mostrar a posição atual no ranking

5. Criar hook useEntidadeRankingPosition.ts para buscar posição de uma entidade específica
```

---

### 3.3 — Perfil Público do Aluno e Networking

**Por que:** Prometido na proposta ("visualizar ex-membros e seus históricos, facilitando networking"). Feature de alto valor social que diferencia o Hub.

**Prompt para Claude Code:**
```
Implemente o perfil público do aluno e histórico de participação em entidades:

1. Leia src/pages/Perfil.tsx para ver o perfil atual (privado)
2. Crie src/pages/PerfilPublico.tsx em /perfil/:userId que mostra:
   - Nome, foto, curso, semestre
   - Entidades que é/foi membro (com cargos)
   - Projetos em que participou
   - Eventos em que se inscreveu (se público)
   - NÃO exibir dados sensíveis (email, telefone)

3. Crie src/hooks/usePerfilPublico.ts para buscar esses dados (com RLS adequado)

4. Em EntidadeDetalhes.tsx, na lista de membros, adicionar link para o perfil público de cada membro

5. Adicione rota /perfil/:userId no App.tsx

6. RLS: perfis públicos são visíveis para qualquer usuário autenticado
   - Criar política no Supabase se necessário
```

---

### 3.4 — Notificações por Email para Novos Eventos

**Por que:** 61,64% dos alunos já perderam oportunidades por não ver a tempo. Email é o canal mais confiável para garantir que alunos recebem alertas.

**Arquivos de referência:** `supabase/functions/send-email-verification/index.ts` (usar mesmo padrão de Resend)

**Prompt para Claude Code:**
```
Implemente notificações por email para novos eventos no Hub de Entidades:

1. Leia supabase/functions/send-email-verification/index.ts para entender o padrão com Resend

2. Crie supabase/functions/notify-new-evento/index.ts que:
   - É chamada quando um evento é aprovado (webhook ou trigger)
   - Busca alunos com interesse na área de atuação da entidade do evento
   - Envia email via Resend com:
     - Assunto: "Novo evento: [nome do evento] - [nome da entidade]"
     - Corpo: data, local, descrição curta, link para o evento no Hub
   - Usa template HTML simples com cores do Insper

3. Crie um Database Webhook no Supabase para chamar a Edge Function quando:
   - eventos.status_aprovacao muda para 'aprovado'

4. Adicionar configuração no perfil do aluno: "Receber notificações por email" (checkbox)
   - Só enviar para quem optou por receber

5. Adicione instrução SQL para o webhook no arquivo de documentação de migrações
```

---

### 3.5 — Chatbot de Dúvidas sobre Entidades (MVP Simples)

**Por que:** 27 dos 73 alunos pesquisados querem "ter alguém para tirar dúvidas sobre entidades". Um chatbot simples com FAQ resolveria isso sem IA complexa.

**Abordagem MVP:** FAQ pré-programado + busca por palavras-chave (sem IA por enquanto, pode evoluir depois).

**Prompt para Claude Code:**
```
Implemente um chatbot FAQ simples para dúvidas sobre entidades:

1. Crie src/components/ChatbotEntidades.tsx com:
   - Botão flutuante no canto inferior direito (ícone de chat)
   - Janela de chat que abre ao clicar
   - Interface de chat com bolhas de mensagem
   - Campo de input para perguntas

2. Crie src/lib/chatbot-faq.ts com perguntas e respostas predefinidas:
   - "Como entrar em uma entidade?" → explicação do PS
   - "O que é processo seletivo?" → explicação
   - "Quais entidades aceitam calouros?" → lista dinâmica
   - "Como reservar espaço?" → instrução
   - "Quem posso contatar?" → direcionamento
   - Implementar busca por palavras-chave nas perguntas

3. Integrar dados reais onde possível:
   - "Quais entidades têm PS aberto agora?" → buscar do banco
   - "Quais eventos essa semana?" → buscar do banco

4. Design com cores do Insper, sem parecer genérico
5. Adicionar em App.tsx como componente global (aparece em todas as páginas para usuários logados)
```

---

## FASE 4 — Funcionalidades Futuras (Roadmap)

Estas features são para o roadmap pós-lançamento piloto. Documentar aqui para referência futura.

### 4.1 — Horas de Engajamento dos Membros

Calcular automaticamente horas dedicadas por membro baseado em:
- Presença em eventos e reuniões (via inscrições/confirmações)
- Tempo como membro (data de entrada até hoje)
- Projetos ativos

### 4.2 — IA para Recomendações Avançadas

Evoluir o sistema de recomendação da Fase 3.1 usando:
- Histórico de navegação (activity_logs)
- Padrões de alunos similares (filtragem colaborativa)
- LLM via Claude API para explicações naturais

### 4.3 — Integração com Sistemas do Insper

- API para verificar se email é de aluno ativo
- Importação de dados de cursos e semestres
- Correlação participação-entidade vs desempenho acadêmico

### 4.4 — App Mobile

React Native com Expo, compartilhando lógica de negócio com o web.

### 4.5 — Expansão para Outras Instituições

Multi-tenant: FGV, Mackenzie, Inteli.

---

## Ordem de Execução Recomendada

Para o comitê do Insper, focar nesta ordem:

```
1. FASE 1.1 — Activity Logging (dados reais para o dashboard)
2. FASE 1.2 — Áreas de interesse (base para recomendações)
3. FASE 1.3 — Contagens reais (bug fix de UX)
4. FASE 1.4 — Dialog de fase PS (completude do PS)
5. FASE 1.5 — Filtro de áreas (usabilidade)
6. FASE 2.1 — Remover console.logs (produção)
7. FASE 2.2 — Remover rotas de debug (segurança)
8. FASE 3.1 — Recomendação de entidades (WOW #1)
9. FASE 3.2 — Ranking de entidades (WOW #2)
10. FASE 3.4 — Notificações por email (valor imediato)
11. FASE 3.5 — Chatbot FAQ (diferencial da proposta)
12. FASE 2.3 — Consolidar componentes (manutenção)
13. FASE 3.3 — Perfil público (networking)
14. FASE 2.4 — Tipos do Supabase (type safety)
```

---

## Como Usar Este Documento com Claude Code

1. Abra uma sessão do Claude Code na pasta `/mnt/c/Users/mateu/Documents/hub-entidades`
2. O `CLAUDE.md` já está na raiz — Claude Code vai carregar automaticamente
3. Para cada tarefa, copie o **prompt para Claude Code** da seção correspondente
4. Execute uma fase por vez, testando antes de avançar
5. Após cada fase, commite com mensagem descritiva

**Exemplo de uso:**
```bash
# Na pasta do projeto
claude "Implemente o activity logging real conforme descrito em PLANO-IMPLEMENTACAO-COMPLETA.md Fase 1.1"
```
