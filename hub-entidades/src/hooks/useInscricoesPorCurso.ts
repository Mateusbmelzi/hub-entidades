import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InscricaoPorCurso {
  curso: string;
  total_inscricoes: number;
}

export const useInscricoesPorCurso = () => {
  const [inscricoesPorCurso, setInscricoesPorCurso] = useState<InscricaoPorCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInscricoesPorCurso = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Iniciando busca de inscrições por curso usando NOME...');

      // Primeiro, buscar todas as inscrições em eventos
      const { data: inscricoes, error: inscricoesError } = await supabase
        .from('participantes_evento')
        .select('nome_participante')
        .not('nome_participante', 'is', null);

      if (inscricoesError) {
        throw inscricoesError;
      }

      console.log('📊 Inscrições encontradas:', inscricoes?.length || 0);
      console.log('👤 Primeiros 5 nomes:', inscricoes?.slice(0, 5));

      if (inscricoes && inscricoes.length > 0) {
        // Buscar perfis dos participantes através do nome
        const nomes = inscricoes.map(item => item.nome_participante).filter(Boolean);
        console.log('👤 Nomes únicos encontrados:', nomes.length);
        console.log('👤 Primeiros 5 nomes:', nomes.slice(0, 5));
        
        // Buscar perfis que correspondem aos nomes das inscrições
        const { data: perfis, error: perfisError } = await supabase
          .from('profiles')
          .select('nome, curso')
          .in('nome', nomes)
          .not('curso', 'is', null);

        if (perfisError) {
          console.log('❌ Erro ao buscar perfis:', perfisError);
          throw perfisError;
        }

        console.log('👤 Perfis encontrados:', perfis?.length || 0);
        console.log('👤 Primeiros 5 perfis:', perfis?.slice(0, 5));

        // Criar um mapa de nome para curso
        const nomeParaCurso = new Map();
        perfis?.forEach(perfil => {
          if (perfil.nome && perfil.curso) {
            nomeParaCurso.set(perfil.nome, perfil.curso);
          }
        });

        console.log('🗺️ Mapa nome → curso criado:', nomeParaCurso.size, 'entradas');
        console.log('🗺️ Primeiras 5 entradas do mapa:', Array.from(nomeParaCurso.entries()).slice(0, 5));

        // Processar os dados para agrupar por curso
        const cursoCounts: { [key: string]: number } = {};
        
        inscricoes.forEach((inscricao) => {
          const curso = nomeParaCurso.get(inscricao.nome_participante);
          if (curso) {
            cursoCounts[curso] = (cursoCounts[curso] || 0) + 1;
          }
        });

        console.log('📚 Contagem por curso:', cursoCounts);
        console.log('📚 Total de cursos encontrados:', Object.keys(cursoCounts).length);

        // Converter para array e ordenar por total (decrescente)
        const processedData = Object.entries(cursoCounts)
          .map(([curso, total_inscricoes]) => ({
            curso,
            total_inscricoes
          }))
          .sort((a, b) => b.total_inscricoes - a.total_inscricoes);

        console.log('✅ Dados processados:', processedData);
        setInscricoesPorCurso(processedData);
      } else {
        console.log('⚠️ Nenhuma inscrição encontrada na tabela participantes_evento');
        setInscricoesPorCurso([]);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar inscrições por curso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscricoesPorCurso();
  }, []);

  const refetch = () => {
    fetchInscricoesPorCurso();
  };

  return {
    inscricoesPorCurso,
    loading,
    error,
    refetch
  };
};
