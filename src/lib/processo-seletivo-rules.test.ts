import { describe, it, expect } from 'vitest';
import {
  type StatusInscricaoProcesso,
  isInscricaoElegivel,
  canCancelarInscricao,
  getFormularioFaseStrategy,
} from './processo-seletivo-rules';

describe('processo-seletivo-rules', () => {
  describe('isInscricaoElegivel', () => {
    const baseParams = {
      processoSeletivoAtivo: true,
      abertura: null as string | null,
      fechamento: null as string | null,
    };

    it('retorna false quando processo seletivo está inativo', () => {
      expect(
        isInscricaoElegivel({
          ...baseParams,
          processoSeletivoAtivo: false,
        }),
      ).toBe(false);
    });

    it('retorna true quando ativo e sem datas configuradas', () => {
      expect(isInscricaoElegivel(baseParams)).toBe(true);
    });

    it('respeita data de abertura quando configurada', () => {
      const abertura = '2026-03-10';
      const fechamento = null;

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-09T10:00:00Z'),
        }),
      ).toBe(false);

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-10T00:00:00Z'),
        }),
      ).toBe(true);
    });

    it('respeita data de fechamento quando configurada', () => {
      const abertura = null;
      const fechamento = '2026-03-20';

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-20T23:59:59Z'),
        }),
      ).toBe(true);

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-21T00:00:00Z'),
        }),
      ).toBe(false);
    });

    it('respeita intervalo completo quando abertura e fechamento estão configurados', () => {
      const abertura = '2026-03-10';
      const fechamento = '2026-03-20';

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-09T23:59:59Z'),
        }),
      ).toBe(false);

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-10T00:00:00Z'),
        }),
      ).toBe(true);

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-20T23:59:59Z'),
        }),
      ).toBe(true);

      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura,
          fechamento,
          agora: new Date('2026-03-21T00:00:00Z'),
        }),
      ).toBe(false);
    });

    it('trata datas inválidas como não configuradas', () => {
      expect(
        isInscricaoElegivel({
          processoSeletivoAtivo: true,
          abertura: 'data-invalida',
          fechamento: 'outra-invalida',
          agora: new Date('2026-03-10T00:00:00Z'),
        }),
      ).toBe(true);
    });
  });

  describe('canCancelarInscricao', () => {
    const statuses: StatusInscricaoProcesso[] = ['pendente', 'aprovado', 'reprovado', 'cancelado'];

    it('permite cancelamento apenas quando status é pendente', () => {
      expect(canCancelarInscricao('pendente')).toBe(true);

      for (const status of statuses.filter((s) => s !== 'pendente')) {
        expect(canCancelarInscricao(status)).toBe(false);
      }
    });
  });

  describe('getFormularioFaseStrategy', () => {
    it('usa template quando template_formulario_id está definido', () => {
      expect(
        getFormularioFaseStrategy({
          templateFormularioId: '123',
          hasFormularioProprio: false,
        }),
      ).toBe('template');

      expect(
        getFormularioFaseStrategy({
          templateFormularioId: 456,
          hasFormularioProprio: true,
        }),
      ).toBe('template');
    });

    it('usa formulário próprio quando não há template mas existe formulário da fase', () => {
      expect(
        getFormularioFaseStrategy({
          templateFormularioId: null,
          hasFormularioProprio: true,
        }),
      ).toBe('proprio');
    });

    it('retorna nenhum quando não há template nem formulário próprio', () => {
      expect(
        getFormularioFaseStrategy({
          templateFormularioId: null,
          hasFormularioProprio: false,
        }),
      ).toBe('nenhum');
    });
  });
});

