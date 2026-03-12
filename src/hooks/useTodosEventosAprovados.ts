import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isEventoPublicamenteVisivel } from '@/lib/evento-visibility';

export interface EventoCompleto {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  horario_inicio?: string | null;
  horario_termino?: string | null;
  capacidade?: number;
  link_evento?: string;
  status: string;
  status_aprovacao?: string;
  comentario_aprovacao?: string;
  data_aprovacao?: string;
  aprovador_email?: string;
  reserva_id?: string | null;
  entidade_id: number;
  created_at: string;
  updated_at: string;
  entidades?: {
    id: number;
    nome: string;
    foto_perfil_url?: string | null;
  };
  reservas?: { id: string; status_reserva?: string }[] | null;
}

export const useTodosEventosAprovados = () => {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodosEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome, foto_perfil_url),
          reservas!left(id, status_reserva)
        `)
        .eq('status_aprovacao', 'aprovado')
        .neq('status', 'cancelado')
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });
      
      if (error) throw error;

      const normalized = (data || []).map((row) => ({
        ...row,
        reservas: Array.isArray(row.reservas) ? row.reservas : row.reservas ? [row.reservas] : [],
      }));
      const filtered = normalized.filter((row) => {
        try {
          return isEventoPublicamenteVisivel(row);
        } catch {
          return false;
        }
      });
      setEventos(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('useTodosEventosAprovados:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    await fetchTodosEventos();
  }, []);

  useEffect(() => {
    fetchTodosEventos();
  }, []);

  return { eventos, loading, error, refetch };
};
