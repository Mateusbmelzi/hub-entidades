import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoPorArea {
  area_atuacao: string;
  total_eventos: number;
}

export const useEventosPorArea = () => {
  const [eventosPorArea, setEventosPorArea] = useState<EventoPorArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventosPorArea = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Buscando eventos por área de atuação...');

      // Buscar todos os eventos com suas áreas de atuação
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('area_atuacao, status_aprovacao')
        .eq('status_aprovacao', 'aprovado'); // Apenas eventos aprovados

      if (eventosError) {
        console.error('❌ Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('✅ Eventos carregados:', eventosData?.length || 0, 'eventos encontrados');

      // Processar os dados para contar eventos por área
      const areaCount: { [key: string]: number } = {};
      
      eventosData?.forEach(evento => {
        if (evento.area_atuacao && Array.isArray(evento.area_atuacao)) {
          evento.area_atuacao.forEach(area => {
            if (area && typeof area === 'string') {
              areaCount[area] = (areaCount[area] || 0) + 1;
            }
          });
        }
      });

      // Converter para array e ordenar por total
      const eventosPorAreaArray = Object.entries(areaCount)
        .map(([area, total]) => ({
          area_atuacao: area,
          total_eventos: total
        }))
        .sort((a, b) => b.total_eventos - a.total_eventos)
        .slice(0, 10); // Top 10 áreas

      setEventosPorArea(eventosPorAreaArray);
      console.log('📊 Eventos por área processados:', eventosPorAreaArray);

    } catch (err) {
      console.error('❌ Erro ao buscar eventos por área:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventosPorArea();
  }, []);

  const refetch = () => {
    fetchEventosPorArea();
  };

  return {
    eventosPorArea,
    loading,
    error,
    refetch
  };
};
