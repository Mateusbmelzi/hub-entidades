import { useState } from 'react';
import { SalaReservationData, SalaReservationFormState } from '@/types/sala-reservation';

export const useSalaReservation = () => {
  const [formState, setFormState] = useState<SalaReservationFormState>({
    currentStep: 1,
    data: {},
    errors: {},
    isLoading: false
  });

  const updateFormData = (field: keyof SalaReservationData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: '' // Limpar erro quando campo é atualizado
      }
    }));
  };

  const validateCurrentStep = (): boolean => {
    const { data } = formState;
    const errors: Record<string, string> = {};

    switch (formState.currentStep) {
      case 1: // Dados básicos
        if (!data.data) errors.data = 'Data é obrigatória';
        if (!data.horarioInicio) errors.horarioInicio = 'Horário de início é obrigatório';
        if (!data.horarioTermino) errors.horarioTermino = 'Horário de término é obrigatório';
        if (!data.quantidadePessoas || data.quantidadePessoas <= 0) {
          errors.quantidadePessoas = 'Quantidade de pessoas deve ser maior que zero';
        }
        if (!data.nomeCompletoSolicitante) {
          errors.nomeCompletoSolicitante = 'Nome completo é obrigatório';
        }
        if (!data.celularComDDD) {
          errors.celularComDDD = 'Celular com DDD é obrigatório';
        }
        break;

      case 2: // Detalhes do evento
        if (!data.motivoReserva) errors.motivoReserva = 'Motivo da reserva é obrigatório';
        if (!data.tituloEvento) errors.tituloEvento = 'Título do evento é obrigatório';
        if (!data.descricaoEvento) errors.descricaoEvento = 'Descrição do evento é obrigatória';
        break;

      case 3: // Campos condicionais
        if (data.temPalestranteExterno && data.palestranteExterno) {
          if (!data.palestranteExterno.nomeCompleto) {
            errors['palestranteExterno.nomeCompleto'] = 'Nome do palestrante é obrigatório';
          }
          if (!data.palestranteExterno.apresentacao) {
            errors['palestranteExterno.apresentacao'] = 'Apresentação do palestrante é obrigatória';
          }
        }
        if (data.necessidadeSalaPlana && !data.motivoSalaPlana) {
          errors.motivoSalaPlana = 'Motivo para sala plana é obrigatório';
        }
        break;
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && formState.currentStep < 4) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (formState.currentStep > 1) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const submitReservation = async (): Promise<{ success: boolean; message: string }> => {
    if (!validateCurrentStep()) {
      return { success: false, message: 'Por favor, corrija os erros no formulário' };
    }

    setFormState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Aqui você faria a chamada para a API real
      const response = await fetch('/api/sala-reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formState.data,
          entityId: 'current-entity-id', // Você pegaria isso do contexto de autenticação
          status: 'pending_approval',
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar reserva');
      }

      const result = await response.json();
      
      return { 
        success: true, 
        message: 'Reserva enviada com sucesso! Você receberá uma confirmação por email.' 
      };
      
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      return { 
        success: false, 
        message: 'Erro ao enviar reserva. Tente novamente.' 
      };
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetForm = () => {
    setFormState({
      currentStep: 1,
      data: {},
      errors: {},
      isLoading: false
    });
  };

  return {
    formState,
    updateFormData,
    validateCurrentStep,
    nextStep,
    prevStep,
    submitReservation,
    resetForm
  };
};
