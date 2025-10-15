import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuditorioReservation } from '@/hooks/useAuditorioReservation';
import { AuditorioReservationFormData } from '@/types/auditorio-reservation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  FileText, 
  Mic, 
  Video, 
  Lightbulb, 
  Settings, 
  Camera, 
  Utensils, 
  Shield, 
  Key, 
  Sparkles, 
  Wrench,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Componente de indicador de progresso
const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index + 1 <= currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${
                index + 1 < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Componente para campos condicionais
const ConditionalField: React.FC<{
  condition: boolean;
  children: React.ReactNode;
}> = ({ condition, children }) => {
  if (!condition) return null;
  return <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{children}</motion.div>;
};

const ReservaAuditorioForm: React.FC = () => {
  const { formState, updateField, validateStep, submitReservation, resetForm } = useAuditorioReservation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setErrors([]);
    } else {
      setErrors(formState.errors);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const handleSubmit = async () => {
    const success = await submitReservation();
    if (success) {
      resetForm();
      setCurrentStep(1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Dados Básicos</h2>
              <p className="text-muted-foreground">Informações sobre data, horário e solicitante</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data do Evento
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formState.data.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attendees" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Número de Pessoas
                </Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  value={formState.data.attendees}
                  onChange={(e) => updateField('attendees', parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário de Início
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formState.data.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horário de Término
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formState.data.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo do Solicitante
                </Label>
                <Input
                  id="applicantName"
                  value={formState.data.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  className="w-full"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applicantPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Celular com DDD
                </Label>
                <Input
                  id="applicantPhone"
                  value={formState.data.applicantPhone}
                  onChange={(e) => updateField('applicantPhone', e.target.value)}
                  className="w-full"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Detalhes do Evento</h2>
              <p className="text-muted-foreground">Tipo de evento e descrição</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventType" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tipo de Evento
              </Label>
              <Select value={formState.data.eventType} onValueChange={(value) => updateField('eventType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Palestra aberta aos alunos Insper">Palestra aberta aos alunos Insper</SelectItem>
                  <SelectItem value="Palestra aberta ao público externo">Palestra aberta ao público externo</SelectItem>
                  <SelectItem value="Capacitação">Capacitação</SelectItem>
                  <SelectItem value="Reunião">Reunião</SelectItem>
                  <SelectItem value="Processo Seletivo">Processo Seletivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Título do Evento</Label>
              <Input
                id="eventTitle"
                value={formState.data.eventTitle}
                onChange={(e) => updateField('eventTitle', e.target.value)}
                className="w-full"
                placeholder="Nome do evento"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDescription">Descrição do Evento</Label>
              <Textarea
                id="eventDescription"
                value={formState.data.eventDescription}
                onChange={(e) => updateField('eventDescription', e.target.value)}
                className="w-full"
                rows={4}
                placeholder="Descreva o evento, objetivos, público-alvo, etc."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Configuração do Auditório</h2>
              <p className="text-muted-foreground">Equipamentos, configuração e serviços necessários</p>
            </div>
            
            {/* Palestrante Externo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Palestrante Externo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExternalSpeaker"
                    checked={formState.data.hasExternalSpeaker}
                    onCheckedChange={(checked) => updateField('hasExternalSpeaker', checked)}
                  />
                  <Label htmlFor="hasExternalSpeaker">Haverá palestrante externo</Label>
                </div>
                
                <ConditionalField condition={formState.data.hasExternalSpeaker}>
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="externalSpeakerName">Nome do Palestrante Externo</Label>
                      <Input
                        id="externalSpeakerName"
                        value={formState.data.externalSpeakerName || ''}
                        onChange={(e) => updateField('externalSpeakerName', e.target.value)}
                        placeholder="Nome completo do palestrante"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="externalSpeakerPresentation">Apresentação do Palestrante</Label>
                      <Textarea
                        id="externalSpeakerPresentation"
                        value={formState.data.externalSpeakerPresentation || ''}
                        onChange={(e) => updateField('externalSpeakerPresentation', e.target.value)}
                        placeholder="Breve apresentação do palestrante"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublicPerson"
                        checked={formState.data.isPublicPerson || false}
                        onCheckedChange={(checked) => updateField('isPublicPerson', checked)}
                      />
                      <Label htmlFor="isPublicPerson">É pessoa pública</Label>
                    </div>
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>

            {/* Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equipamentos Necessários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needsSoundSystem"
                      checked={formState.data.needsSoundSystem}
                      onCheckedChange={(checked) => updateField('needsSoundSystem', checked)}
                    />
                    <Label htmlFor="needsSoundSystem" className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Sistema de Som
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needsProjector"
                      checked={formState.data.needsProjector}
                      onCheckedChange={(checked) => updateField('needsProjector', checked)}
                    />
                    <Label htmlFor="needsProjector" className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Projetor
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needsLighting"
                      checked={formState.data.needsLighting}
                      onCheckedChange={(checked) => updateField('needsLighting', checked)}
                    />
                    <Label htmlFor="needsLighting" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Iluminação Especial
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needsStageSetup"
                      checked={formState.data.needsStageSetup}
                      onCheckedChange={(checked) => updateField('needsStageSetup', checked)}
                    />
                    <Label htmlFor="needsStageSetup" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Montagem de Palco
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsRecording"
                    checked={formState.data.needsRecording}
                    onCheckedChange={(checked) => updateField('needsRecording', checked)}
                  />
                  <Label htmlFor="needsRecording" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Gravação do Evento
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.needsRecording}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="recordingReason">Motivo da Gravação</Label>
                    <Textarea
                      id="recordingReason"
                      value={formState.data.recordingReason || ''}
                      onChange={(e) => updateField('recordingReason', e.target.value)}
                      placeholder="Explique o motivo da gravação"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalEquipment">Equipamentos Adicionais</Label>
                  <Textarea
                    id="additionalEquipment"
                    value={formState.data.additionalEquipment || ''}
                    onChange={(e) => updateField('additionalEquipment', e.target.value)}
                    placeholder="Liste outros equipamentos necessários"
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="technicalSupportNeeded"
                    checked={formState.data.technicalSupportNeeded}
                    onCheckedChange={(checked) => updateField('technicalSupportNeeded', checked)}
                  />
                  <Label htmlFor="technicalSupportNeeded">Necessita Suporte Técnico</Label>
                </div>
                
                <ConditionalField condition={formState.data.technicalSupportNeeded}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="technicalSupportDetails">Detalhes do Suporte Técnico</Label>
                    <Textarea
                      id="technicalSupportDetails"
                      value={formState.data.technicalSupportDetails || ''}
                      onChange={(e) => updateField('technicalSupportDetails', e.target.value)}
                      placeholder="Descreva o suporte técnico necessário"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>

            {/* Configuração da Sala */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração da Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomConfiguration">Configuração Desejada</Label>
                  <Select value={formState.data.roomConfiguration} onValueChange={(value) => updateField('roomConfiguration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a configuração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teatro">Teatro (padrão)</SelectItem>
                      <SelectItem value="U">Formato U</SelectItem>
                      <SelectItem value="Mesas">Mesas</SelectItem>
                      <SelectItem value="Cadeiras em linha">Cadeiras em linha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <ConditionalField condition={formState.data.roomConfiguration && formState.data.roomConfiguration !== 'Teatro'}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="roomConfigurationReason">Motivo da Configuração</Label>
                    <Textarea
                      id="roomConfigurationReason"
                      value={formState.data.roomConfigurationReason || ''}
                      onChange={(e) => updateField('roomConfigurationReason', e.target.value)}
                      placeholder="Explique o motivo da configuração escolhida"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>

            {/* Alimentação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alimentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsCatering"
                    checked={formState.data.needsCatering}
                    onCheckedChange={(checked) => updateField('needsCatering', checked)}
                  />
                  <Label htmlFor="needsCatering" className="flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Necessita Alimentação
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.needsCatering}>
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="cateringDetails">Detalhes da Alimentação</Label>
                      <Textarea
                        id="cateringDetails"
                        value={formState.data.cateringDetails || ''}
                        onChange={(e) => updateField('cateringDetails', e.target.value)}
                        placeholder="Descreva o tipo de alimentação necessária"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCateringCost">Custo Estimado da Alimentação (R$)</Label>
                      <Input
                        id="estimatedCateringCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.data.estimatedCateringCost || ''}
                        onChange={(e) => updateField('estimatedCateringCost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>

            {/* Segurança e Controle de Acesso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança e Controle de Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsSecurity"
                    checked={formState.data.needsSecurity}
                    onCheckedChange={(checked) => updateField('needsSecurity', checked)}
                  />
                  <Label htmlFor="needsSecurity" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Necessita Segurança
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.needsSecurity}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="securityDetails">Detalhes da Segurança</Label>
                    <Textarea
                      id="securityDetails"
                      value={formState.data.securityDetails || ''}
                      onChange={(e) => updateField('securityDetails', e.target.value)}
                      placeholder="Descreva as necessidades de segurança"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessControlNeeded"
                    checked={formState.data.accessControlNeeded}
                    onCheckedChange={(checked) => updateField('accessControlNeeded', checked)}
                  />
                  <Label htmlFor="accessControlNeeded" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Controle de Acesso Especial
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.accessControlNeeded}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="accessControlDetails">Detalhes do Controle de Acesso</Label>
                    <Textarea
                      id="accessControlDetails"
                      value={formState.data.accessControlDetails || ''}
                      onChange={(e) => updateField('accessControlDetails', e.target.value)}
                      placeholder="Descreva as necessidades de controle de acesso"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>

            {/* Limpeza e Manutenção */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Limpeza e Manutenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needsSpecialCleaning"
                    checked={formState.data.needsSpecialCleaning}
                    onCheckedChange={(checked) => updateField('needsSpecialCleaning', checked)}
                  />
                  <Label htmlFor="needsSpecialCleaning" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Limpeza Especial
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.needsSpecialCleaning}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="specialCleaningDetails">Detalhes da Limpeza Especial</Label>
                    <Textarea
                      id="specialCleaningDetails"
                      value={formState.data.specialCleaningDetails || ''}
                      onChange={(e) => updateField('specialCleaningDetails', e.target.value)}
                      placeholder="Descreva as necessidades de limpeza especial"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenanceRequired"
                    checked={formState.data.maintenanceRequired}
                    onCheckedChange={(checked) => updateField('maintenanceRequired', checked)}
                  />
                  <Label htmlFor="maintenanceRequired" className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Manutenção Necessária
                  </Label>
                </div>
                
                <ConditionalField condition={formState.data.maintenanceRequired}>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="maintenanceDetails">Detalhes da Manutenção</Label>
                    <Textarea
                      id="maintenanceDetails"
                      value={formState.data.maintenanceDetails || ''}
                      onChange={(e) => updateField('maintenanceDetails', e.target.value)}
                      placeholder="Descreva as necessidades de manutenção"
                      rows={2}
                    />
                  </div>
                </ConditionalField>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Revisão e Envio</h2>
              <p className="text-muted-foreground">Confirme todas as informações antes de enviar</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Data:</strong> {formState.data.date}</div>
                  <div><strong>Horário:</strong> {formState.data.startTime} - {formState.data.endTime}</div>
                  <div><strong>Pessoas:</strong> {formState.data.attendees}</div>
                  <div><strong>Solicitante:</strong> {formState.data.applicantName}</div>
                  <div><strong>Telefone:</strong> {formState.data.applicantPhone}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Tipo:</strong> {formState.data.eventType}</div>
                  <div><strong>Título:</strong> {formState.data.eventTitle}</div>
                  <div><strong>Descrição:</strong> {formState.data.eventDescription}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração do Auditório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Equipamentos:</h4>
                    <div className="space-y-1">
                      {formState.data.needsSoundSystem && <Badge variant="secondary">Sistema de Som</Badge>}
                      {formState.data.needsProjector && <Badge variant="secondary">Projetor</Badge>}
                      {formState.data.needsLighting && <Badge variant="secondary">Iluminação</Badge>}
                      {formState.data.needsStageSetup && <Badge variant="secondary">Montagem de Palco</Badge>}
                      {formState.data.needsRecording && <Badge variant="secondary">Gravação</Badge>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Serviços:</h4>
                    <div className="space-y-1">
                      {formState.data.needsCatering && <Badge variant="secondary">Alimentação</Badge>}
                      {formState.data.needsSecurity && <Badge variant="secondary">Segurança</Badge>}
                      {formState.data.accessControlNeeded && <Badge variant="secondary">Controle de Acesso</Badge>}
                      {formState.data.needsSpecialCleaning && <Badge variant="secondary">Limpeza Especial</Badge>}
                      {formState.data.maintenanceRequired && <Badge variant="secondary">Manutenção</Badge>}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Configuração da Sala:</h4>
                  <Badge variant="outline">{formState.data.roomConfiguration}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto">
                <CheckCircle className="w-4 h-4 mr-2" />
                Enviar Reserva do Auditório
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Reserva de Auditório</h1>
      <ProgressIndicator currentStep={currentStep} totalSteps={4} />
      <Card className="mt-6">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Corrija os seguintes erros:</h4>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            {currentStep < 4 && (
              <Button onClick={nextStep} className="ml-auto">
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservaAuditorioForm;
