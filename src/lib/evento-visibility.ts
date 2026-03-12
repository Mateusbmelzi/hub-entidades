/**
 * Shared visibility predicate for public-facing event listings.
 *
 * An event is publicly visible when:
 *  1. status_aprovacao = 'aprovado'
 *  2. status != 'cancelado'
 *  3. Either has no linked reserva, OR the linked reserva is 'aprovada'
 *
 * Rules 1 & 2 are typically enforced at query level (.eq / .neq).
 * Rule 3 must be checked client-side because PostgREST cannot filter
 * on joined columns without a database view.
 *
 * When reserva_id is set but the join returns empty (e.g. reserva deleted),
 * the event is considered not visible.
 */

export interface EventoComReserva {
  reserva_id?: string | null;
  reservas?: { status_reserva?: string; status?: string } | { status_reserva?: string; status?: string }[] | null;
}

function getReservaFromJoin(evento: EventoComReserva): { status_reserva?: string; status?: string } | null {
  const r = evento.reservas;
  if (r == null) return null;
  const reserva = Array.isArray(r) ? r[0] : r;
  return reserva && typeof reserva === 'object' ? reserva : null;
}

function reservaAprovada(reserva: { status_reserva?: string; status?: string }): boolean {
  const s = reserva.status_reserva ?? reserva.status;
  return s === 'aprovada';
}

/**
 * Returns true if the event should be shown to the public.
 * Safe against nulls, missing joins, and unexpected shapes.
 */
export function isEventoPublicamenteVisivel(evento: EventoComReserva): boolean {
  if (!evento.reserva_id) return true;

  const reserva = getReservaFromJoin(evento);
  if (!reserva) return false;

  return reservaAprovada(reserva);
}

/**
 * Supabase select fragment to include reserva status for visibility checks.
 * Append to the main select when the query fetches from 'eventos'.
 */
export const RESERVA_VISIBILITY_SELECT = `
  reservas!left(
    id,
    status_reserva
  )
`;
