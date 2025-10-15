import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEventosSimple = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando busca simples de eventos...');
      
      // Buscar eventos sem filtros complexos
      const { data, error: queryError } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome)
        `)
        .order('data_evento', { ascending: true })
        .limit(10);
      
      if (queryError) {
        console.error('❌ Erro na consulta:', queryError);
        throw new Error(`Erro na consulta: ${queryError.message}`);
      }
      
      console.log('✅ Eventos encontrados:', data);
      setEventos(data || []);
      
    } catch (err) {
      console.error('❌ Erro geral:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  return { 
    eventos, 
    loading, 
    error,
    refetch: fetchEventos
  };
}; 