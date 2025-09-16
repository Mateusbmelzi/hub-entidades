import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AlterarSalaReservaParams {
  reservaId: string;
  novaSalaId: number;
  motivo?: string;
}

export const useAlterarSalaReserva = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alterarSalaReserva = async ({ reservaId, novaSalaId, motivo }: AlterarSalaReservaParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando alteração de sala:', { reservaId, novaSalaId, motivo });

      // 1. Buscar a reserva atual
      const { data: reservaAtual, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

      if (reservaError) {
        console.error('❌ Erro ao buscar reserva:', reservaError);
        throw new Error('Erro ao buscar reserva: ' + reservaError.message);
      }

      console.log('📋 Reserva atual encontrada:', reservaAtual);

      // 2. Buscar a nova sala
      const { data: novaSala, error: salaError } = await supabase
        .from('salas')
        .select('*')
        .eq('id', novaSalaId)
        .single();

      if (salaError) {
        console.error('❌ Erro ao buscar nova sala:', salaError);
        throw new Error('Erro ao buscar nova sala: ' + salaError.message);
      }

      console.log('🏢 Nova sala encontrada:', novaSala);

      // 3. Verificar se a nova sala tem capacidade suficiente
      if (novaSala.capacidade < reservaAtual.quantidade_pessoas) {
        throw new Error(`A nova sala tem capacidade insuficiente. Capacidade: ${novaSala.capacidade}, Necessário: ${reservaAtual.quantidade_pessoas}`);
      }

      // 4. Verificar conflitos de horário na nova sala
      // Buscar todas as reservas aprovadas no mesmo horário e data
      const { data: reservasConflitantes, error: conflitoError } = await supabase
        .from('reservas')
        .select('id, data_reserva, horario_inicio, horario_termino, status, sala_id')
        .eq('data_reserva', reservaAtual.data_reserva)
        .eq('status', 'aprovada')
        .neq('id', reservaId);

      if (conflitoError) {
        console.warn('Erro ao verificar conflitos:', conflitoError.message);
        // Continuar mesmo com erro na verificação de conflitos
      } else if (reservasConflitantes && reservasConflitantes.length > 0) {
        // Verificar se alguma reserva conflitante está na mesma sala
        const conflitoNaSala = reservasConflitantes.find(reserva => {
          // Se a reserva tem sala_id, verificar se é a mesma sala
          if (reserva.sala_id && reserva.sala_id === novaSalaId) {
            const inicioAtual = new Date(`${reservaAtual.data_reserva}T${reservaAtual.horario_inicio}`);
            const fimAtual = new Date(`${reservaAtual.data_reserva}T${reservaAtual.horario_termino}`);
            const inicioConflito = new Date(`${reserva.data_reserva}T${reserva.horario_inicio}`);
            const fimConflito = new Date(`${reserva.data_reserva}T${reserva.horario_termino}`);

            // Verificar se há sobreposição de horários
            return (inicioAtual < fimConflito && fimAtual > inicioConflito);
          }
          return false;
        });

        if (conflitoNaSala) {
          throw new Error('A nova sala já possui uma reserva aprovada no mesmo horário');
        }
      }

      // 5. Desassociar sala atual (se existir)
      if (reservaAtual.sala_id) {
        console.log('🔄 Desassociando sala atual:', reservaAtual.sala_id);
        const { error: desassociarError } = await supabase
          .from('salas')
          .update({ reserva_id: null })
          .eq('reserva_id', reservaId);

        if (desassociarError) {
          console.warn('⚠️ Aviso: Erro ao desassociar sala atual:', desassociarError.message);
        } else {
          console.log('✅ Sala atual desassociada com sucesso');
        }
      }

      // 6. Associar nova sala à reserva
      console.log('🔄 Associando nova sala à reserva:', { novaSalaId, reservaId });
      const { error: associarError } = await supabase
        .from('salas')
        .update({ reserva_id: reservaId })
        .eq('id', novaSalaId);

      if (associarError) {
        console.error('❌ Erro ao associar nova sala:', associarError);
        throw new Error('Erro ao associar nova sala: ' + associarError.message);
      }

      console.log('✅ Nova sala associada com sucesso');

      // 7. Atualizar reserva com informações da nova sala
      // Primeiro, tentar atualizar apenas os campos básicos
      const updateData: any = {
        observacoes: motivo ? 
          `${reservaAtual.observacoes || ''}\n\n[SALA ALTERADA] ${new Date().toLocaleString('pt-BR')}: ${motivo}`.trim() :
          reservaAtual.observacoes
      };

      // Tentar adicionar campos de sala (funcionará após executar o script SQL)
      try {
        // Verificar se as colunas existem tentando uma consulta simples
        const { error: testError } = await supabase
          .from('reservas')
          .select('sala_id')
          .limit(1);

        if (!testError) {
          // Se a consulta funcionou, as colunas existem
          updateData.sala_id = novaSalaId;
          updateData.sala_nome = novaSala.sala;
          updateData.sala_predio = novaSala.predio;
          updateData.sala_andar = novaSala.andar;
          updateData.sala_capacidade = novaSala.capacidade;
        } else {
          console.warn('Campos de sala não existem na tabela reservas. Execute o script SQL add-sala-columns-simple.sql');
        }
      } catch (err) {
        console.warn('Campos de sala não existem na tabela reservas. Execute o script SQL add-sala-columns-simple.sql');
      }

      console.log('🔄 Atualizando reserva com dados:', updateData);
      const { error: atualizarReservaError } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservaId);

      if (atualizarReservaError) {
        console.error('❌ Erro ao atualizar reserva:', atualizarReservaError);
        throw new Error('Erro ao atualizar reserva: ' + atualizarReservaError.message);
      }

      console.log('✅ Reserva atualizada com sucesso');

      // 8. Atualizar evento relacionado (se existir)
      if (reservaAtual.evento_id) {
        console.log('🔄 Atualizando evento relacionado:', reservaAtual.evento_id);
        
        const eventoUpdateData = {
          sala_id: novaSalaId,
          sala_nome: novaSala.sala,
          sala_predio: novaSala.predio,
          sala_andar: novaSala.andar,
          sala_capacidade: novaSala.capacidade,
          local: `${novaSala.sala} - ${novaSala.predio} (${novaSala.andar})`
        };

        const { error: eventoError } = await supabase
          .from('eventos')
          .update(eventoUpdateData)
          .eq('id', reservaAtual.evento_id);

        if (eventoError) {
          console.error('❌ Erro ao atualizar evento:', eventoError);
          // Não falhar a operação por causa do evento, apenas avisar
          console.warn('⚠️ Aviso: Evento não foi atualizado, mas a reserva foi alterada com sucesso');
        } else {
          console.log('✅ Evento atualizado com sucesso');
        }
      } else {
        console.log('ℹ️ Nenhum evento relacionado encontrado');
      }

      console.log('✅ Sala alterada com sucesso:', {
        reservaId,
        novaSalaId,
        novaSala: {
          id: novaSala.id,
          nome: novaSala.sala,
          predio: novaSala.predio,
          andar: novaSala.andar,
          capacidade: novaSala.capacidade
        }
      });

      return {
        success: true,
        message: 'Sala alterada com sucesso',
        novaSala: {
          id: novaSala.id,
          nome: novaSala.sala,
          predio: novaSala.predio,
          andar: novaSala.andar,
          capacidade: novaSala.capacidade
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao alterar sala';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    alterarSalaReserva,
    loading,
    error
  };
};
