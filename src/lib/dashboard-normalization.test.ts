import { describe, it, expect } from 'vitest';
import { mapActivityLogToItem } from './dashboard-normalization';

describe('mapActivityLogToItem', () => {
  const baseRow = {
    id: 'log-1',
    activity_type: 'page_visit',
    title: 'Visita',
    description: 'Página acessada',
    created_at: '2025-01-15T10:00:00Z',
    status: 'completed' as const,
    entity_id: null,
    user_id: 'user-1',
    page_url: '/entidades',
    session_id: 'sess-1',
  };

  it('mapeia campos corretamente para ActivityItem', () => {
    const result = mapActivityLogToItem(baseRow);
    expect(result).toEqual({
      id: 'log-1',
      type: 'page_visit',
      title: 'Visita',
      description: 'Página acessada',
      timestamp: '2025-01-15T10:00:00Z',
      status: 'completed',
      entity: undefined,
      user: 'user-1',
      pageUrl: '/entidades',
      sessionId: 'sess-1',
    });
  });

  it('normaliza activity_type inválido para page_visit', () => {
    const result = mapActivityLogToItem({
      ...baseRow,
      activity_type: 'tipo_desconhecido',
    });
    expect(result.type).toBe('page_visit');
  });

  it('aceita todos os tipos válidos de atividade', () => {
    const validTypes = [
      'user_registration',
      'entity_creation',
      'event_creation',
      'project_creation',
      'interest_demonstration',
      'page_visit',
      'search',
      'user_login',
      'profile_update',
    ];
    for (const activityType of validTypes) {
      const result = mapActivityLogToItem({
        ...baseRow,
        activity_type: activityType,
      });
      expect(result.type).toBe(activityType);
    }
  });

  it('normaliza status inválido para completed', () => {
    const result = mapActivityLogToItem({
      ...baseRow,
      status: 'cancelled',
    });
    expect(result.status).toBe('completed');
  });

  it('mantém status completed, pending e failed', () => {
    expect(mapActivityLogToItem({ ...baseRow, status: 'pending' }).status).toBe('pending');
    expect(mapActivityLogToItem({ ...baseRow, status: 'failed' }).status).toBe('failed');
  });

  it('converte entity_id numérico para string em entity', () => {
    const result = mapActivityLogToItem({
      ...baseRow,
      entity_id: 42,
    });
    expect(result.entity).toBe('42');
  });

  it('usa string vazia para description quando null', () => {
    const result = mapActivityLogToItem({
      ...baseRow,
      description: null,
    });
    expect(result.description).toBe('');
  });
});
