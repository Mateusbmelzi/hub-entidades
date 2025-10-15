import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AreaPadrao {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  ativo: boolean;
  created_at: string;
}

export const useAreasPadrao = () => {
  const [areas, setAreas] = useState<AreaPadrao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('areas_padrao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (fetchError) {
        throw fetchError;
      }

      setAreas(data || []);
    } catch (err: any) {
      console.error('Error fetching areas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAreasByCategoria = (categoria: string) => {
    return areas.filter(area => area.categoria === categoria);
  };

  const getAreaByName = (nome: string) => {
    return areas.find(area => area.nome === nome);
  };

  const getAreasNames = () => {
    return areas.map(area => area.nome);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return {
    areas,
    loading,
    error,
    refetch: fetchAreas,
    getAreasByCategoria,
    getAreaByName,
    getAreasNames
  };
}; 