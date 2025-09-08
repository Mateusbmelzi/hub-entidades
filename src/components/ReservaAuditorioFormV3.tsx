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
import { Calendar, Clock, Users, User, Phone, FileText, CheckCircle, Building, Mic, Video, Lightbulb, Settings, Camera, Utensils, Shield, Key, Sparkles, Wrench } from 'lucide-react';
import { useCreateReserva } from '@/hooks/useCreateReserva';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { ReservaFormData, MOTIVO_AUDITORIO_LABELS } from '@/types/reserva';
import { toast } from 'sonner';

const TOTAL_STEPS = 3;

export const ReservaAuditorioFormV3: React.FC = () => {
  const navigate = useNavigate();
  const { id: entidadeIdFromParams } = useParams<{ id: string }>();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservaFormData>>({
    tipo_reserva: 'auditorio'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { createReserva, loading: createLoading } = useCreateReserva();
  const { isAuthenticated: isEntityAuthenticated, entidadeId } = useEntityAuth();

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

      case 2: // Motivo da reserva e título
        if (!formData.motivo_reserva) newErrors.motivo_reserva = 'Motivo da reserva é obrigatório';
        if (!formData.titulo_evento_capacitacao) {
          newErrors.titulo_evento_capacitacao = 'Título do evento é obrigatório';
        }
        if (!formData.descricao_pautas_evento_capacitacao) {
          newErrors.descricao_pautas_evento_capacitacao = 'Descrição das pautas é obrigatória';
        }
        if (!formData.descricao_programacao_evento) {
          newErrors.descricao_programacao_evento = 'Descrição da programação é obrigatória';
        }
        break;

      case 3: // Campos condicionais
        if (formData.tem_palestrante_externo) {
          if (!formData.nome_palestrante_externo) {
            newErrors.nome_palestrante_externo = 'Nome do palestrante é obrigatório';
          }
          if (!formData.apresentacao_palestrante_externo) {
            newErrors.apresentacao_palestrante_externo = 'Apresentação do palestrante é obrigatória';
          }
        }
        if (formData.ha_apoio_externo) {
          if (!formData.nome_empresa_parceira) {
            newErrors.nome_empresa_parceira = 'Nome da empresa parceira é obrigatório';
          }
          if (!formData.como_ajudara_organizacao) {
            newErrors.como_ajudara_organizacao = 'Descrição de como ajudará é obrigatória';
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
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <ReasonStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <ConditionalFieldsStep formData={formData} updateFormData={updateFormData} errors={errors} />;
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
        />
        {errors.titulo_evento_capacitacao && <p className="text-sm text-red-500">{errors.titulo_evento_capacitacao}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_pautas_evento_capacitacao">Descrição das pautas do evento/capacitação *</Label>
        <Textarea
          id="descricao_pautas_evento_capacitacao"
          rows={3}
          value={formData.descricao_pautas_evento_capacitacao || ''}
          onChange={(e) => updateFormData('descricao_pautas_evento_capacitacao', e.target.value)}
          className={errors.descricao_pautas_evento_capacitacao ? 'border-red-500' : ''}
        />
        {errors.descricao_pautas_evento_capacitacao && <p className="text-sm text-red-500">{errors.descricao_pautas_evento_capacitacao}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_programacao_evento">Descreva a programação do evento: *</Label>
        <Textarea
          id="descricao_programacao_evento"
          rows={3}
          value={formData.descricao_programacao_evento || ''}
          onChange={(e) => updateFormData('descricao_programacao_evento', e.target.value)}
          className={errors.descricao_programacao_evento ? 'border-red-500' : ''}
        />
        {errors.descricao_programacao_evento && <p className="text-sm text-red-500">{errors.descricao_programacao_evento}</p>}
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
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informações Adicionais</h3>
      
      {/* Palestrante Externo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tem_palestrante_externo"
            checked={formData.tem_palestrante_externo || false}
            onCheckedChange={(checked) => updateFormData('tem_palestrante_externo', checked)}
          />
          <Label htmlFor="tem_palestrante_externo">
            Professor ou palestrante externo?
          </Label>
        </div>
        
        {formData.tem_palestrante_externo && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="nome_palestrante_externo">Nome completo do professor ou palestrante e uma breve apresentação do convidado: *</Label>
              <Input
                id="nome_palestrante_externo"
                value={formData.nome_palestrante_externo || ''}
                onChange={(e) => updateFormData('nome_palestrante_externo', e.target.value)}
                className={errors.nome_palestrante_externo ? 'border-red-500' : ''}
              />
              {errors.nome_palestrante_externo && (
                <p className="text-sm text-red-500">{errors.nome_palestrante_externo}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apresentacao_palestrante_externo">Breve apresentação do convidado *</Label>
              <Textarea
                id="apresentacao_palestrante_externo"
                rows={3}
                value={formData.apresentacao_palestrante_externo || ''}
                onChange={(e) => updateFormData('apresentacao_palestrante_externo', e.target.value)}
                className={errors.apresentacao_palestrante_externo ? 'border-red-500' : ''}
              />
              {errors.apresentacao_palestrante_externo && (
                <p className="text-sm text-red-500">{errors.apresentacao_palestrante_externo}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eh_pessoa_publica"
                checked={formData.eh_pessoa_publica || false}
                onCheckedChange={(checked) => updateFormData('eh_pessoa_publica', checked)}
              />
              <Label htmlFor="eh_pessoa_publica">
                O Convidado é uma pessoa pública?
              </Label>
            </div>

            {/* Apoio Externo - só aparece se for pessoa pública */}
            {formData.eh_pessoa_publica && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ha_apoio_externo"
                    checked={formData.ha_apoio_externo || false}
                    onCheckedChange={(checked) => updateFormData('ha_apoio_externo', checked)}
                  />
                  <Label htmlFor="ha_apoio_externo">
                    Haverá apoio externo?
                  </Label>
                </div>
                
                {formData.ha_apoio_externo && (
                  <div className="ml-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_empresa_parceira">Informar o nome da empresa parceira e em como ajudará a organização estudantil: *</Label>
                      <Input
                        id="nome_empresa_parceira"
                        value={formData.nome_empresa_parceira || ''}
                        onChange={(e) => updateFormData('nome_empresa_parceira', e.target.value)}
                        className={errors.nome_empresa_parceira ? 'border-red-500' : ''}
                      />
                      {errors.nome_empresa_parceira && (
                        <p className="text-sm text-red-500">{errors.nome_empresa_parceira}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="como_ajudara_organizacao">Como a empresa ajudará a organização estudantil? *</Label>
                      <Textarea
                        id="como_ajudara_organizacao"
                        rows={3}
                        value={formData.como_ajudara_organizacao || ''}
                        onChange={(e) => updateFormData('como_ajudara_organizacao', e.target.value)}
                        className={errors.como_ajudara_organizacao ? 'border-red-500' : ''}
                      />
                      {errors.como_ajudara_organizacao && (
                        <p className="text-sm text-red-500">{errors.como_ajudara_organizacao}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

