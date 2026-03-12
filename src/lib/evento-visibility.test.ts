import { describe, it, expect } from 'vitest';
import { isEventoPublicamenteVisivel } from './evento-visibility';

describe('isEventoPublicamenteVisivel', () => {
  it('retorna true quando evento não tem reserva vinculada', () => {
    expect(isEventoPublicamenteVisivel({ reserva_id: null })).toBe(true);
    expect(isEventoPublicamenteVisivel({ reserva_id: undefined })).toBe(true);
  });

  it('retorna false quando reserva_id existe mas join está vazio (reserva deletada)', () => {
    expect(isEventoPublicamenteVisivel({ reserva_id: 'x', reservas: null })).toBe(false);
    expect(isEventoPublicamenteVisivel({ reserva_id: 'x', reservas: undefined })).toBe(false);
  });

  it('retorna false quando reserva existe mas não está aprovada', () => {
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: { status_reserva: 'pendente' },
      })
    ).toBe(false);
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: { status_reserva: 'rejeitada' },
      })
    ).toBe(false);
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: { status: 'pendente' },
      })
    ).toBe(false);
  });

  it('retorna true quando reserva está aprovada (status_reserva)', () => {
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: { status_reserva: 'aprovada' },
      })
    ).toBe(true);
  });

  it('retorna true quando reserva está aprovada (status fallback)', () => {
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: { status: 'aprovada' },
      })
    ).toBe(true);
  });

  it('trata reservas como array (join left retorna array)', () => {
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: [{ status_reserva: 'aprovada' }],
      })
    ).toBe(true);
    expect(
      isEventoPublicamenteVisivel({
        reserva_id: 'x',
        reservas: [{ status_reserva: 'pendente' }],
      })
    ).toBe(false);
  });

  it('retorna false quando array de reservas está vazio', () => {
    expect(isEventoPublicamenteVisivel({ reserva_id: 'x', reservas: [] })).toBe(false);
  });
});
