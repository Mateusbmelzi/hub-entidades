import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInscricaoEvento } from './useInscricaoEvento';

const mockRpc = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, profile: null }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useInscricaoEvento', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it('chama inscrever_evento_atomico com parâmetros corretos', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: true, status: 'confirmado' },
      error: null,
    });

    const { result } = renderHook(() => useInscricaoEvento(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.inscreverEvento('evento-1', {
        nome_participante: 'João',
        email: 'joao@insper.edu.br',
        curso: 'ADM',
        semestre: 3,
      });
    });

    expect(mockRpc).toHaveBeenCalledWith('inscrever_evento_atomico', {
      p_evento_id: 'evento-1',
      p_nome_completo: 'João',
      p_email: 'joao@insper.edu.br',
      p_profile_id: 'user-1',
      p_curso: 'ADM',
      p_semestre: 3,
      p_campos_adicionais: {},
    });
  });

  it('retorna success true quando RPC retorna success', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: true, status: 'confirmado', inscricao_id: 'insc-1' },
      error: null,
    });

    const { result } = renderHook(() => useInscricaoEvento(), { wrapper: Wrapper });

    let out: { success: boolean; status?: string } = { success: false };
    await act(async () => {
      out = await result.current.inscreverEvento('evento-1', {
        nome_participante: 'Maria',
      });
    });

    expect(out.success).toBe(true);
    expect(out.status).toBe('confirmado');
  });

  it('retorna success false quando RPC retorna success: false', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: false, error: 'Vagas esgotadas' },
      error: null,
    });

    const { result } = renderHook(() => useInscricaoEvento(), { wrapper: Wrapper });

    let out: { success: boolean; error?: unknown } = { success: true };
    await act(async () => {
      out = await result.current.inscreverEvento('evento-1', {
        nome_participante: 'Pedro',
      });
    });

    expect(out.success).toBe(false);
    expect(out.error).toBe('Vagas esgotadas');
  });

  it('repassa campos_adicionais como objeto', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { success: true, status: 'confirmado' },
      error: null,
    });

    const { result } = renderHook(() => useInscricaoEvento(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.inscreverEvento('evento-1', {
        nome_participante: 'Ana',
        campos_adicionais: { matricula: '123' },
      });
    });

    expect(mockRpc).toHaveBeenCalledWith(
      'inscrever_evento_atomico',
      expect.objectContaining({
        p_campos_adicionais: { matricula: '123' },
      })
    );
  });
});
