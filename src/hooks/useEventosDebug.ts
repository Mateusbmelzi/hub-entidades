import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEventosDebug = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando busca de eventos...');
      
      // Teste 1: Buscar todos os eventos
      console.log('📋 Teste 1: Buscando todos os eventos');
      const { data: todosEventos, error: error1 } = await supabase
        .from('eventos')
        .select('*')
        .limit(5);
      
      if (error1) {
        console.error('❌ Erro ao buscar todos os eventos:', error1);
        throw new Error(`Erro ao buscar todos os eventos: ${error1.message}`);
      }
      
      console.log('✅ Todos os eventos encontrados:', todosEventos);
      
      // Teste 2: Buscar eventos aprovados
      console.log('📋 Teste 2: Buscando eventos aprovados');
      const { data: eventosAprovados, error: error2 } = await supabase
        .from('eventos')
        .select('*')
        .eq('status_aprovacao', 'aprovado')
        .limit(5);
      
      if (error2) {
        console.error('❌ Erro ao buscar eventos aprovados:', error2);
        throw new Error(`Erro ao buscar eventos aprovados: ${error2.message}`);
      }
      
      console.log('✅ Eventos aprovados encontrados:', eventosAprovados);
      
      // Teste 3: Buscar eventos com JOIN
      console.log('📋 Teste 3: Buscando eventos com JOIN');
      const { data: eventosComEntidades, error: error3 } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome)
        `)
        .eq('status_aprovacao', 'aprovado')
        .order('data_evento', { ascending: true })
        .limit(8);
      
      if (error3) {
        console.error('❌ Erro ao buscar eventos com JOIN:', error3);
        throw new Error(`Erro ao buscar eventos com JOIN: ${error3.message}`);
      }
      
      console.log('✅ Eventos com entidades encontrados:', eventosComEntidades);
      
      // Usar os dados do teste 3
      setEventos(eventosComEntidades || []);
      
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