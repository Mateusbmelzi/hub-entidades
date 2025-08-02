import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InscricaoEventoData {
  nome_participante: string;
  email?: string;
  telefone?: string;
}

export const useInscricaoEvento = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const checkInscricaoExistente = async (eventoId: string, email: string) => {
    const { data, error } = await supabase
      .from('participantes_evento')
      .select('id')
      .eq('evento_id', eventoId)
      .eq('email', email)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0;
  };

  const inscreverEvento = async (eventoId: string, dadosInscricao: InscricaoEventoData) => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando inscrição no evento:', eventoId);
      console.log('📝 Dados da inscrição:', dadosInscricao);
      
      // Verificar se o usuário já está inscrito
      if (dadosInscricao.email) {
        const jaInscrito = await checkInscricaoExistente(eventoId, dadosInscricao.email);
        if (jaInscrito) {
          toast.error("Você já está inscrito neste evento.");
          return { success: false, error: 'Já inscrito' };
        }
      }

      // Verificar se o evento tem capacidade disponível
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('capacidade')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;

      if (evento?.capacidade) {
        const { data: participantes, error: participantesError } = await supabase
          .from('participantes_evento')
          .select('id')
          .eq('evento_id', eventoId);

        if (participantesError) throw participantesError;

        if (participantes.length >= evento.capacidade) {
          toast.error("Este evento já atingiu sua capacidade máxima.");
          return { success: false, error: 'Evento lotado' };
        }
      }

      // Dados para inserção
      const dadosParaInserir = {
        evento_id: eventoId,
        nome_participante: dadosInscricao.nome_participante,
        email: dadosInscricao.email,
        telefone: dadosInscricao.telefone,
        status_participacao: 'confirmado'
      };

      console.log('💾 Dados para inserção:', dadosParaInserir);

      // Realizar a inscrição
      const { data: resultadoInserir, error } = await supabase
        .from('participantes_evento')
        .insert(dadosParaInserir)
        .select();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }

      console.log('✅ Inscrição realizada com sucesso:', resultadoInserir);

      toast.success("Você foi inscrito no evento com sucesso!");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao se inscrever no evento';
      console.error('❌ Erro geral na inscrição:', error);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { inscreverEvento, checkInscricaoExistente, loading, user, profile };
};