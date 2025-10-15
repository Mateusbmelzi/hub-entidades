import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEventosDebug = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const fetchEventos = async () => {
    try {
      console.log('🔍 DEBUG: Iniciando busca de eventos...');
      setLoading(true);
      setError(null);

      // Teste 1: Verificar se o cliente Supabase está funcionando
      console.log('🔍 DEBUG: Cliente Supabase:', supabase);
      console.log('🔍 DEBUG: URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔍 DEBUG: Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO CONFIGURADA');

      // Teste 2: Tentar buscar eventos simples
      console.log('🔍 DEBUG: Tentando buscar eventos...');
      const { data, error: eventosError, count } = await supabase
        .from('eventos')
        .select('*', { count: 'exact' });

      console.log('🔍 DEBUG: Resultado da busca:', { data, error: eventosError, count });

      if (eventosError) {
        console.error('❌ DEBUG: Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('✅ DEBUG: Eventos carregados com sucesso:', data?.length || 0);
      setEventos(data || []);

      // Teste 3: Verificar estrutura dos dados
      if (data && data.length > 0) {
        const primeiroEvento = data[0];
        console.log('🔍 DEBUG: Estrutura do primeiro evento:', primeiroEvento);
        console.log('🔍 DEBUG: Chaves disponíveis:', Object.keys(primeiroEvento));
        
        setDebugInfo({
          totalEventos: data.length,
          estrutura: Object.keys(primeiroEvento),
          primeiroEvento,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⚠️ DEBUG: Nenhum evento encontrado na tabela');
        setDebugInfo({
          totalEventos: 0,
          mensagem: 'Tabela vazia ou sem dados'
        });
      }

    } catch (err: any) {
      console.error('❌ DEBUG: Erro geral:', err);
      setError(err.message || 'Erro desconhecido');
      setDebugInfo({
        erro: err.message,
        tipo: err.constructor.name,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
      console.log('🏁 DEBUG: Busca finalizada');
    }
  };

  useEffect(() => {
    console.log('🚀 DEBUG: Hook useEventosDebug inicializado');
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    debugInfo,
    refetch: fetchEventos
  };
}; 