export interface AuditorioReservationFormData {
  // Passo 1: Dados Básicos
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  applicantName: string;
  applicantPhone: string;

  // Passo 2: Detalhes do Evento
  eventType: 'Palestra aberta aos alunos Insper' | 'Palestra aberta ao público externo' | 'Capacitação' | 'Reunião' | 'Processo Seletivo' | '';
  eventTitle: string;
  eventDescription: string;

  // Passo 3: Campos Condicionais para Auditório
  hasExternalSpeaker: boolean;
  externalSpeakerName?: string;
  externalSpeakerPresentation?: string;
  isPublicPerson?: boolean;
  
  // Campos específicos do auditório
  needsSoundSystem: boolean;
  needsProjector: boolean;
  needsLighting: boolean;
  needsStageSetup: boolean;
  needsRecording: boolean;
  recordingReason?: string;
  
  // Equipamentos adicionais
  additionalEquipment?: string;
  technicalSupportNeeded: boolean;
  technicalSupportDetails?: string;
  
  // Configuração do espaço
  roomConfiguration: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha' | '';
  roomConfigurationReason?: string;
  
  // Alimentação (específico do auditório)
  needsCatering: boolean;
  cateringDetails?: string;
  estimatedCateringCost?: number;
  
  // Segurança e controle de acesso
  needsSecurity: boolean;
  securityDetails?: string;
  accessControlNeeded: boolean;
  accessControlDetails?: string;
  
  // Limpeza e manutenção
  needsSpecialCleaning: boolean;
  specialCleaningDetails?: string;
  maintenanceRequired: boolean;
  maintenanceDetails?: string;
}

export interface AuditorioReservationStep {
  step: number;
  title: string;
  description: string;
  fields: string[];
}

export const AUDITORIO_RESERVATION_STEPS: AuditorioReservationStep[] = [
  {
    step: 1,
    title: 'Dados Básicos',
    description: 'Informações sobre data, horário e solicitante',
    fields: ['date', 'startTime', 'endTime', 'attendees', 'applicantName', 'applicantPhone']
  },
  {
    step: 2,
    title: 'Detalhes do Evento',
    description: 'Tipo de evento e descrição',
    fields: ['eventType', 'eventTitle', 'eventDescription']
  },
  {
    step: 3,
    title: 'Configuração do Auditório',
    description: 'Equipamentos, configuração e serviços necessários',
    fields: ['hasExternalSpeaker', 'externalSpeakerName', 'externalSpeakerPresentation', 'isPublicPerson', 'needsSoundSystem', 'needsProjector', 'needsLighting', 'needsStageSetup', 'needsRecording', 'recordingReason', 'additionalEquipment', 'technicalSupportNeeded', 'technicalSupportDetails', 'roomConfiguration', 'roomConfigurationReason', 'needsCatering', 'cateringDetails', 'estimatedCateringCost', 'needsSecurity', 'securityDetails', 'accessControlNeeded', 'accessControlDetails', 'needsSpecialCleaning', 'specialCleaningDetails', 'maintenanceRequired', 'maintenanceDetails']
  },
  {
    step: 4,
    title: 'Revisão e Envio',
    description: 'Confirme todas as informações antes de enviar',
    fields: []
  }
];
