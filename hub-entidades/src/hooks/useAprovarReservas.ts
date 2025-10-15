import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthState } from './useAuthState';
import { useNotificationSystem } from './useNotificationSystem';

export const useAprovarReservas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { type, user, isAuthenticated } = useAuthState();
  const { notifyReservationStatusChange } = useNotificationSystem();

  const aprovarReserva = async (reservaId: string, comentario?: string, local?: string, salaId?: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se está autenticado como Super Admin
      if (!isAuthenticated || type !== 'superAdmin' || !user?.email) {
        throw new Error('Apenas Super Admins podem aprovar reservas. Faça login como Super Admin primeiro.');
      }

      // Chamar a função de aprovação
      console.log('🔍 Chamando aprovar_reserva com:', {
        p_reserva_id: reservaId,
        p_aprovador_email: user.email,
        p_comentario: comentario || 'Reserva aprovada',
        p_local: local
      });

      // Aprovar reserva diretamente via queries SQL
      console.log('🔍 Aprovando reserva via queries diretas...');
      
      // 1. Atualizar status da reserva
      const { error: updateReservaError } = await supabase
        .from('reservas')
        .update({
          status: 'aprovada',
          comentario_aprovacao: comentario || 'Reserva aprovada',
          data_aprovacao: new Date().toISOString(),
          aprovador_email: user.email
        })
        .eq('id', reservaId);

      if (updateReservaError) {
        console.error('❌ Erro ao atualizar reserva:', updateReservaError);
        throw updateReservaError;
      }

      // 2. Buscar dados da reserva para criar evento
      const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

      if (reservaError) {
        console.error('❌ Erro ao buscar dados da reserva:', reservaError);
        throw reservaError;
      }

      // 3. Criar evento baseado na reserva
      const eventoData = {
        nome: reservaData.nome_evento || `Evento - ${reservaData.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala'}`,
        descricao: reservaData.descricao_evento || `Evento aprovado para ${reservaData.tipo_reserva}`,
        local: local || (reservaData.tipo_reserva === 'auditorio' ? 'Auditório Steffi e Max Perlaman' : 'A definir'),
        data: reservaData.data_reserva,
        horario_inicio: reservaData.horario_inicio,
        horario_termino: reservaData.horario_termino,
        capacidade: reservaData.quantidade_pessoas,
        status: 'aprovado',
        status_aprovacao: 'aprovado',
        comentario_aprovacao: comentario || 'Reserva aprovada',
        data_aprovacao: new Date().toISOString(),
        aprovador_email: user.email,
        entidade_id: reservaData.entidade_id,
        sala_id: salaId || reservaData.sala_id,
        link_evento: '' // Campo obrigatório, mas vazio
      };

      console.log('🔍 Dados do evento a serem inseridos:', eventoData);
      
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .insert(eventoData)
        .select()
        .single();

      if (eventoError) {
        console.error('❌ Erro ao criar evento:', eventoError);
        console.error('❌ Dados que causaram erro:', eventoData);
        
        // Reverter a aprovação da reserva se o evento não foi criado
        console.log('🔄 Revertendo aprovação da reserva...');
        const { error: rollbackError } = await supabase
          .from('reservas')
          .update({
            status: 'pendente',
            comentario_aprovacao: null,
            data_aprovacao: null,
            aprovador_email: null
          })
          .eq('id', reservaId);
        
        if (rollbackError) {
          console.error('❌ Erro ao reverter reserva:', rollbackError);
        } else {
          console.log('✅ Reserva revertida para pendente');
        }
        
        throw eventoError;
      }

      console.log('✅ Evento criado com sucesso:', evento);

      // 4. Atualizar reserva com ID do evento
      const { error: updateEventoIdError } = await supabase
        .from('reservas')
        .update({ evento_id: evento.id })
        .eq('id', reservaId);

      if (updateEventoIdError) {
        console.error('❌ Erro ao atualizar reserva com ID do evento:', updateEventoIdError);
        throw updateEventoIdError;
      }

      const data = {
        success: true,
        evento_id: evento.id,
        message: 'Reserva aprovada e evento criado com sucesso'
      };
      const error = null;

      console.log('🔍 Resposta da função aprovar_reserva:', { data, error });

      if (error) {
        console.error('❌ Erro na função aprovar_reserva:', error);
        throw error;
      }

      // Verificar se a função retornou sucesso
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          console.log('✅ Reserva aprovada com sucesso:', data);
          
          // Buscar email do solicitante para enviar notificação
          try {
            console.log('🔍 Buscando dados da reserva para notificação:', reservaId);
            
            const { data: reservaData, error: reservaError } = await supabase
              .from('reservas')
              .select('tipo_reserva, profile_id, nome_solicitante, telefone_solicitante')
              .eq('id', reservaId)
              .single();

            // Usar nome do solicitante da reserva
            let solicitanteEmail = null;
            let solicitanteNome = null;
            
            if (!reservaError && reservaData) {
              solicitanteNome = reservaData.nome_solicitante;
              console.log('📊 Dados da reserva encontrados:', {
                reservaData,
                reservaError,
                nomeSolicitante: reservaData.nome_solicitante,
                telefoneSolicitante: reservaData.telefone_solicitante
              });
              
              // Tentar buscar email do profile como fallback
              if (reservaData.profile_id) {
                console.log('🔍 Tentando buscar email do profile:', reservaData.profile_id);
                
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('email')
                  .eq('id', reservaData.profile_id)
                  .single();
                
                if (!profileError && profileData?.email) {
                  solicitanteEmail = profileData.email;
                  console.log('✅ Email encontrado no profile:', solicitanteEmail);
                } else {
                  console.log('⚠️ Email não encontrado no profile, usando nome do solicitante');
                }
              }
            } else {
              console.warn('⚠️ Reserva não encontrada:', { reservaError });
            }

            console.log('📊 Dados da reserva encontrados:', {
              reservaData,
              reservaError,
              profileId: reservaData?.profile_id,
              solicitanteEmail,
              solicitanteNome
            });

            if (reservaError) {
              console.error('❌ Erro ao buscar dados da reserva:', reservaError);
            } else {
              console.log('📧 Email do solicitante encontrado:', solicitanteEmail);
              console.log('👤 Nome do solicitante encontrado:', solicitanteNome);
              
              if (solicitanteEmail) {
                console.log('📤 Enviando notificação para (email):', solicitanteEmail);
                const notifResult = await notifyReservationStatusChange(
                  solicitanteEmail,
                  reservaData?.tipo_reserva || 'sala',
                  'aprovada',
                  reservaId,
                  comentario
                );
                console.log('✅ Resultado da notificação:', notifResult);
              } else if (solicitanteNome) {
                console.log('📤 Enviando notificação para (nome):', solicitanteNome);
                const notifResult = await notifyReservationStatusChange(
                  solicitanteNome,
                  reservaData?.tipo_reserva || 'sala',
                  'aprovada',
                  reservaId,
                  comentario
                );
                console.log('✅ Resultado da notificação:', notifResult);
              } else {
                console.warn('⚠️ Nem email nem nome do solicitante encontrados');
              }
            }
          } catch (notifError) {
            console.error('❌ Erro ao enviar notificação:', notifError);
          }
          
          // Se uma sala foi selecionada, associar à reserva e buscar informações da sala
          if (salaId) {
            // Buscar informações da sala
            const { data: salaData, error: salaFetchError } = await supabase
              .from('salas')
              .select('*')
              .eq('id', salaId)
              .single();
            
            if (salaFetchError) {
              console.error('❌ Erro ao buscar dados da sala:', salaFetchError);
              toast.warning('Reserva aprovada, mas houve erro ao buscar dados da sala.');
            } else {
              // Associar sala à reserva
              const { error: salaError } = await supabase
                .from('salas')
                .update({ reserva_id: reservaId })
                .eq('id', salaId);
              
              if (salaError) {
                console.error('❌ Erro ao associar sala à reserva:', salaError);
                toast.warning('Reserva aprovada, mas houve erro ao associar a sala.');
              } else {
                console.log('✅ Sala associada à reserva com sucesso');
                
                // Atualizar o evento com as informações da sala
                const { error: eventoError } = await supabase
                  .from('eventos')
                  .update({
                    sala_id: salaId,
                    sala_nome: salaData.sala,
                    sala_predio: salaData.predio,
                    sala_andar: salaData.andar,
                    sala_capacidade: salaData.capacidade,
                    local: `${salaData.sala} - ${salaData.predio} (${salaData.andar})`
                  })
                  .eq('id', data.evento_id || reservaId); // Assumindo que o evento é criado com o mesmo ID da reserva
                
                if (eventoError) {
                  console.error('❌ Erro ao atualizar evento com dados da sala:', eventoError);
                  toast.warning('Sala associada, mas houve erro ao atualizar o evento.');
                } else {
                  console.log('✅ Evento atualizado com dados da sala');
                }
              }
            }
          }
          
          toast.success('Reserva aprovada com sucesso! Evento criado automaticamente.');
          return true;
        } else {
          console.error('❌ Função retornou erro:', data.error);
          throw new Error(data.error || 'Erro ao aprovar reserva');
        }
      } else {
        console.log('⚠️ Resposta inesperada da função:', data);
        
        // Se uma sala foi selecionada, associar à reserva e buscar informações da sala
        if (salaId) {
          // Buscar informações da sala
          const { data: salaData, error: salaFetchError } = await supabase
            .from('salas')
            .select('*')
            .eq('id', salaId)
            .single();
          
          if (salaFetchError) {
            console.error('❌ Erro ao buscar dados da sala:', salaFetchError);
            toast.warning('Reserva aprovada, mas houve erro ao buscar dados da sala.');
          } else {
            // Associar sala à reserva
            const { error: salaError } = await supabase
              .from('salas')
              .update({ reserva_id: reservaId })
              .eq('id', salaId);
            
            if (salaError) {
              console.error('❌ Erro ao associar sala à reserva:', salaError);
              toast.warning('Reserva aprovada, mas houve erro ao associar a sala.');
            } else {
              console.log('✅ Sala associada à reserva com sucesso');
              
              // Atualizar o evento com as informações da sala
              const { error: eventoError } = await supabase
                .from('eventos')
                .update({
                  sala_id: salaId,
                  sala_nome: salaData.sala,
                  sala_predio: salaData.predio,
                  sala_andar: salaData.andar,
                  sala_capacidade: salaData.capacidade,
                  local: `${salaData.sala} - ${salaData.predio} (${salaData.andar})`
                })
                .eq('id', data.evento_id || reservaId); // Assumindo que o evento é criado com o mesmo ID da reserva
              
              if (eventoError) {
                console.error('❌ Erro ao atualizar evento com dados da sala:', eventoError);
                toast.warning('Sala associada, mas houve erro ao atualizar o evento.');
              } else {
                console.log('✅ Evento atualizado com dados da sala');
              }
            }
          }
        }
        
        toast.success('Reserva aprovada com sucesso! Evento criado automaticamente.');
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejeitarReserva = async (reservaId: string, comentario: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se está autenticado como Super Admin
      if (!isAuthenticated || type !== 'superAdmin' || !user?.email) {
        throw new Error('Apenas Super Admins podem rejeitar reservas. Faça login como Super Admin primeiro.');
      }

      // Rejeitar reserva diretamente via query SQL
      const { error } = await supabase
        .from('reservas')
        .update({
          status: 'rejeitada',
          comentario_aprovacao: comentario,
          data_aprovacao: new Date().toISOString(),
          aprovador_email: user.email
        })
        .eq('id', reservaId);

      const data = { success: true };

      if (error) throw error;

      // Buscar email do solicitante para enviar notificação
      try {
        const { data: reservaData, error: reservaError } = await supabase
          .from('reservas')
          .select('tipo_reserva, profile_id, nome_solicitante, telefone_solicitante')
          .eq('id', reservaId)
          .single();

        // Usar nome do solicitante da reserva
        let solicitanteEmail = null;
        let solicitanteNome = null;
        
        if (!reservaError && reservaData) {
          solicitanteNome = reservaData.nome_solicitante;
          
          // Tentar buscar email do profile como fallback
          if (reservaData.profile_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', reservaData.profile_id)
              .single();
            
            if (!profileError && profileData?.email) {
              solicitanteEmail = profileData.email;
            }
          }
        }
        
        if (solicitanteEmail) {
          await notifyReservationStatusChange(
            solicitanteEmail,
            reservaData?.tipo_reserva || 'sala',
            'rejeitada',
            reservaId,
            comentario
          );
        } else if (solicitanteNome) {
          await notifyReservationStatusChange(
            solicitanteNome,
            reservaData?.tipo_reserva || 'sala',
            'rejeitada',
            reservaId,
            comentario
          );
        }
      } catch (notifError) {
        console.error('❌ Erro ao enviar notificação:', notifError);
      }

      toast.success('Reserva rejeitada.');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao rejeitar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (reservaId: string, motivo?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Cancelar reserva diretamente via query SQL
      const { error } = await supabase
        .from('reservas')
        .update({
          status: 'cancelada',
          comentario_aprovacao: motivo || 'Cancelada pelo usuário',
          data_aprovacao: new Date().toISOString()
        })
        .eq('id', reservaId);

      const data = { success: true };

      if (error) throw error;

      toast.success('Reserva cancelada.');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    aprovarReserva,
    rejeitarReserva,
    cancelarReserva,
    loading,
    error
  };
};
