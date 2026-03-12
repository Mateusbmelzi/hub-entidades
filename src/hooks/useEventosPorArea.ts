import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isEventoPublicamenteVisivel } from '@/lib/evento-visibility';

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

      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select(`area_atuacao, status_aprovacao, reserva_id, reservas!left(id, status_reserva)`)
        .eq('status_aprovacao', 'aprovado')
        .neq('status', 'cancelado');

      if (eventosError) throw eventosError;

      const normalized = (eventosData || []).map((row) => ({
        ...row,
        reservas: Array.isArray(row.reservas) ? row.reservas : row.reservas ? [row.reservas] : [],
      }));
      const visibleEventos = normalized.filter((row) => {
        try {
          return isEventoPublicamenteVisivel(row);
        } catch {
          return false;
        }
      });

      const areaCount: { [key: string]: number } = {};
      
      visibleEventos.forEach(evento => {
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

    } catch (err) {
      console.error('useEventosPorArea:', err);
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
