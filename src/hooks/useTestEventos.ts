import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTestEventos = () => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testarConexao = async () => {
    try {
      console.log('🧪 Testando conexão com Supabase...');
      setLoading(true);
      setError(null);

      // Teste 1: Verificar se a tabela eventos existe
      console.log('📋 Teste 1: Verificando estrutura da tabela eventos...');
      const { data: estruturaData, error: estruturaError } = await supabase
        .from('eventos')
        .select('*')
        .limit(1);

      if (estruturaError) {
        console.error('❌ Erro na estrutura da tabela:', estruturaError);
        throw new Error(`Problema na tabela eventos: ${estruturaError.message}`);
      }

      console.log('✅ Tabela eventos acessível');

      // Teste 2: Contar total de eventos
      console.log('🔢 Teste 2: Contando total de eventos...');
      const { count: totalEventos, error: countError } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Erro ao contar eventos:', countError);
        throw new Error(`Erro ao contar eventos: ${countError.message}`);
      }

      console.log('✅ Total de eventos:', totalEventos);

      // Teste 3: Buscar alguns eventos com detalhes
      console.log('🔍 Teste 3: Buscando eventos com detalhes...');
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          id,
          nome,
          status_aprovacao,
          data_evento,
          created_at,
          entidades(nome)
        `)
        .limit(10);

      if (eventosError) {
        console.error('❌ Erro ao buscar eventos:', eventosError);
        throw new Error(`Erro ao buscar eventos: ${eventosError.message}`);
      }

      console.log('✅ Eventos carregados:', eventosData?.length || 0);
      console.log('📊 Exemplo de evento:', eventosData?.[0]);

      // Teste 4: Verificar status de aprovação
      console.log('📊 Teste 4: Verificando status de aprovação...');
      const { data: statusData, error: statusError } = await supabase
        .from('eventos')
        .select('status_aprovacao');

      if (statusError) {
        console.error('❌ Erro ao verificar status:', statusError);
      } else {
        const statusCounts = statusData?.reduce((acc: any, item) => {
          acc[item.status_aprovacao] = (acc[item.status_aprovacao] || 0) + 1;
          return acc;
        }, {});
        
        console.log('✅ Distribuição de status:', statusCounts);
      }

      setEventos(eventosData || []);
      console.log('🎉 Todos os testes passaram!');

    } catch (err: any) {
      console.error('❌ Erro nos testes:', err);
      setError(err.message || 'Erro desconhecido nos testes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testarConexao();
  }, []);

  return {
    eventos,
    loading,
    error,
    refetch: testarConexao
  };
};
