import { test, expect } from '@playwright/test';

test.describe('Smoke - fluxos críticos', () => {
  test('Home carrega e exibe conteúdo principal', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hub|Insper|Entidades/i);
    await expect(page.getByRole('heading', { name: /Hub de Entidades/i })).toBeVisible({ timeout: 10_000 });
  });

  test('Página de autenticação carrega', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { level: 1 }).or(page.getByText(/entrar|login|auth/i)).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Listagem de entidades carrega (ou redireciona para auth)', async ({ page }) => {
    await page.goto('/entidades');
    await expect(page).toHaveURL(/\/(entidades|auth)/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading').or(page.getByRole('link').first())).toBeVisible({ timeout: 15_000 });
  });

  test('Listagem de eventos carrega (ou redireciona para auth)', async ({ page }) => {
    await page.goto('/eventos');
    await expect(page).toHaveURL(/\/(eventos|auth)/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading').or(page.getByRole('link').first())).toBeVisible({ timeout: 15_000 });
  });

  test('Termos de uso carregam', async ({ page }) => {
    await page.goto('/termos-uso');
    await expect(page).toHaveURL(/termos-uso/);
    await expect(page.locator('body')).toBeVisible();
  });
});
