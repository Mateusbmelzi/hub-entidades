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
import { Calendar, Clock, Users, User, Phone, FileText, CheckCircle, Building } from 'lucide-react';
import { useCreateReserva } from '@/hooks/useCreateReserva';
import { useEntidades } from '@/hooks/useEntidades';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { useAuth } from '@/hooks/useAuth';
import { ReservaFormData, ProfessorConvidado } from '@/types/reserva';
import { ProfessoresConvidadosManager } from '@/components/ProfessoresConvidadosManager';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

export const ReservaSalaFormV2: React.FC = () => {
  const navigate = useNavigate();
  const { id: entidadeIdFromParams } = useParams<{ id: string }>();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservaFormData>>({
    tipo_reserva: 'sala',
    professores_convidados: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { createReserva, loading: createLoading } = useCreateReserva();
  const { entidades, loading: entidadesLoading } = useEntidades();
  const { isAuthenticated: isEntityAuthenticated, entidadeId } = useEntityAuth();
  const { profile } = useAuth();

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
        break;

      case 2: // Motivo da reserva
        if (!formData.motivo_reserva) {
          newErrors.motivo_reserva = 'Motivo da reserva é obrigatório';
        }
        
        const showEventDetails = formData.motivo_reserva && 
          ['palestra_alunos_insper', 'palestra_publico_externo', 'capacitacao'].includes(formData.motivo_reserva);
        
        if (showEventDetails) {
          // Validação do título do evento/capacitação
          if (!formData.titulo_evento_capacitacao) {
            newErrors.titulo_evento_capacitacao = 'Título do evento/capacitação é obrigatório';
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
        
        // Validação para apoio externo
        if (formData.eh_pessoa_publica && formData.ha_apoio_externo) {
          // Validação da descrição do apoio
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
        
        // Validação para sala plana (só se não há palestrante externo)
        if (!formData.tem_palestrante_externo && formData.necessidade_sala_plana) {
          if (!formData.motivo_sala_plana) {
            newErrors.motivo_sala_plana = 'Motivo da necessidade de sala plana é obrigatório';
          } else if (formData.motivo_sala_plana.length < 10) {
            newErrors.motivo_sala_plana = 'Motivo deve ter pelo menos 10 caracteres';
          } else if (formData.motivo_sala_plana.length > 300) {
            newErrors.motivo_sala_plana = 'Motivo não pode ter mais que 300 caracteres';
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
              message: 'Reserva enviada com sucesso! Você receberá uma confirmação por email.'
            }
          });
        } else {
          // Fallback: redirecionar para lista de entidades
          navigate('/entidades', {
            state: {
              success: true,
              message: 'Reserva enviada com sucesso! Você receberá uma confirmação por email.'
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
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <ReasonStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <ConditionalFieldsStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <ReviewStep formData={formData} />;
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
              Reserva de Sala
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
            Reserva de Sala
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
                Próximo
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



// Componente para dados básicos
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
          <Label htmlFor="quantidade_pessoas">Quantidade de Pessoas *</Label>
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
          <Label htmlFor="horario_inicio">Horário de Início *</Label>
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
          <Label htmlFor="horario_termino">Horário de Término *</Label>
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
          <Label htmlFor="nome_solicitante">Nome Completo do Solicitante *</Label>
          <Input
            id="nome_solicitante"
            value={formData.nome_solicitante || ''}
            onChange={(e) => updateFormData('nome_solicitante', e.target.value)}
            className={errors.nome_solicitante ? 'border-red-500' : ''}
          />
          {errors.nome_solicitante && <p className="text-sm text-red-500">{errors.nome_solicitante}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefone_solicitante">Telefone com DDD *</Label>
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
    </div>
  );
};

// Componente para campos condicionais
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
      
      
      {/* Necessidade de Sala Plana - só aparece se NÃO há palestrante externo */}
      {!formData.tem_palestrante_externo && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="necessidade_sala_plana"
              checked={formData.necessidade_sala_plana || false}
              onCheckedChange={(checked) => updateFormData('necessidade_sala_plana', checked)}
            />
            <Label htmlFor="necessidade_sala_plana">
              Necessidade de sala plana?
            </Label>
          </div>
          
          {formData.necessidade_sala_plana && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="motivo_sala_plana">Qual o motivo? *</Label>
              <Textarea
                id="motivo_sala_plana"
                rows={2}
                value={formData.motivo_sala_plana || ''}
                onChange={(e) => updateFormData('motivo_sala_plana', e.target.value)}
                className={errors.motivo_sala_plana ? 'border-red-500' : ''}
                maxLength={300}
                placeholder="Ex: Necessário para demonstração de equipamentos que requerem espaço plano..."
              />
              <div className="flex justify-between items-center">
                {errors.motivo_sala_plana ? (
                  <p className="text-sm text-red-500">{errors.motivo_sala_plana}</p>
                ) : (
                  <p className="text-xs text-gray-500">Mínimo: 10 caracteres, Máximo: 300</p>
                )}
                <span className="text-xs text-gray-400">
                  {formData.motivo_sala_plana?.length || 0}/300
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Adicionais</Label>
        <Textarea
          id="observacoes"
          rows={3}
          value={formData.observacoes || ''}
          onChange={(e) => updateFormData('observacoes', e.target.value)}
          placeholder="Adicione qualquer informação adicional relevante..."
          maxLength={500}
        />
        <div className="flex justify-end">
          <span className="text-xs text-gray-400">
            {formData.observacoes?.length || 0}/500
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para revisão
const ReviewStep: React.FC<{
  formData: Partial<ReservaFormData>;
}> = ({ formData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        Revisão da Reserva
      </h3>
      
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revise os dados abaixo antes de enviar sua reserva. Após o envio, você receberá uma confirmação por email.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Data:</strong> {formData.data_reserva}
        </div>
        <div>
          <strong>Horário:</strong> {formData.horario_inicio} - {formData.horario_termino}
        </div>
        <div>
          <strong>Pessoas:</strong> {formData.quantidade_pessoas}
        </div>
        <div>
          <strong>Solicitante:</strong> {formData.nome_solicitante}
        </div>
        <div>
          <strong>Telefone:</strong> {formData.telefone_solicitante}
        </div>
        <div>
          <strong>Motivo:</strong> {
            formData.motivo_reserva === 'palestra_alunos_insper' ? 'Palestra aberta aos alunos Insper' :
            formData.motivo_reserva === 'palestra_publico_externo' ? 'Palestra aberta ao público externo' :
            formData.motivo_reserva === 'capacitacao' ? 'Capacitação' :
            formData.motivo_reserva === 'reuniao' ? 'Reunião' :
            formData.motivo_reserva === 'processo_seletivo' ? 'Processo Seletivo' :
            formData.motivo_reserva
          }
        </div>
      </div>
      
      {formData.titulo_evento_capacitacao && (
        <div className="space-y-2">
          <strong>Título do Evento/Capacitação:</strong>
          <p className="text-sm">{formData.titulo_evento_capacitacao}</p>
        </div>
      )}
      
      {formData.descricao_pautas_evento_capacitacao && (
        <div className="space-y-2">
          <strong>Descrição das Pautas:</strong>
          <p className="text-sm">{formData.descricao_pautas_evento_capacitacao}</p>
        </div>
      )}
      
      {/* Professores Convidados */}
      {formData.professores_convidados && formData.professores_convidados.length > 0 && (
        <div className="space-y-2">
          <strong>Professores/Palestrantes Convidados ({formData.professores_convidados.length}):</strong>
          <div className="space-y-3">
            {formData.professores_convidados.map((professor, index) => (
              <div key={professor.id || index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {professor.nomeCompleto}
                  </h4>
                  <div className="flex gap-1">
                    {professor.ehPessoaPublica && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pessoa Pública
                      </span>
                    )}
                    {professor.haApoioExterno && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Apoio Externo
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Apresentação:</strong> {professor.apresentacao}
                </p>
                {professor.haApoioExterno && professor.comoAjudaraOrganizacao && (
                  <p className="text-sm text-gray-600">
                    <strong>Apoio da Empresa:</strong> {professor.comoAjudaraOrganizacao}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manter compatibilidade com método antigo */}
      {formData.tem_palestrante_externo && formData.nome_palestrante_externo && (
        <div className="space-y-2">
          <strong>Palestrante Externo (Método Antigo):</strong>
          <div className="text-sm space-y-1">
            <p><strong>Nome:</strong> {formData.nome_palestrante_externo}</p>
            <p><strong>Apresentação:</strong> {formData.apresentacao_palestrante_externo}</p>
            <p><strong>Pessoa Pública:</strong> {formData.eh_pessoa_publica ? 'Sim' : 'Não'}</p>
            {formData.ha_apoio_externo && (
              <>
                <p><strong>Apoio Externo:</strong> Sim</p>
                <p><strong>Como Ajudará:</strong> {formData.como_ajudara_organizacao}</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {formData.necessidade_sala_plana && (
        <div className="space-y-2">
          <strong>Necessidade de Sala Plana:</strong>
          <p className="text-sm">{formData.motivo_sala_plana}</p>
        </div>
      )}

      {formData.observacoes && (
        <div className="space-y-2">
          <strong>Observações:</strong>
          <p className="text-sm">{formData.observacoes}</p>
        </div>
      )}
    </div>
  );
};

// Componente para seleção do motivo da reserva
const ReasonStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  const motivoOptions = [
    { value: 'palestra_alunos_insper', label: 'Palestra aberta aos alunos Insper' },
    { value: 'palestra_publico_externo', label: 'Palestra aberta ao público externo' },
    { value: 'capacitacao', label: 'Capacitação' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'processo_seletivo', label: 'Processo Seletivo' }
  ];

  const showEventDetails = formData.motivo_reserva && 
    ['palestra_alunos_insper', 'palestra_publico_externo', 'capacitacao'].includes(formData.motivo_reserva);

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
            {motivoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.motivo_reserva && <p className="text-sm text-red-500">{errors.motivo_reserva}</p>}
      </div>

      {showEventDetails && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo_evento_capacitacao">Título do evento/capacitação *</Label>
            <Input
              id="titulo_evento_capacitacao"
              value={formData.titulo_evento_capacitacao || ''}
              onChange={(e) => updateFormData('titulo_evento_capacitacao', e.target.value)}
              className={errors.titulo_evento_capacitacao ? 'border-red-500' : ''}
              placeholder="Digite o título do evento ou capacitação"
              maxLength={100}
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
              value={formData.descricao_pautas_evento_capacitacao || ''}
              onChange={(e) => updateFormData('descricao_pautas_evento_capacitacao', e.target.value)}
              className={errors.descricao_pautas_evento_capacitacao ? 'border-red-500' : ''}
              placeholder="Descreva as pautas e objetivos do evento ou capacitação"
              rows={4}
              maxLength={1000}
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
        </div>
      )}
    </div>
  );
};
