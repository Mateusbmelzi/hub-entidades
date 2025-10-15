import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndicadorProfile {
  id: number;
  tipo: string;
  categoria: string;
  valor: number;
  descricao: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface IndicadoresProfilesData {
  total_usuarios: number;
  perfis_completos: number;
  taxa_completude: number;
  distribuicao_curso: IndicadorProfile[];
  distribuicao_semestre: IndicadorProfile[];
  areas_interesse: IndicadorProfile[];
  faixas_etarias: IndicadorProfile[];
}

export const useIndicadoresProfiles = () => {
  const [data, setData] = useState<IndicadoresProfilesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: indicadores, error: supabaseError } = await supabase
        .from('indicadores_profiles')
        .select('*')
        .order('valor', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (indicadores) {
        // Organizar dados por tipo
        const organizados: IndicadoresProfilesData = {
          total_usuarios: 0,
          perfis_completos: 0,
          taxa_completude: 0,
          distribuicao_curso: [],
          distribuicao_semestre: [],
          areas_interesse: [],
          faixas_etarias: []
        };

        indicadores.forEach(indicador => {
          switch (indicador.tipo) {
            case 'total_usuarios':
              organizados.total_usuarios = indicador.valor;
              break;
            case 'perfis_completos':
              organizados.perfis_completos = indicador.valor;
              break;
            case 'taxa_completude':
              organizados.taxa_completude = indicador.valor;
              break;
            case 'distribuicao_curso':
              organizados.distribuicao_curso.push(indicador);
              break;
            case 'distribuicao_semestre':
              organizados.distribuicao_semestre.push(indicador);
              break;
            case 'area_interesse':
              organizados.areas_interesse.push(indicador);
              break;
            case 'faixa_etaria':
              organizados.faixas_etarias.push(indicador);
              break;
          }
        });

        // Ordenar distribuições por valor
        organizados.distribuicao_curso.sort((a, b) => b.valor - a.valor);
        organizados.distribuicao_semestre.sort((a, b) => a.metadata?.semestre - b.metadata?.semestre);
        organizados.areas_interesse.sort((a, b) => b.valor - a.valor);
        organizados.faixas_etarias.sort((a, b) => {
          const faixaA = a.metadata?.faixa_etaria;
          const faixaB = b.metadata?.faixa_etaria;
          const ordem = ['18-20', '21-25', '26-30', '31-35', '36+'];
          return ordem.indexOf(faixaA) - ordem.indexOf(faixaB);
        });

        setData(organizados);
      }
    } catch (err) {
      console.error('Erro ao buscar indicadores de profiles:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicadores();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchIndicadores
  };
};
