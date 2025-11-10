import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResultadoValidacaoCapacidade {
  valido: boolean;
  capacidade: number;
  necessario: number;
  mensagem?: string;
}

export const useValidarCapacidadeSala = () => {
  const [loading, setLoading] = useState(false);

  const verificarCapacidade = async (
    salaId: number,
    quantidadePessoas: number
  ): Promise<ResultadoValidacaoCapacidade> => {
    try {
      setLoading(true);

      // Buscar informações da sala
      const { data: sala, error } = await supabase
        .from('salas')
        .select('capacidade')
        .eq('id', salaId)
        .single();

      if (error) throw error;

      if (!sala) {
        return {
          valido: false,
          capacidade: 0,
          necessario: quantidadePessoas,
          mensagem: 'Sala não encontrada',
        };
      }

      const capacidade = sala.capacidade || 0;
      const valido = capacidade >= quantidadePessoas;

      return {
        valido,
        capacidade,
        necessario: quantidadePessoas,
        mensagem: valido
          ? undefined
          : `A sala tem capacidade insuficiente. Capacidade: ${capacidade}, Necessário: ${quantidadePessoas}`,
      };
    } catch (err) {
      console.error('Erro ao verificar capacidade da sala:', err);
      return {
        valido: false,
        capacidade: 0,
        necessario: quantidadePessoas,
        mensagem: err instanceof Error ? err.message : 'Erro ao verificar capacidade',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    verificarCapacidade,
    loading,
  };
};

