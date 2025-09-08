// Tipos para reserva de salas baseado no fluxograma

export type SalaEventType = 
  | 'palestra_insper' // Palestra aberta aos alunos Insper
  | 'palestra_externa' // Palestra aberta ao público externo
  | 'capacitacao' // Capacitação
  | 'reuniao' // Reunião
  | 'processo_seletivo'; // Processo Seletivo

export interface SalaReservationData {
  // Dados básicos obrigatórios
  data: string;
  horarioInicio: string;
  horarioTermino: string;
  quantidadePessoas: number;
  nomeCompletoSolicitante: string;
  celularComDDD: string;
  
  // Dados específicos do evento
  motivoReserva: SalaEventType;
  tituloEvento: string;
  descricaoEvento: string;
  
  // Campos condicionais
  temPalestranteExterno?: boolean;
  palestranteExterno?: {
    nomeCompleto: string;
    apresentacao: string;
    ehPessoaPublica: boolean;
  };
  
  necessidadeSalaPlana?: boolean;
  motivoSalaPlana?: string;
}

export interface SalaReservationFormState {
  currentStep: number;
  data: Partial<SalaReservationData>;
  errors: Record<string, string>;
  isLoading: boolean;
}

// Opções para o dropdown de tipo de evento
export const SALA_EVENT_OPTIONS = [
  { value: 'palestra_insper', label: 'Palestra aberta aos alunos Insper' },
  { value: 'palestra_externa', label: 'Palestra aberta ao público externo' },
  { value: 'capacitacao', label: 'Capacitação' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'processo_seletivo', label: 'Processo Seletivo' }
] as const;
