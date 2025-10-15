import React, { useState, useEffect } from 'react';
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
import { useEventos } from '@/hooks/useEventos';
import { useEntidades } from '@/hooks/useEntidades';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { ReservaFormData } from '@/types/reserva';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

export const ReservaAuditorioFormV2: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ReservaFormData>>({
    tipo_reserva: 'auditorio'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { createReserva, loading: createLoading } = useCreateReserva();
  const { eventos, loading: eventosLoading } = useEventos();
  const { entidades, loading: entidadesLoading } = useEntidades();
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

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Seleção de evento
        if (!formData.evento_id) newErrors.evento_id = 'Selecione um evento';
        break;

      case 2: // Dados básicos
        if (!formData.data_reserva) newErrors.data_reserva = 'Data é obrigatória';
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

      case 3: // Campos condicionais
        if (formData.tem_palestrante_externo) {
          if (!formData.nome_palestrante_externo) {
            newErrors.nome_palestrante_externo = 'Nome do palestrante é obrigatório';
          }
          if (!formData.apresentacao_palestrante_externo) {
            newErrors.apresentacao_palestrante_externo = 'Apresentação do palestrante é obrigatória';
          }
        }
        if (formData.precisa_gravacao && !formData.motivo_gravacao) {
          newErrors.motivo_gravacao = 'Motivo para gravação é obrigatório';
        }
        if (formData.precisa_suporte_tecnico && !formData.detalhes_suporte_tecnico) {
          newErrors.detalhes_suporte_tecnico = 'Detalhes do suporte técnico são obrigatórios';
        }
        if (formData.precisa_alimentacao && !formData.detalhes_alimentacao) {
          newErrors.detalhes_alimentacao = 'Detalhes da alimentação são obrigatórios';
        }
        if (formData.precisa_seguranca && !formData.detalhes_seguranca) {
          newErrors.detalhes_seguranca = 'Detalhes da segurança são obrigatórios';
        }
        if (formData.precisa_controle_acesso && !formData.detalhes_controle_acesso) {
          newErrors.detalhes_controle_acesso = 'Detalhes do controle de acesso são obrigatórios';
        }
        if (formData.precisa_limpeza_especial && !formData.detalhes_limpeza_especial) {
          newErrors.detalhes_limpeza_especial = 'Detalhes da limpeza especial são obrigatórios';
        }
        if (formData.precisa_manutencao && !formData.detalhes_manutencao) {
          newErrors.detalhes_manutencao = 'Detalhes da manutenção são obrigatórios';
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
        // Reset form
        setFormData({ tipo_reserva: 'auditorio' });
        setCurrentStep(1);
        setErrors({});
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
        return <EventSelectionStep formData={formData} updateFormData={updateFormData} errors={errors} eventos={eventos} loading={eventosLoading} />;
      case 2:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <AuditorioFieldsStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <ReviewStep formData={formData} eventos={eventos} />;
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

// Componente para seleção de evento
const EventSelectionStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
  eventos: any[];
  loading: boolean;
}> = ({ formData, updateFormData, errors, eventos, loading }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Seleção de Evento
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="evento_id">Evento *</Label>
        <Select
          value={formData.evento_id || ''}
          onValueChange={(value) => updateFormData('evento_id', value)}
        >
          <SelectTrigger className={errors.evento_id ? 'border-red-500' : ''}>
            <SelectValue placeholder={loading ? "Carregando eventos..." : "Selecione um evento"} />
          </SelectTrigger>
          <SelectContent>
            {eventos.map((evento) => (
              <SelectItem key={evento.id} value={evento.id}>
                {evento.nome} - {new Date(evento.data).toLocaleDateString('pt-BR')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.evento_id && <p className="text-sm text-red-500">{errors.evento_id}</p>}
      </div>

      {formData.evento_id && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Você está fazendo uma reserva de auditório para o evento selecionado. 
            A reserva será vinculada a este evento e precisará de aprovação.
          </AlertDescription>
        </Alert>
      )}
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

// Componente para campos específicos do auditório
const AuditorioFieldsStep: React.FC<{
  formData: Partial<ReservaFormData>;
  updateFormData: (field: keyof ReservaFormData, value: any) => void;
  errors: Record<string, string>;
}> = ({ formData, updateFormData, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informações do Auditório</h3>
      
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
              <Label htmlFor="nome_palestrante_externo">Nome Completo do Professor/Palestrante *</Label>
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
              <Label htmlFor="apresentacao_palestrante_externo">Breve Apresentação do Convidado *</Label>
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
                O convidado é uma pessoa pública?
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Equipamentos */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Equipamentos Necessários</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisa_sistema_som"
              checked={formData.precisa_sistema_som || false}
              onCheckedChange={(checked) => updateFormData('precisa_sistema_som', checked)}
            />
            <Label htmlFor="precisa_sistema_som" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Sistema de Som
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisa_projetor"
              checked={formData.precisa_projetor || false}
              onCheckedChange={(checked) => updateFormData('precisa_projetor', checked)}
            />
            <Label htmlFor="precisa_projetor" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Projetor
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisa_iluminacao_especial"
              checked={formData.precisa_iluminacao_especial || false}
              onCheckedChange={(checked) => updateFormData('precisa_iluminacao_especial', checked)}
            />
            <Label htmlFor="precisa_iluminacao_especial" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Iluminação Especial
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisa_montagem_palco"
              checked={formData.precisa_montagem_palco || false}
              onCheckedChange={(checked) => updateFormData('precisa_montagem_palco', checked)}
            />
            <Label htmlFor="precisa_montagem_palco" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Montagem de Palco
            </Label>
          </div>
        </div>
      </div>

      {/* Gravação */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_gravacao"
            checked={formData.precisa_gravacao || false}
            onCheckedChange={(checked) => updateFormData('precisa_gravacao', checked)}
          />
          <Label htmlFor="precisa_gravacao" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Precisa de gravação?
          </Label>
        </div>
        
        {formData.precisa_gravacao && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="motivo_gravacao">Qual o motivo da gravação? *</Label>
            <Textarea
              id="motivo_gravacao"
              rows={2}
              value={formData.motivo_gravacao || ''}
              onChange={(e) => updateFormData('motivo_gravacao', e.target.value)}
              className={errors.motivo_gravacao ? 'border-red-500' : ''}
            />
            {errors.motivo_gravacao && (
              <p className="text-sm text-red-500">{errors.motivo_gravacao}</p>
            )}
          </div>
        )}
      </div>

      {/* Equipamentos Adicionais */}
      <div className="space-y-2">
        <Label htmlFor="equipamentos_adicionais">Equipamentos Adicionais</Label>
        <Textarea
          id="equipamentos_adicionais"
          rows={2}
          value={formData.equipamentos_adicionais || ''}
          onChange={(e) => updateFormData('equipamentos_adicionais', e.target.value)}
          placeholder="Descreva outros equipamentos necessários..."
        />
      </div>

      {/* Suporte Técnico */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_suporte_tecnico"
            checked={formData.precisa_suporte_tecnico || false}
            onCheckedChange={(checked) => updateFormData('precisa_suporte_tecnico', checked)}
          />
          <Label htmlFor="precisa_suporte_tecnico">Precisa de suporte técnico?</Label>
        </div>
        
        {formData.precisa_suporte_tecnico && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="detalhes_suporte_tecnico">Detalhes do suporte técnico *</Label>
            <Textarea
              id="detalhes_suporte_tecnico"
              rows={2}
              value={formData.detalhes_suporte_tecnico || ''}
              onChange={(e) => updateFormData('detalhes_suporte_tecnico', e.target.value)}
              className={errors.detalhes_suporte_tecnico ? 'border-red-500' : ''}
            />
            {errors.detalhes_suporte_tecnico && (
              <p className="text-sm text-red-500">{errors.detalhes_suporte_tecnico}</p>
            )}
          </div>
        )}
      </div>

      {/* Configuração da Sala */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="configuracao_sala">Configuração da Sala</Label>
          <Select
            value={formData.configuracao_sala || ''}
            onValueChange={(value) => updateFormData('configuracao_sala', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a configuração desejada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Teatro">Teatro</SelectItem>
              <SelectItem value="U">Formato U</SelectItem>
              <SelectItem value="Mesas">Mesas</SelectItem>
              <SelectItem value="Cadeiras em linha">Cadeiras em linha</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.configuracao_sala && (
          <div className="space-y-2">
            <Label htmlFor="motivo_configuracao_sala">Motivo da configuração</Label>
            <Textarea
              id="motivo_configuracao_sala"
              rows={2}
              value={formData.motivo_configuracao_sala || ''}
              onChange={(e) => updateFormData('motivo_configuracao_sala', e.target.value)}
              placeholder="Explique por que precisa desta configuração..."
            />
          </div>
        )}
      </div>

      {/* Alimentação */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_alimentacao"
            checked={formData.precisa_alimentacao || false}
            onCheckedChange={(checked) => updateFormData('precisa_alimentacao', checked)}
          />
          <Label htmlFor="precisa_alimentacao" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Precisa de alimentação?
          </Label>
        </div>
        
        {formData.precisa_alimentacao && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detalhes_alimentacao">Detalhes da alimentação *</Label>
              <Textarea
                id="detalhes_alimentacao"
                rows={2}
                value={formData.detalhes_alimentacao || ''}
                onChange={(e) => updateFormData('detalhes_alimentacao', e.target.value)}
                className={errors.detalhes_alimentacao ? 'border-red-500' : ''}
              />
              {errors.detalhes_alimentacao && (
                <p className="text-sm text-red-500">{errors.detalhes_alimentacao}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custo_estimado_alimentacao">Custo estimado (R$)</Label>
              <Input
                id="custo_estimado_alimentacao"
                type="number"
                min="0"
                step="0.01"
                value={formData.custo_estimado_alimentacao || ''}
                onChange={(e) => updateFormData('custo_estimado_alimentacao', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Segurança */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_seguranca"
            checked={formData.precisa_seguranca || false}
            onCheckedChange={(checked) => updateFormData('precisa_seguranca', checked)}
          />
          <Label htmlFor="precisa_seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Precisa de segurança?
          </Label>
        </div>
        
        {formData.precisa_seguranca && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="detalhes_seguranca">Detalhes da segurança *</Label>
            <Textarea
              id="detalhes_seguranca"
              rows={2}
              value={formData.detalhes_seguranca || ''}
              onChange={(e) => updateFormData('detalhes_seguranca', e.target.value)}
              className={errors.detalhes_seguranca ? 'border-red-500' : ''}
            />
            {errors.detalhes_seguranca && (
              <p className="text-sm text-red-500">{errors.detalhes_seguranca}</p>
            )}
          </div>
        )}
      </div>

      {/* Controle de Acesso */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_controle_acesso"
            checked={formData.precisa_controle_acesso || false}
            onCheckedChange={(checked) => updateFormData('precisa_controle_acesso', checked)}
          />
          <Label htmlFor="precisa_controle_acesso" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Precisa de controle de acesso?
          </Label>
        </div>
        
        {formData.precisa_controle_acesso && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="detalhes_controle_acesso">Detalhes do controle de acesso *</Label>
            <Textarea
              id="detalhes_controle_acesso"
              rows={2}
              value={formData.detalhes_controle_acesso || ''}
              onChange={(e) => updateFormData('detalhes_controle_acesso', e.target.value)}
              className={errors.detalhes_controle_acesso ? 'border-red-500' : ''}
            />
            {errors.detalhes_controle_acesso && (
              <p className="text-sm text-red-500">{errors.detalhes_controle_acesso}</p>
            )}
          </div>
        )}
      </div>

      {/* Limpeza Especial */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_limpeza_especial"
            checked={formData.precisa_limpeza_especial || false}
            onCheckedChange={(checked) => updateFormData('precisa_limpeza_especial', checked)}
          />
          <Label htmlFor="precisa_limpeza_especial" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Precisa de limpeza especial?
          </Label>
        </div>
        
        {formData.precisa_limpeza_especial && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="detalhes_limpeza_especial">Detalhes da limpeza especial *</Label>
            <Textarea
              id="detalhes_limpeza_especial"
              rows={2}
              value={formData.detalhes_limpeza_especial || ''}
              onChange={(e) => updateFormData('detalhes_limpeza_especial', e.target.value)}
              className={errors.detalhes_limpeza_especial ? 'border-red-500' : ''}
            />
            {errors.detalhes_limpeza_especial && (
              <p className="text-sm text-red-500">{errors.detalhes_limpeza_especial}</p>
            )}
          </div>
        )}
      </div>

      {/* Manutenção */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="precisa_manutencao"
            checked={formData.precisa_manutencao || false}
            onCheckedChange={(checked) => updateFormData('precisa_manutencao', checked)}
          />
          <Label htmlFor="precisa_manutencao" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Precisa de manutenção?
          </Label>
        </div>
        
        {formData.precisa_manutencao && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="detalhes_manutencao">Detalhes da manutenção *</Label>
            <Textarea
              id="detalhes_manutencao"
              rows={2}
              value={formData.detalhes_manutencao || ''}
              onChange={(e) => updateFormData('detalhes_manutencao', e.target.value)}
              className={errors.detalhes_manutencao ? 'border-red-500' : ''}
            />
            {errors.detalhes_manutencao && (
              <p className="text-sm text-red-500">{errors.detalhes_manutencao}</p>
            )}
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações Adicionais</Label>
        <Textarea
          id="observacoes"
          rows={3}
          value={formData.observacoes || ''}
          onChange={(e) => updateFormData('observacoes', e.target.value)}
          placeholder="Adicione qualquer informação adicional relevante..."
        />
      </div>
    </div>
  );
};

// Componente para revisão
const ReviewStep: React.FC<{
  formData: Partial<ReservaFormData>;
  eventos: any[];
}> = ({ formData, eventos }) => {
  const eventoSelecionado = eventos.find(e => e.id === formData.evento_id);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        Revisão da Reserva
      </h3>
      
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Revise os dados abaixo antes de enviar sua reserva de auditório. Após o envio, você receberá uma confirmação por email.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Evento:</strong> {eventoSelecionado?.nome}
        </div>
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
      </div>
      
      {formData.tem_palestrante_externo && formData.nome_palestrante_externo && (
        <div className="space-y-2">
          <strong>Palestrante Externo:</strong>
          <div className="text-sm space-y-1">
            <p><strong>Nome:</strong> {formData.nome_palestrante_externo}</p>
            <p><strong>Apresentação:</strong> {formData.apresentacao_palestrante_externo}</p>
            <p><strong>Pessoa Pública:</strong> {formData.eh_pessoa_publica ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      )}

      {/* Equipamentos selecionados */}
      <div className="space-y-2">
        <strong>Equipamentos Solicitados:</strong>
        <div className="flex flex-wrap gap-2">
          {formData.precisa_sistema_som && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Sistema de Som</span>}
          {formData.precisa_projetor && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Projetor</span>}
          {formData.precisa_iluminacao_especial && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Iluminação Especial</span>}
          {formData.precisa_montagem_palco && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Montagem de Palco</span>}
          {formData.precisa_gravacao && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Gravação</span>}
          {formData.precisa_alimentacao && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Alimentação</span>}
          {formData.precisa_seguranca && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Segurança</span>}
          {formData.precisa_controle_acesso && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Controle de Acesso</span>}
          {formData.precisa_limpeza_especial && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Limpeza Especial</span>}
          {formData.precisa_manutencao && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Manutenção</span>}
        </div>
      </div>

      {formData.configuracao_sala && (
        <div className="space-y-2">
          <strong>Configuração da Sala:</strong>
          <p className="text-sm">{formData.configuracao_sala}</p>
          {formData.motivo_configuracao_sala && (
            <p className="text-sm text-muted-foreground">{formData.motivo_configuracao_sala}</p>
          )}
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
