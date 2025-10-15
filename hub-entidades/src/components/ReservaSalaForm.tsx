import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Users, User, Phone, FileText, CheckCircle } from 'lucide-react';
import { SalaReservationData, SalaReservationFormState, SALA_EVENT_OPTIONS } from '@/types/sala-reservation';

const TOTAL_STEPS = 4;

export const ReservaSalaForm: React.FC = () => {
  const navigate = useNavigate();
  const { id: entidadeId } = useParams<{ id: string }>();
  
  const [formState, setFormState] = useState<SalaReservationFormState>({
    currentStep: 1,
    data: {},
    errors: {},
    isLoading: false
  });

  // Função para formatar celular automaticamente
  const formatPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const updateFormData = (field: keyof SalaReservationData, value: any) => {
    // Formatação especial para celular
    if (field === 'celularComDDD' && typeof value === 'string') {
      value = formatPhone(value);
    }

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

  // Funções de validação específicas
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const validateName = (name: string): boolean => {
    // Nome deve ter pelo menos 2 palavras e cada palavra pelo menos 2 caracteres
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2 && words.every(word => word.length >= 2);
  };

  const validateDate = (date: string): boolean => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    
    // Definir data máxima: 31 dias, 12 meses e ano 2050
    maxDate.setFullYear(2050, 11, 31); // 31 de dezembro de 2050
    
    today.setHours(0, 0, 0, 0); // Zerar horário para comparar apenas a data
    maxDate.setHours(23, 59, 59, 999); // Final do dia máximo
    
    return selectedDate >= today && selectedDate <= maxDate;
  };

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return start < end;
  };

  const validateCurrentStep = (): boolean => {
    const { data } = formState;
    const errors: Record<string, string> = {};

    switch (formState.currentStep) {
      case 1: // Dados básicos
        // Validação de data
        if (!data.data) {
          errors.data = 'Data é obrigatória';
        } else if (!validateDate(data.data)) {
          const selectedDate = new Date(data.data);
          const today = new Date();
          const maxDate = new Date(2050, 11, 31); // 31 de dezembro de 2050
          
          if (selectedDate < today) {
            errors.data = 'A data não pode ser no passado';
          } else if (selectedDate > maxDate) {
            errors.data = 'A data não pode ser posterior a 31 de dezembro de 2050';
          } else {
            errors.data = 'Data inválida';
          }
        }

        // Validação de horários
        if (!data.horarioInicio) {
          errors.horarioInicio = 'Horário de início é obrigatório';
        }
        if (!data.horarioTermino) {
          errors.horarioTermino = 'Horário de término é obrigatório';
        }
        if (data.horarioInicio && data.horarioTermino && !validateTimeRange(data.horarioInicio, data.horarioTermino)) {
          errors.horarioTermino = 'Horário de término deve ser após o horário de início';
        }

        // Validação de quantidade de pessoas
        if (!data.quantidadePessoas) {
          errors.quantidadePessoas = 'Quantidade de pessoas é obrigatória';
        } else if (data.quantidadePessoas <= 0) {
          errors.quantidadePessoas = 'Quantidade de pessoas deve ser maior que zero';
        } else if (data.quantidadePessoas > 100) {
          errors.quantidadePessoas = 'Quantidade de pessoas não pode ser maior que 100';
        }

        // Validação de nome
        if (!data.nomeCompletoSolicitante) {
          errors.nomeCompletoSolicitante = 'Nome completo é obrigatório';
        } else if (!validateName(data.nomeCompletoSolicitante)) {
          errors.nomeCompletoSolicitante = 'Nome deve conter pelo menos 2 palavras';
        }

        // Validação de celular
        if (!data.celularComDDD) {
          errors.celularComDDD = 'Celular com DDD é obrigatório';
        } else if (!validatePhone(data.celularComDDD)) {
          errors.celularComDDD = 'Celular deve ter formato válido (ex: (11) 99999-9999)';
        }
        break;

      case 2: // Detalhes do evento
        if (!data.motivoReserva) {
          errors.motivoReserva = 'Motivo da reserva é obrigatório';
        }

        if (!data.tituloEvento) {
          errors.tituloEvento = 'Título do evento é obrigatório';
        } else if (data.tituloEvento.length < 5) {
          errors.tituloEvento = 'Título deve ter pelo menos 5 caracteres';
        } else if (data.tituloEvento.length > 100) {
          errors.tituloEvento = 'Título não pode ter mais que 100 caracteres';
        }

        if (!data.descricaoEvento) {
          errors.descricaoEvento = 'Descrição do evento é obrigatória';
        } else if (data.descricaoEvento.length < 20) {
          errors.descricaoEvento = 'Descrição deve ter pelo menos 20 caracteres';
        } else if (data.descricaoEvento.length > 1000) {
          errors.descricaoEvento = 'Descrição não pode ter mais que 1000 caracteres';
        }
        break;

      case 3: // Campos condicionais
        if (data.temPalestranteExterno) {
          if (!data.palestranteExterno?.nomeCompleto) {
            errors['palestranteExterno.nomeCompleto'] = 'Nome do palestrante é obrigatório';
          } else if (!validateName(data.palestranteExterno.nomeCompleto)) {
            errors['palestranteExterno.nomeCompleto'] = 'Nome deve conter pelo menos 2 palavras';
          }

          if (!data.palestranteExterno?.apresentacao) {
            errors['palestranteExterno.apresentacao'] = 'Apresentação do palestrante é obrigatória';
          } else if (data.palestranteExterno.apresentacao.length < 10) {
            errors['palestranteExterno.apresentacao'] = 'Apresentação deve ter pelo menos 10 caracteres';
          } else if (data.palestranteExterno.apresentacao.length > 500) {
            errors['palestranteExterno.apresentacao'] = 'Apresentação não pode ter mais que 500 caracteres';
          }
        }

        if (data.necessidadeSalaPlana) {
          if (!data.motivoSalaPlana) {
            errors.motivoSalaPlana = 'Motivo para sala plana é obrigatório';
          } else if (data.motivoSalaPlana.length < 10) {
            errors.motivoSalaPlana = 'Motivo deve ter pelo menos 10 caracteres';
          } else if (data.motivoSalaPlana.length > 300) {
            errors.motivoSalaPlana = 'Motivo não pode ter mais que 300 caracteres';
          }
        }
        break;
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && formState.currentStep < TOTAL_STEPS) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      // Scroll para o primeiro erro
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstError as HTMLElement).focus();
      }
    }
  };

  const prevStep = () => {
    if (formState.currentStep > 1) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setFormState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Aqui você faria a chamada para a API
      console.log('Dados da reserva:', formState.data);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso - redirecionar para a página da entidade
      if (entidadeId) {
        navigate(`/entidades/${entidadeId}`, { 
          state: { 
            success: true, 
            message: 'Reserva enviada com sucesso! Você receberá uma confirmação por email.' 
          } 
        });
      } else {
        // Fallback caso não tenha entidadeId
        navigate('/entidades', { 
          state: { 
            success: true, 
            message: 'Reserva enviada com sucesso! Você receberá uma confirmação por email.' 
          } 
        });
      }
      
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      alert('Erro ao enviar reserva. Tente novamente.');
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderStep = () => {
    switch (formState.currentStep) {
      case 1:
        return <BasicInfoStep formData={formState.data} updateFormData={updateFormData} errors={formState.errors} />;
      case 2:
        return <EventDetailsStep formData={formState.data} updateFormData={updateFormData} errors={formState.errors} />;
      case 3:
        return <ConditionalFieldsStep formData={formState.data} updateFormData={updateFormData} errors={formState.errors} />;
      case 4:
        return <ReviewStep formData={formState.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reserva de Sala
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {formState.currentStep} de {TOTAL_STEPS}</span>
              <span>{Math.round((formState.currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>
            <Progress value={(formState.currentStep / TOTAL_STEPS) * 100} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={formState.currentStep === 1}
            >
              Anterior
            </Button>
            
            {formState.currentStep < TOTAL_STEPS ? (
              <Button 
                onClick={nextStep}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Próximo
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={formState.isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {formState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Enviar Reserva
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para o passo 1: Dados básicos
const BasicInfoStep: React.FC<{
  formData: Partial<SalaReservationData>;
  updateFormData: (field: keyof SalaReservationData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Dados Básicos
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            type="date"
            value={formData.data || ''}
            onChange={(e) => updateFormData('data', e.target.value)}
            className={`${errors.data ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
            min={new Date().toISOString().split('T')[0]}
            max="2050-12-31"
          />
          {errors.data ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.data}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Data futura até 31/12/2050</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidadePessoas">Quantidade de Pessoas *</Label>
          <Input
            id="quantidadePessoas"
            type="number"
            min="1"
            max="100"
            value={formData.quantidadePessoas || ''}
            onChange={(e) => updateFormData('quantidadePessoas', parseInt(e.target.value) || 0)}
            className={`${errors.quantidadePessoas ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
          />
          {errors.quantidadePessoas ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.quantidadePessoas}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 1, Máximo: 100</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horarioInicio">Horário de Início *</Label>
          <Input
            id="horarioInicio"
            type="time"
            value={formData.horarioInicio || ''}
            onChange={(e) => updateFormData('horarioInicio', e.target.value)}
            className={`${errors.horarioInicio ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
          />
          {errors.horarioInicio ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.horarioInicio}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Formato: HH:MM</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="horarioTermino">Horário de Término *</Label>
          <Input
            id="horarioTermino"
            type="time"
            value={formData.horarioTermino || ''}
            onChange={(e) => updateFormData('horarioTermino', e.target.value)}
            className={`${errors.horarioTermino ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
          />
          {errors.horarioTermino ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.horarioTermino}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Deve ser após o horário de início</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomeCompletoSolicitante">Nome Completo do Solicitante *</Label>
          <Input
            id="nomeCompletoSolicitante"
            value={formData.nomeCompletoSolicitante || ''}
            onChange={(e) => updateFormData('nomeCompletoSolicitante', e.target.value)}
            className={`${errors.nomeCompletoSolicitante ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
            placeholder="Ex: João Silva Santos"
          />
          {errors.nomeCompletoSolicitante ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.nomeCompletoSolicitante}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Digite seu nome completo</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="celularComDDD">Celular com DDD *</Label>
          <Input
            id="celularComDDD"
            placeholder="(11) 99999-9999"
            value={formData.celularComDDD || ''}
            onChange={(e) => updateFormData('celularComDDD', e.target.value)}
            className={`${errors.celularComDDD ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
            maxLength={15}
          />
          {errors.celularComDDD ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.celularComDDD}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Formato: (11) 99999-9999</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para o passo 2: Detalhes do evento
const EventDetailsStep: React.FC<{
  formData: Partial<SalaReservationData>;
  updateFormData: (field: keyof SalaReservationData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Detalhes do Evento
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="motivoReserva">Motivo da Reserva *</Label>
        <Select
          value={formData.motivoReserva || ''}
          onValueChange={(value) => updateFormData('motivoReserva', value)}
        >
          <SelectTrigger className={errors.motivoReserva ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o motivo da reserva" />
          </SelectTrigger>
          <SelectContent>
            {SALA_EVENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.motivoReserva && <p className="text-sm text-red-500">{errors.motivoReserva}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tituloEvento">Título do Evento/Capacitação *</Label>
        <Input
          id="tituloEvento"
          value={formData.tituloEvento || ''}
          onChange={(e) => updateFormData('tituloEvento', e.target.value)}
          className={`${errors.tituloEvento ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
          placeholder="Ex: Workshop de Python para Iniciantes"
          maxLength={100}
        />
        <div className="flex justify-between items-center">
          {errors.tituloEvento ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.tituloEvento}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 5 caracteres, Máximo: 100</p>
          )}
          <span className="text-xs text-gray-400">
            {formData.tituloEvento?.length || 0}/100
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricaoEvento">Descrição das Pautas do Evento/Capacitação *</Label>
        <Textarea
          id="descricaoEvento"
          rows={4}
          value={formData.descricaoEvento || ''}
          onChange={(e) => updateFormData('descricaoEvento', e.target.value)}
          className={`${errors.descricaoEvento ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors resize-none`}
          placeholder="Descreva detalhadamente o que será abordado no evento, os objetivos, público-alvo e principais tópicos..."
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.descricaoEvento ? (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.descricaoEvento}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 20 caracteres, Máximo: 1000</p>
          )}
          <span className="text-xs text-gray-400">
            {formData.descricaoEvento?.length || 0}/1000
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para o passo 3: Campos condicionais
const ConditionalFieldsStep: React.FC<{
  formData: Partial<SalaReservationData>;
  updateFormData: (field: keyof SalaReservationData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informações Adicionais</h3>
      
      {/* Palestrante Externo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="temPalestranteExterno"
            checked={formData.temPalestranteExterno || false}
            onCheckedChange={(checked) => updateFormData('temPalestranteExterno', checked)}
          />
          <Label htmlFor="temPalestranteExterno">
            Professor ou palestrante externo?
          </Label>
        </div>
        
        {formData.temPalestranteExterno && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="nomePalestrante">Nome Completo do Professor/Palestrante *</Label>
              <Input
                id="nomePalestrante"
                value={formData.palestranteExterno?.nomeCompleto || ''}
                onChange={(e) => updateFormData('palestranteExterno', {
                  ...formData.palestranteExterno,
                  nomeCompleto: e.target.value
                })}
                className={`${errors['palestranteExterno.nomeCompleto'] ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors`}
                placeholder="Ex: Dr. Maria Silva Santos"
              />
              {errors['palestranteExterno.nomeCompleto'] ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors['palestranteExterno.nomeCompleto']}
                </p>
              ) : (
                <p className="text-xs text-gray-500">Digite o nome completo do palestrante</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apresentacaoPalestrante">Breve Apresentação do Convidado *</Label>
              <Textarea
                id="apresentacaoPalestrante"
                rows={3}
                value={formData.palestranteExterno?.apresentacao || ''}
                onChange={(e) => updateFormData('palestranteExterno', {
                  ...formData.palestranteExterno,
                  apresentacao: e.target.value
                })}
                className={`${errors['palestranteExterno.apresentacao'] ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors resize-none`}
                placeholder="Ex: Professor de Ciência da Computação na USP, especialista em Machine Learning com 10 anos de experiência..."
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {errors['palestranteExterno.apresentacao'] ? (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors['palestranteExterno.apresentacao']}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Mínimo: 10 caracteres, Máximo: 500</p>
                )}
                <span className="text-xs text-gray-400">
                  {formData.palestranteExterno?.apresentacao?.length || 0}/500
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ehPessoaPublica"
                checked={formData.palestranteExterno?.ehPessoaPublica || false}
                onCheckedChange={(checked) => updateFormData('palestranteExterno', {
                  ...formData.palestranteExterno,
                  ehPessoaPublica: checked
                })}
              />
              <Label htmlFor="ehPessoaPublica">
                O convidado é uma pessoa pública?
              </Label>
            </div>
          </div>
        )}
      </div>
      
      {/* Necessidade de Sala Plana */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="necessidadeSalaPlana"
            checked={formData.necessidadeSalaPlana || false}
            onCheckedChange={(checked) => updateFormData('necessidadeSalaPlana', checked)}
          />
          <Label htmlFor="necessidadeSalaPlana">
            Necessidade de sala plana?
          </Label>
        </div>
        
        {formData.necessidadeSalaPlana && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="motivoSalaPlana">Qual o motivo? *</Label>
            <Textarea
              id="motivoSalaPlana"
              rows={2}
              value={formData.motivoSalaPlana || ''}
              onChange={(e) => updateFormData('motivoSalaPlana', e.target.value)}
              className={`${errors.motivoSalaPlana ? 'border-red-500 focus:border-red-500' : 'focus:border-red-600'} transition-colors resize-none`}
              placeholder="Ex: Necessário para demonstração de equipamentos que requerem espaço plano..."
              maxLength={300}
            />
            <div className="flex justify-between items-center">
              {errors.motivoSalaPlana ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.motivoSalaPlana}
                </p>
              ) : (
                <p className="text-xs text-gray-500">Mínimo: 10 caracteres, Máximo: 300</p>
              )}
              <span className="text-xs text-gray-400">
                {formData.motivoSalaPlana?.length || 0}/300
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para o passo 4: Revisão
const ReviewStep: React.FC<{
  formData: Partial<SalaReservationData>;
}> = ({ formData }) => {
  const getEventTypeLabel = (value: string) => {
    const option = SALA_EVENT_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        Revisão da Reserva
      </h3>
      
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>✅ Validação concluída!</strong> Revise os dados abaixo antes de enviar sua reserva. Após o envio, você receberá uma confirmação por email.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Data:</strong> {formData.data}
        </div>
        <div>
          <strong>Horário:</strong> {formData.horarioInicio} - {formData.horarioTermino}
        </div>
        <div>
          <strong>Pessoas:</strong> {formData.quantidadePessoas}
        </div>
        <div>
          <strong>Solicitante:</strong> {formData.nomeCompletoSolicitante}
        </div>
        <div>
          <strong>Celular:</strong> {formData.celularComDDD}
        </div>
        <div>
          <strong>Tipo de Evento:</strong> {getEventTypeLabel(formData.motivoReserva || '')}
        </div>
      </div>
      
      <div className="space-y-2">
        <strong>Título:</strong>
        <p>{formData.tituloEvento}</p>
      </div>
      
      <div className="space-y-2">
        <strong>Descrição:</strong>
        <p className="text-sm text-muted-foreground">{formData.descricaoEvento}</p>
      </div>
      
      {formData.temPalestranteExterno && formData.palestranteExterno && (
        <div className="space-y-2">
          <strong>Palestrante Externo:</strong>
          <div className="text-sm space-y-1">
            <p><strong>Nome:</strong> {formData.palestranteExterno.nomeCompleto}</p>
            <p><strong>Apresentação:</strong> {formData.palestranteExterno.apresentacao}</p>
            <p><strong>Pessoa Pública:</strong> {formData.palestranteExterno.ehPessoaPublica ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      )}
      
      {formData.necessidadeSalaPlana && (
        <div className="space-y-2">
          <strong>Necessidade de Sala Plana:</strong>
          <p className="text-sm">{formData.motivoSalaPlana}</p>
        </div>
      )}
    </div>
  );
};
