import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InscricaoEventoData {
  nome_participante: string;
  email?: string;
  telefone?: string;
  link_inscricao?: string;
  curso?: string;
  semestre?: number;
  campos_adicionais?: Record<string, any>;
}

export const useInscricaoEvento = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const checkInscricaoExistente = async (eventoId: string, email: string) => {
    const { data, error } = await supabase
      .from('inscricoes_eventos')
      .select('id')
      .eq('evento_id', eventoId)
      .eq('email', email)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0;
  };

  const verificarVagasDisponiveis = async (eventoId: string) => {
    // Buscar configuração do formulário
    const { data: formulario, error: formError } = await supabase
      .from('formularios_inscricao')
      .select('limite_vagas, aceita_lista_espera')
      .eq('evento_id', eventoId)
      .eq('ativo', true)
      .single();

    if (formError || !formulario) {
      return { temVagas: true, aceitaListaEspera: false };
    }

    // Se não há limite, sempre tem vagas
    if (!formulario.limite_vagas) {
      return { temVagas: true, aceitaListaEspera: formulario.aceita_lista_espera };
    }

    // Contar inscritos confirmados
    const { data: inscritos, error: inscritosError } = await supabase
      .from('inscricoes_eventos')
      .select('id')
      .eq('evento_id', eventoId)
      .eq('status', 'confirmado');

    if (inscritosError) {
      throw inscritosError;
    }

    const vagasOcupadas = inscritos?.length || 0;
    const temVagas = vagasOcupadas < formulario.limite_vagas;

    return { 
      temVagas, 
      aceitaListaEspera: formulario.aceita_lista_espera,
      vagasRestantes: formulario.limite_vagas - vagasOcupadas
    };
  };

  const inscreverEvento = async (eventoId: string, dadosInscricao: InscricaoEventoData) => {
    try {
      setLoading(true);

      // Verificar se já existe inscrição
      if (dadosInscricao.email) {
        const jaInscrito = await checkInscricaoExistente(eventoId, dadosInscricao.email);
        if (jaInscrito) {
          toast.error('Você já está inscrito neste evento!');
          return { success: false, error: 'Já inscrito' };
        }
      }

      // Verificar vagas disponíveis
      const { temVagas, aceitaListaEspera } = await verificarVagasDisponiveis(eventoId);
      
      if (!temVagas && !aceitaListaEspera) {
        toast.error('Vagas esgotadas para este evento!');
        return { success: false, error: 'Vagas esgotadas' };
      }

      // Determinar status da inscrição
      const status = temVagas ? 'confirmado' : 'lista_espera';

      // Dados para inserção
      const dadosParaInserir = {
        evento_id: eventoId,
        profile_id: user?.id || null,
        nome_completo: dadosInscricao.nome_participante,
        email: dadosInscricao.email || '',
        curso: dadosInscricao.curso || null,
        semestre: dadosInscricao.semestre || null,
        campos_adicionais: dadosInscricao.campos_adicionais || {},
        status: status
      };

      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .insert(dadosParaInserir)
        .select()
        .single();

      if (error) throw error;

      // O trigger do banco já atualiza total_inscritos automaticamente

      if (status === 'confirmado') {
        toast.success('Inscrição realizada com sucesso!');
      } else {
        toast.success('Você foi adicionado à lista de espera!');
      }

      return { success: true, data, status };
    } catch (error) {
      console.error('Erro ao inscrever no evento:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    inscreverEvento,
    loading,
    user,
    profile
  };
};