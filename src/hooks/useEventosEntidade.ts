import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  horario?: string;
  capacidade?: number;
  link_evento?: string;
  status: string;
  entidade_id: number;
  created_at: string;
  updated_at: string;
}

export const useEventosEntidade = (entidadeId?: number) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    if (!entidadeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('entidade_id', entidadeId)
        .order('data', { ascending: true })
        .order('horario', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [entidadeId]);

  return { eventos, loading, error, refetch: fetchEventos };
};