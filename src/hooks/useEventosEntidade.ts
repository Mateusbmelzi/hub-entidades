import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isEventoPublicamenteVisivel } from '@/lib/evento-visibility';

export interface Evento {
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
  entidade_id: number;
  created_at: string;
  updated_at: string;
  tipo_evento?: string | null;
  palestrantes_convidados?: any[] | null;
  observacoes?: string | null;
  reserva_id?: string | null;
  reservas?: { id: string; status_reserva?: string }[] | null;
}

export const useEventosEntidade = (entidadeId?: number, isEntityOwner: boolean = false) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    if (!entidadeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('eventos')
        .select(`*, reservas!left(id, status_reserva)`)
        .eq('entidade_id', entidadeId);

      if (queryError) throw queryError;

      const normalized = (data || []).map((row) => ({
        ...row,
        reservas: Array.isArray(row.reservas) ? row.reservas : row.reservas ? [row.reservas] : [],
      }));

      let filteredData = normalized;
      if (!isEntityOwner) {
        filteredData = filteredData
          .filter((e) => e.status_aprovacao === 'aprovado')
          .filter((row) => {
            try {
              return isEventoPublicamenteVisivel(row);
            } catch {
              return false;
            }
          });
      }

      setEventos(filteredData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('useEventosEntidade:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    await fetchEventos();
  }, []);

  useEffect(() => {
    if (entidadeId) {
      fetchEventos();
    }
  }, [entidadeId, isEntityOwner]);

  return { eventos, loading, error, refetch };
};