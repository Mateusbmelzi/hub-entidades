import { useState } from 'react';
import { AuditorioReservationFormData } from '@/types/auditorio-reservation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';

const initialFormData: AuditorioReservationFormData = {
  date: '',
  startTime: '',
  endTime: '',
  attendees: 1,
  applicantName: '',
  applicantPhone: '',
  eventType: '',
  eventTitle: '',
  eventDescription: '',
  hasExternalSpeaker: false,
  needsSoundSystem: false,
  needsProjector: false,
  needsLighting: false,
  needsStageSetup: false,
  needsRecording: false,
  technicalSupportNeeded: false,
  roomConfiguration: '',
  needsCatering: false,
  needsSecurity: false,
  accessControlNeeded: false,
  needsSpecialCleaning: false,
  maintenanceRequired: false,
};

export const useAuditorioReservation = () => {
  const [formState, setFormState] = useState<{ data: AuditorioReservationFormData; errors: string[] }>({
    data: initialFormData,
    errors: [],
  });
  const { user } = useAuth();
  const { entity } = useAuthStateContext();

  const updateField = (field: keyof AuditorioReservationFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errors: prev.errors.filter(error => !error.includes(field)),
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    const { data } = formState;

    switch (step) {
      case 1:
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.startTime) errors.push('Horário de início é obrigatório');
        if (!data.endTime) errors.push('Horário de término é obrigatório');
        if (data.attendees < 1) errors.push('Número de pessoas deve ser pelo menos 1');
        if (!data.applicantName.trim()) errors.push('Nome do solicitante é obrigatório');
        if (!data.applicantPhone.trim()) errors.push('Telefone do solicitante é obrigatório');
        
        // Validar se horário de término é após horário de início
        if (data.startTime && data.endTime) {
          const start = new Date(`2000-01-01T${data.startTime}`);
          const end = new Date(`2000-01-01T${data.endTime}`);
          if (end <= start) {
            errors.push('Horário de término deve ser após o horário de início');
          }
        }
        break;

      case 2:
        if (!data.eventType) errors.push('Tipo de evento é obrigatório');
        if (!data.eventTitle.trim()) errors.push('Título do evento é obrigatório');
        if (!data.eventDescription.trim()) errors.push('Descrição do evento é obrigatória');
        break;

      case 3:
        // Validações condicionais
        if (data.hasExternalSpeaker) {
          if (!data.externalSpeakerName?.trim()) {
            errors.push('Nome do palestrante externo é obrigatório');
          }
          if (!data.externalSpeakerPresentation?.trim()) {
            errors.push('Apresentação do palestrante externo é obrigatória');
          }
        }
        
        if (data.needsRecording && !data.recordingReason?.trim()) {
          errors.push('Motivo da gravação é obrigatório');
        }
        
        if (data.technicalSupportNeeded && !data.technicalSupportDetails?.trim()) {
          errors.push('Detalhes do suporte técnico são obrigatórios');
        }
        
        if (!data.roomConfiguration) {
          errors.push('Configuração da sala é obrigatória');
        }
        
        if (data.roomConfiguration && data.roomConfiguration !== 'Teatro' && !data.roomConfigurationReason?.trim()) {
          errors.push('Motivo da configuração da sala é obrigatório');
        }
        
        if (data.needsCatering && !data.cateringDetails?.trim()) {
          errors.push('Detalhes da alimentação são obrigatórios');
        }
        
        if (data.needsSecurity && !data.securityDetails?.trim()) {
          errors.push('Detalhes da segurança são obrigatórios');
        }
        
        if (data.accessControlNeeded && !data.accessControlDetails?.trim()) {
          errors.push('Detalhes do controle de acesso são obrigatórios');
        }
        
        if (data.needsSpecialCleaning && !data.specialCleaningDetails?.trim()) {
          errors.push('Detalhes da limpeza especial são obrigatórios');
        }
        
        if (data.maintenanceRequired && !data.maintenanceDetails?.trim()) {
          errors.push('Detalhes da manutenção são obrigatórios');
        }
        break;
    }

    setFormState(prev => ({ ...prev, errors }));
    return errors.length === 0;
  };

  const submitReservation = async (): Promise<boolean> => {
    try {
      // Validar todos os passos
      const step1Valid = validateStep(1);
      const step2Valid = validateStep(2);
      const step3Valid = validateStep(3);

      if (!step1Valid || !step2Valid || !step3Valid) {
        toast.error('Por favor, corrija os erros antes de enviar');
        return false;
      }

      // Simular envio para o backend
      console.log('📋 Dados da reserva do auditório:', formState.data);
      console.log('👤 Usuário:', user?.email);
      console.log('🏢 Entidade:', entity?.name);

      // Aqui você integraria com a API real
      // const response = await supabase.from('auditorio_reservations').insert({
      //   ...formState.data,
      //   entity_id: entity?.id,
      //   student_id: user?.id,
      //   created_by: user?.id,
      // });

      toast.success('Reserva do auditório enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar reserva do auditório:', error);
      toast.error('Erro ao enviar reserva. Tente novamente.');
      return false;
    }
  };

  const resetForm = () => {
    setFormState({
      data: initialFormData,
      errors: [],
    });
  };

  return {
    formState,
    updateField,
    validateStep,
    submitReservation,
    resetForm,
  };
};
