# Hub de Entidades Insper — Contexto para Claude Code

## O Projeto

**Hub de Entidades Insper** é uma plataforma web que conecta alunos do Insper com as organizações estudantis da instituição. Desenvolvido independentemente por Gabriel Pradyumna (CC) e Mateus Melzi (ADM), foi aprovado pelo time técnico do Insper e encaminhado ao comitê com prioridade máxima.

**Stack:** React 18 + TypeScript + Vite + Supabase (PostgreSQL + Auth + Edge Functions) + Tailwind CSS + shadcn/ui

## Arquitetura Central

```
src/
├── pages/          # 35 páginas (rotas)
├── components/     # 112 componentes React
│   └── ui/         # shadcn/ui base (54 componentes)
├── hooks/          # 95 custom hooks (toda lógica de dados aqui)
├── types/          # Tipos TypeScript manuais
├── lib/            # Utilitários e helpers
└── integrations/
    └── supabase/   # Cliente e tipos Supabase
supabase/
├── functions/      # 7 Edge Functions (analytics/cron)
└── migrations/     # Migrações SQL
```

## Três Perfis de Usuário

1. **Aluno** — acesso normal, autenticado via Supabase Auth (email institucional)
2. **Entidade** — representante da org, login separado via `useEntityAuth`, tem acesso ao painel de gestão
3. **Admin/SuperAdmin** — Insper, tem dashboard Analytics + aprovação de eventos/reservas

## Padrões do Codebase

- **Todos os dados vêm de hooks** — nunca buscar dados direto em componentes. Criar hook em `src/hooks/`
- **Formulários:** React Hook Form + Zod para validação
- **Notificações:** `sonner` (toast), importar de `sonner`
- **Estado servidor:** TanStack Query (useQuery/useMutation), configurado em `App.tsx`
- **Estilo:** Tailwind CSS, nunca estilos inline, usar classes shadcn/ui
- **Roteamento:** React Router v6, rotas em `App.tsx`
- **Supabase client:** importar de `@/integrations/supabase/client`
- **Ícones:** Lucide React

## Regras de Negócio Importantes

- Evento só aparece publicamente se: `status_aprovacao = 'aprovado'` AND (`reserva_id IS NULL` OR reserva vinculada está `status_reserva = 'aprovada'`)
- Entidades criam eventos → Admin do Insper aprova → evento fica visível
- Reservas (salas/auditório) são independentes dos eventos; vinculação é opcional
- Processo Seletivo tem fases; cada fase pode ter formulário próprio e reservas vinculadas
- Row Level Security (RLS) do Supabase controla acesso — mudanças de schema precisam de políticas RLS

## Features Implementadas (Não Recriar)

- Autenticação (aluno + entidade + super admin)
- CRUD completo de eventos, projetos, entidades
- Sistema de reservas (sala + auditório) com aprovação
- Processo Seletivo com fases, formulários, kanban de candidatos
- Templates de formulários reutilizáveis
- Dashboard Analytics com charts (recharts)
- Sistema de demonstração de interesse
- Notificações (NotificationBell)
- Calendário de entidade e reservas
- Upload de fotos (Supabase Storage)
- Exportação CSV/Excel/PDF

## O Que AINDA NÃO ESTÁ Implementado

Ver `PLANO-IMPLEMENTACAO-COMPLETA.md` para o plano detalhado. Resumo das lacunas:

1. **Activity Logging** — `useActivityLogger.ts` tem todos os RPC calls comentados com TODO
2. **Page Tracking** — `PageTrackingProvider.tsx` simula rastreamento sem gravar no banco
3. **Gestão de Áreas de Interesse do Aluno** — hardcoded, sem persistência no banco
4. **Filtro de Área nas Entidades** — limitado por suporte do Supabase a arrays JSON
5. **Contagem de Templates/Áreas em EntidadeDetalhes** — retorna 0 (TODO no código)
6. **Dialog de Detalhes de Fase (PS)** — TODO no `AcompanhamentoFasesPS.tsx`
7. **Rankings de Entidades** — prometido na proposta, não implementado
8. **Recomendações personalizadas por IA** — prometido, não implementado
9. **Chatbot** — prometido na proposta, não implementado
10. **Limpeza de produção** — 920 console.logs, rotas de debug, componentes duplicados

## Convenções de Código

```tsx
// Hook padrão
export function useMinhaFeature(param: string) {
  return useQuery({
    queryKey: ['minha-feature', param],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tabela')
        .select('*')
        .eq('campo', param);
      if (error) throw error;
      return data;
    }
  });
}

// Mutation padrão
export function useCreateAlgo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AlgoInsert) => {
      const { data, error } = await supabase.from('tabela').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['algo'] });
      toast.success('Criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar: ' + error.message);
    }
  });
}
```

## Variáveis de Ambiente

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Comandos Úteis

```bash
npm run dev          # Dev server
npm run build        # Build produção
npm run lint         # ESLint
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts  # Atualizar tipos
```
