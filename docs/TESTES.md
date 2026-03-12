# Testes e Quality Gate

## Scripts

| Script       | Descrição |
|-------------|-----------|
| `npm run test`       | Vitest em modo watch (unitários) |
| `npm run test:unit`  | Unitários uma vez |
| `npm run test:run`   | Unitários + cobertura |
| `npm run test:e2e`   | Playwright E2E (sobe dev server) |
| `npm run test:e2e:ci`| E2E em Chromium (para CI) |

## Unitários (Vitest)

- **`src/lib/evento-visibility.test.ts`** — Regra de visibilidade pública de eventos (com/sem reserva aprovada).
- **`src/lib/dashboard-normalization.test.ts`** — Normalização de activity logs para o dashboard.
- **`src/hooks/useInscricaoEvento.test.tsx`** — Inscrição em evento (RPC mockado).

## E2E (Playwright)

- **`e2e/smoke.spec.ts`** — Smoke: Home, Auth, Entidades, Eventos, Termos de uso.

Rodar E2E localmente: `npm run test:e2e` (sobe o app em `http://localhost:8081`).

## Quality Gate (CI)

O workflow `.github/workflows/ci.yml` roda em push/PR para `main`/`master`:

1. **Lint** — `npm run lint`
2. **Build** — `npm run build`
3. **Unitários** — `npm run test:unit`
4. **E2E** — build servido com `npm run preview`, depois `test:e2e:ci`

## Testes de integração (Supabase)

Testes contra banco real (RLS, constraints) exigem projeto Supabase de teste ou `supabase start` local. Não estão automatizados no CI; para rodar manualmente use um projeto de teste e as mesmas migrações.
