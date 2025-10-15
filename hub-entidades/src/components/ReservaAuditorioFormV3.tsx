import React, { useState, useEffect } from 'react';
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
import { Calendar, Clock, Users, User, Phone, FileText, CheckCircle, Building, Mic, Video, Lightbulb, Settings, Camera, Utensils, Shield, Key, Sparkles, Wrench } from 'lucide-react';
import { useCreateReserva } from '@/hooks/useCreateReserva';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { useAuth } from '@/hooks/useAuth';
import { useSalas } from '@/hooks/useSalas';
import { ReservaFormData, MOTIVO_AUDITORIO_LABELS, ProfessorConvidado } from '@/types/reserva';
import { ProfessoresConvidadosManager } from '@/components/ProfessoresConvidadosManager';
import { SalaSelector } from '@/components/SalaSelector';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

export const ReservaAuditorioFormV3: React.FC = () => {
  const navigate = useNavigate();
  const { id: entidadeIdFromParams } = useParams<{ id: string }>();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservaFormData>>({
    tipo_reserva: 'auditorio',
    professores_convidados: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { createReserva, loading: createLoading } = useCreateReserva();
  const { isAuthenticated: isEntityAuthenticated, entidadeId } = useEntityAuth();
  const { profile } = useAuth();
  const { salas, loading: salasLoading, getSalaAuditorio } = useSalas();


  // Preencher automaticamente o nome e telefone do solicitante quando o perfil do usuário for carregado
  useEffect(() => {
    if (profile?.nome && !formData.nome_solicitante) {
      setFormData(prev => ({
        ...prev,
        nome_solicitante: profile.nome
      }));
    }
    if (profile?.celular && !formData.telefone_solicitante) {
      setFormData(prev => ({
        ...prev,
        telefone_solicitante: profile.celular
      }));
    }
  }, [profile?.nome, profile?.celular, formData.nome_solicitante, formData.telefone_solicitante]);

  const updateFormData = (field: keyof ReservaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro quando campo é atualizado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateDate = (date: string): boolean => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date(2050, 11, 31); // 31 de dezembro de 2050
    
    today.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);
    
    return selectedDate >= today && selectedDate <= maxDate;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Dados básicos
        if (!formData.data_reserva) {
          newErrors.data_reserva = 'Data é obrigatória';
        } else if (!validateDate(formData.data_reserva)) {
          const selectedDate = new Date(formData.data_reserva);
          const today = new Date();
          const maxDate = new Date(2050, 11, 31);
          
          if (selectedDate < today) {
            newErrors.data_reserva = 'A data não pode ser no passado';
          } else if (selectedDate > maxDate) {
            newErrors.data_reserva = 'A data não pode ser posterior a 31 de dezembro de 2050';
          } else {
            newErrors.data_reserva = 'Data inválida';
          }
        }
        if (!formData.horario_inicio) newErrors.horario_inicio = 'Horário de início é obrigatório';
        if (!formData.horario_termino) newErrors.horario_termino = 'Horário de término é obrigatório';
        if (!formData.quantidade_pessoas || formData.quantidade_pessoas <= 0) {
          newErrors.quantidade_pessoas = 'Quantidade de pessoas deve ser maior que zero';
        }
        if (!formData.nome_solicitante) {
          newErrors.nome_solicitante = 'Nome completo é obrigatório';
        }
        if (!formData.telefone_solicitante) {
          newErrors.telefone_solicitante = 'Telefone é obrigatório';
        }
        if (!formData.sala_id) {
          newErrors.sala_id = 'Seleção do auditório é obrigatória';
        }
        break;

      case 2: // Motivo da reserva e título
        if (!formData.motivo_reserva) {
          newErrors.motivo_reserva = 'Motivo da reserva é obrigatório';
        }
        
        // Validação do título do evento
        if (!formData.titulo_evento_capacitacao) {
          newErrors.titulo_evento_capacitacao = 'Título do evento é obrigatório';
        } else if (formData.titulo_evento_capacitacao.length < 5) {
          newErrors.titulo_evento_capacitacao = 'Título deve ter pelo menos 5 caracteres';
        } else if (formData.titulo_evento_capacitacao.length > 100) {
          newErrors.titulo_evento_capacitacao = 'Título não pode ter mais que 100 caracteres';
        }
        
        // Validação da descrição das pautas
        if (!formData.descricao_pautas_evento_capacitacao) {
          newErrors.descricao_pautas_evento_capacitacao = 'Descrição das pautas é obrigatória';
        } else if (formData.descricao_pautas_evento_capacitacao.length < 20) {
          newErrors.descricao_pautas_evento_capacitacao = 'Descrição deve ter pelo menos 20 caracteres';
        } else if (formData.descricao_pautas_evento_capacitacao.length > 1000) {
          newErrors.descricao_pautas_evento_capacitacao = 'Descrição não pode ter mais que 1000 caracteres';
        }
        
        // Validação da descrição da programação
        if (!formData.descricao_programacao_evento) {
          newErrors.descricao_programacao_evento = 'Descrição da programação é obrigatória';
        } else if (formData.descricao_programacao_evento.length < 20) {
          newErrors.descricao_programacao_evento = 'Descrição deve ter pelo menos 20 caracteres';
        } else if (formData.descricao_programacao_evento.length > 1000) {
          newErrors.descricao_programacao_evento = 'Descrição não pode ter mais que 1000 caracteres';
        }
        break;

      case 3: // Campos condicionais
        // Validação dos professores convidados
        if (formData.professores_convidados && formData.professores_convidados.length > 0) {
          formData.professores_convidados.forEach((professor, index) => {
            // Validação do nome do professor
            if (!professor.nomeCompleto) {
              newErrors[`professor_${professor.id}_nome`] = 'Nome do professor é obrigatório';
            } else if (professor.nomeCompleto.length < 5) {
              newErrors[`professor_${professor.id}_nome`] = 'Nome deve ter pelo menos 5 caracteres';
            } else if (professor.nomeCompleto.length > 100) {
              newErrors[`professor_${professor.id}_nome`] = 'Nome não pode ter mais que 100 caracteres';
            }
            
            // Validação da apresentação do professor
            if (!professor.apresentacao) {
              newErrors[`professor_${professor.id}_apresentacao`] = 'Apresentação do professor é obrigatória';
            } else if (professor.apresentacao.length < 10) {
              newErrors[`professor_${professor.id}_apresentacao`] = 'Apresentação deve ter pelo menos 10 caracteres';
            } else if (professor.apresentacao.length > 500) {
              newErrors[`professor_${professor.id}_apresentacao`] = 'Apresentação não pode ter mais que 500 caracteres';
            }
            
            // Validação do apoio externo se for pessoa pública
            if (professor.ehPessoaPublica && professor.haApoioExterno) {
              if (!professor.comoAjudaraOrganizacao) {
                newErrors[`professor_${professor.id}_apoio`] = 'Descrição do apoio é obrigatória';
              } else if (professor.comoAjudaraOrganizacao.length < 10) {
                newErrors[`professor_${professor.id}_apoio`] = 'Descrição deve ter pelo menos 10 caracteres';
              } else if (professor.comoAjudaraOrganizacao.length > 500) {
                newErrors[`professor_${professor.id}_apoio`] = 'Descrição não pode ter mais que 500 caracteres';
              }
            }
          });
        }
        
        // Manter validação antiga para compatibilidade
        if (formData.tem_palestrante_externo) {
          // Validação do nome do palestrante
          if (!formData.nome_palestrante_externo) {
            newErrors.nome_palestrante_externo = 'Nome do palestrante é obrigatório';
          } else if (formData.nome_palestrante_externo.length < 5) {
            newErrors.nome_palestrante_externo = 'Nome deve ter pelo menos 5 caracteres';
          } else if (formData.nome_palestrante_externo.length > 100) {
            newErrors.nome_palestrante_externo = 'Nome não pode ter mais que 100 caracteres';
          }
          
          // Validação da apresentação do palestrante
          if (!formData.apresentacao_palestrante_externo) {
            newErrors.apresentacao_palestrante_externo = 'Apresentação do palestrante é obrigatória';
          } else if (formData.apresentacao_palestrante_externo.length < 10) {
            newErrors.apresentacao_palestrante_externo = 'Apresentação deve ter pelo menos 10 caracteres';
          } else if (formData.apresentacao_palestrante_externo.length > 500) {
            newErrors.apresentacao_palestrante_externo = 'Apresentação não pode ter mais que 500 caracteres';
          }
        }
        
        if (formData.ha_apoio_externo) {
          // Validação do apoio externo
          if (!formData.como_ajudara_organizacao) {
            newErrors.como_ajudara_organizacao = 'Descrição do apoio é obrigatória';
          } else if (formData.como_ajudara_organizacao.length < 10) {
            newErrors.como_ajudara_organizacao = 'Descrição deve ter pelo menos 10 caracteres';
          } else if (formData.como_ajudara_organizacao.length > 500) {
            newErrors.como_ajudara_organizacao = 'Descrição não pode ter mais que 500 caracteres';
          }
          
          // Validação da descrição de como ajudará
          if (!formData.como_ajudara_organizacao) {
            newErrors.como_ajudara_organizacao = 'Descrição de como ajudará é obrigatória';
          } else if (formData.como_ajudara_organizacao.length < 10) {
            newErrors.como_ajudara_organizacao = 'Descrição deve ter pelo menos 10 caracteres';
          } else if (formData.como_ajudara_organizacao.length > 500) {
            newErrors.como_ajudara_organizacao = 'Descrição não pode ter mais que 500 caracteres';
          }
        }
        break;

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      const success = await createReserva(formData as ReservaFormData);
      if (success) {
        // Determinar para onde redirecionar
        const targetEntidadeId = entidadeIdFromParams || entidadeId;
        
        if (targetEntidadeId) {
          // Redirecionar para a página da entidade com mensagem de sucesso
          navigate(`/entidades/${targetEntidadeId}`, {
            state: {
              success: true,
              message: 'Reserva de auditório enviada com sucesso! Você receberá uma confirmação por email.'
            }
          });
        } else {
          // Fallback: redirecionar para lista de entidades
          navigate('/entidades', {
            state: {
              success: true,
              message: 'Reserva de auditório enviada com sucesso! Você receberá uma confirmação por email.'
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep 
          formData={formData} 
          updateFormData={updateFormData} 
          errors={errors} 
        />;
      case 2:
        return <ReasonStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <ConditionalFieldsStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <ReviewStep formData={formData} salas={salas} />;
      default:
        return null;
    }
  };

  // Verificar se o usuário está autenticado como entidade
  if (!isEntityAuthenticated || !entidadeId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Reserva de Auditório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Apenas entidades podem fazer reservas. Faça login como entidade primeiro para acessar esta funcionalidade.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Reserva de Auditório
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep} de {TOTAL_STEPS}</span>
              <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={nextStep}>
                {currentStep === TOTAL_STEPS - 1 ? 'Revisar' : 'Próximo'}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || createLoading}
                className="flex items-center gap-2"
              >
                {isLoading || createLoading ? (
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

// Componente para dados básicos (Passo 1)
const BasicInfoStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Dados da Reserva
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_reserva">Data *</Label>
          <Input
            id="data_reserva"
            type="date"
            value={formData.data_reserva || ''}
            onChange={(e) => updateFormData('data_reserva', e.target.value)}
            className={errors.data_reserva ? 'border-red-500' : ''}
            min={new Date().toISOString().split('T')[0]}
            max="2050-12-31"
          />
          {errors.data_reserva && <p className="text-sm text-red-500">{errors.data_reserva}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidade_pessoas">Qtd de pessoas *</Label>
          <Input
            id="quantidade_pessoas"
            type="number"
            min="1"
            value={formData.quantidade_pessoas || ''}
            onChange={(e) => updateFormData('quantidade_pessoas', parseInt(e.target.value))}
            className={errors.quantidade_pessoas ? 'border-red-500' : ''}
          />
          {errors.quantidade_pessoas && <p className="text-sm text-red-500">{errors.quantidade_pessoas}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horario_inicio">Horário de início *</Label>
          <Input
            id="horario_inicio"
            type="time"
            value={formData.horario_inicio || ''}
            onChange={(e) => updateFormData('horario_inicio', e.target.value)}
            className={errors.horario_inicio ? 'border-red-500' : ''}
          />
          {errors.horario_inicio && <p className="text-sm text-red-500">{errors.horario_inicio}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="horario_termino">Horário de término *</Label>
          <Input
            id="horario_termino"
            type="time"
            value={formData.horario_termino || ''}
            onChange={(e) => updateFormData('horario_termino', e.target.value)}
            className={errors.horario_termino ? 'border-red-500' : ''}
          />
          {errors.horario_termino && <p className="text-sm text-red-500">{errors.horario_termino}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_solicitante">Nome completo do solicitante *</Label>
          <Input
            id="nome_solicitante"
            value={formData.nome_solicitante || ''}
            onChange={(e) => updateFormData('nome_solicitante', e.target.value)}
            className={errors.nome_solicitante ? 'border-red-500' : ''}
          />
          {errors.nome_solicitante && <p className="text-sm text-red-500">{errors.nome_solicitante}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefone_solicitante">Celular com DDD *</Label>
          <Input
            id="telefone_solicitante"
            placeholder="(11) 99999-9999"
            value={formData.telefone_solicitante || ''}
            onChange={(e) => updateFormData('telefone_solicitante', e.target.value)}
            className={errors.telefone_solicitante ? 'border-red-500' : ''}
          />
          {errors.telefone_solicitante && <p className="text-sm text-red-500">{errors.telefone_solicitante}</p>}
        </div>
      </div>

      {/* Seleção de Auditório */}
      <SalaSelector
        tipo="auditorio"
        quantidadePessoas={formData.quantidade_pessoas}
        salaId={formData.sala_id}
        onSalaChange={(salaId) => updateFormData('sala_id', salaId)}
        errors={errors}
      />
    </div>
  );
};

// Componente para motivo da reserva (Passo 2)
const ReasonStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Motivo da Reserva
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="motivo_reserva">Motivo da reserva *</Label>
        <Select
          value={formData.motivo_reserva || ''}
          onValueChange={(value) => updateFormData('motivo_reserva', value)}
        >
          <SelectTrigger className={errors.motivo_reserva ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o motivo da reserva" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MOTIVO_AUDITORIO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.motivo_reserva && <p className="text-sm text-red-500">{errors.motivo_reserva}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="titulo_evento_capacitacao">Título do evento/capacitação *</Label>
        <Input
          id="titulo_evento_capacitacao"
          value={formData.titulo_evento_capacitacao || ''}
          onChange={(e) => updateFormData('titulo_evento_capacitacao', e.target.value)}
          className={errors.titulo_evento_capacitacao ? 'border-red-500' : ''}
          maxLength={100}
          placeholder="Digite o título do evento ou capacitação"
        />
        <div className="flex justify-between items-center">
          {errors.titulo_evento_capacitacao ? (
            <p className="text-sm text-red-500">{errors.titulo_evento_capacitacao}</p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 5 caracteres, Máximo: 100</p>
          )}
          <span className="text-xs text-gray-400">
            {formData.titulo_evento_capacitacao?.length || 0}/100
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_pautas_evento_capacitacao">Descrição das pautas do evento/capacitação *</Label>
        <Textarea
          id="descricao_pautas_evento_capacitacao"
          rows={3}
          value={formData.descricao_pautas_evento_capacitacao || ''}
          onChange={(e) => updateFormData('descricao_pautas_evento_capacitacao', e.target.value)}
          className={errors.descricao_pautas_evento_capacitacao ? 'border-red-500' : ''}
          maxLength={1000}
          placeholder="Descreva as pautas e objetivos do evento ou capacitação"
        />
        <div className="flex justify-between items-center">
          {errors.descricao_pautas_evento_capacitacao ? (
            <p className="text-sm text-red-500">{errors.descricao_pautas_evento_capacitacao}</p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 20 caracteres, Máximo: 1000</p>
          )}
          <span className="text-xs text-gray-400">
            {formData.descricao_pautas_evento_capacitacao?.length || 0}/1000
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_programacao_evento">Descreva a programação do evento: *</Label>
        <Textarea
          id="descricao_programacao_evento"
          rows={3}
          value={formData.descricao_programacao_evento || ''}
          onChange={(e) => updateFormData('descricao_programacao_evento', e.target.value)}
          className={errors.descricao_programacao_evento ? 'border-red-500' : ''}
          maxLength={1000}
          placeholder="Descreva detalhadamente a programação do evento, cronograma e atividades"
        />
        <div className="flex justify-between items-center">
          {errors.descricao_programacao_evento ? (
            <p className="text-sm text-red-500">{errors.descricao_programacao_evento}</p>
          ) : (
            <p className="text-xs text-gray-500">Mínimo: 20 caracteres, Máximo: 1000</p>
          )}
          <span className="text-xs text-gray-400">
            {formData.descricao_programacao_evento?.length || 0}/1000
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para campos condicionais (Passo 3)
const ConditionalFieldsStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  const handleProfessoresChange = (professores: ProfessorConvidado[]) => {
    updateFormData('professores_convidados', professores);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informações Adicionais</h3>
      
      {/* Professores Convidados */}
      <ProfessoresConvidadosManager
        professores={formData.professores_convidados || []}
        onProfessoresChange={handleProfessoresChange}
        errors={errors}
      />
      
    </div>
  );
};

// Componente para revisão (Passo 4)
const ReviewStep: React.FC<{
  formData: Partial<ReservaFormData>;
  salas: any[];
}> = ({ formData, salas }) => {
  const formatDate = (date: string) => {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    if (!time) return 'Não informado';
    return time;
  };

  const getMotivoLabel = (motivo: string) => {
    return MOTIVO_AUDITORIO_LABELS[motivo as keyof typeof MOTIVO_AUDITORIO_LABELS] || motivo;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        Revisão da Reserva
      </h3>
      
      <div className="space-y-4">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dados da Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Data:</span>
                <p className="text-sm text-gray-600">{formatDate(formData.data_reserva || '')}</p>
              </div>
              <div>
                <span className="font-medium">Quantidade de pessoas:</span>
                <p className="text-sm text-gray-600">{formData.quantidade_pessoas || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium">Horário de início:</span>
                <p className="text-sm text-gray-600">{formatTime(formData.horario_inicio || '')}</p>
              </div>
              <div>
                <span className="font-medium">Horário de término:</span>
                <p className="text-sm text-gray-600">{formatTime(formData.horario_termino || '')}</p>
              </div>
              <div>
                <span className="font-medium">Solicitante:</span>
                <p className="text-sm text-gray-600">{formData.nome_solicitante || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium">Telefone:</span>
                <p className="text-sm text-gray-600">{formData.telefone_solicitante || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium">Auditório:</span>
                <p className="text-sm text-gray-600">
                  {formData.sala_id ? (() => {
                    const auditorioSelecionado = salas.find(s => s.id === formData.sala_id);
                    return auditorioSelecionado 
                      ? `${auditorioSelecionado.predio} - ${auditorioSelecionado.andar}º andar - ${auditorioSelecionado.sala} (Capacidade: ${auditorioSelecionado.capacidade} pessoas)`
                      : 'Auditório não encontrado';
                  })() : 'Não selecionado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivo e Detalhes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Motivo e Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Motivo da reserva:</span>
              <p className="text-sm text-gray-600">{getMotivoLabel(formData.motivo_reserva || '')}</p>
            </div>
            <div>
              <span className="font-medium">Título do evento:</span>
              <p className="text-sm text-gray-600">{formData.titulo_evento_capacitacao || 'Não informado'}</p>
            </div>
            <div>
              <span className="font-medium">Descrição das pautas:</span>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.descricao_pautas_evento_capacitacao || 'Não informado'}</p>
            </div>
            <div>
              <span className="font-medium">Programação do evento:</span>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.descricao_programacao_evento || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Professores Convidados */}
        {formData.professores_convidados && formData.professores_convidados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Professores Convidados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.professores_convidados.map((professor, index) => (
                  <div key={professor.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{professor.nomeCompleto}</h4>
                        <p className="text-xs text-gray-600 mt-1">{professor.apresentacao}</p>
                        <div className="flex gap-2 mt-2">
                          {professor.ehPessoaPublica && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Pessoa Pública
                            </span>
                          )}
                          {professor.haApoioExterno && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Apoio Externo
                            </span>
                          )}
                        </div>
                        {professor.haApoioExterno && professor.comoAjudaraOrganizacao && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Como ajudará:</span> {professor.comoAjudaraOrganizacao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

