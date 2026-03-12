import { test, expect } from '@playwright/test';

const alunoEmail = process.env.PLAYWRIGHT_PS_ALUNO_EMAIL;
const alunoSenha = process.env.PLAYWRIGHT_PS_ALUNO_SENHA;
const entidadeNome = process.env.PLAYWRIGHT_PS_ENTIDADE_NOME;

const hasEnvVars = Boolean(alunoEmail && alunoSenha && entidadeNome);

test.describe('Processo Seletivo - fluxo mínimo', () => {
  test.skip(
    !hasEnvVars,
    'Variáveis PLAYWRIGHT_PS_ALUNO_EMAIL, PLAYWRIGHT_PS_ALUNO_SENHA e PLAYWRIGHT_PS_ENTIDADE_NOME não configuradas. Veja e2e/processo-seletivo.spec.ts.',
  );

  test('Aluno se inscreve em PS e vê inscrição no Perfil', async ({ page }) => {
    if (!alunoEmail || !alunoSenha || !entidadeNome) {
      test.skip();
    }

    await page.goto('/');

    await page.getByRole('link', { name: /entrar|login|autenticação/i }).first().click();

    await page.getByRole('textbox', { name: /email/i }).fill(alunoEmail);
    await page.getByRole('textbox', { name: /senha/i }).fill(alunoSenha);
    await page.getByRole('button', { name: /entrar|login/i }).click();

    await page.goto('/entidades');

    await page.getByRole('link', { name: new RegExp(entidadeNome, 'i') }).first().click();

    await expect(page).toHaveURL(/\/entidades\//);

    const botaoInscricao = page.getByRole('button', {
      name: /inscrever-se no processo seletivo/i,
    });
    await botaoInscricao.click();

    const dialog = page.getByRole('dialog', { name: /inscrição no processo seletivo/i });
    await expect(dialog).toBeVisible();

    const nomeInput = dialog.getByLabel(/nome completo/i);
    if (await nomeInput.isVisible()) {
      const current = await nomeInput.inputValue();
      if (!current) {
        await nomeInput.fill('Aluno E2E Processo Seletivo');
      }
    }

    const emailInput = dialog.getByLabel(/e-mail/i);
    if (await emailInput.isVisible()) {
      const current = await emailInput.inputValue();
      if (!current) {
        await emailInput.fill(alunoEmail);
      }
    }

    const mensagem = dialog.getByLabel(/mensagem/i);
    if (await mensagem.isVisible()) {
      await mensagem.fill('Inscrição criada via teste E2E Playwright.');
    }

    const submitButton = dialog.getByRole('button', { name: /enviar inscrição/i });
    await submitButton.click();

    await expect(dialog).toBeHidden({ timeout: 15000 });

    await page.goto('/perfil');

    const cardProcessos = page.getByRole('heading', {
      name: /meus processos seletivos/i,
    });
    await expect(cardProcessos).toBeVisible();

    const inscricaoCard = page.getByText(new RegExp(entidadeNome, 'i')).first();
    await expect(inscricaoCard).toBeVisible();
  });
});

