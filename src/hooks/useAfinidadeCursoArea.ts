import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AfinidadeCursoArea {
  total_interesses: number;
  curso_estudante: string;
  area_atuacao: string;
}

export const useAfinidadeCursoArea = () => {
  const [afinidades, setAfinidades] = useState<AfinidadeCursoArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAfinidades = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('afinidade_curso_area')
        .select('*')
        .order('total_interesses', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setAfinidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar afinidades curso-área:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfinidades();
  }, []);

  return {
    afinidades,
    loading,
    error,
    refetch: fetchAfinidades
  };
};
