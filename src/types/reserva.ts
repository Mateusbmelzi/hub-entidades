// Tipos para o sistema de reservas

export type TipoReserva = 'sala' | 'auditorio';

export type StatusReserva = 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';

// Motivos específicos para reserva de auditório
export type MotivoReservaAuditorio = 'palestra_alunos_insper' | 'palestra_publico_externo';

// Motivos gerais para reserva de sala
export type MotivoReservaSala = 'capacitacao' | 'reuniao' | 'processo_seletivo';

export interface Reserva {
  // Identificação
  id: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  profile_id: string;
  entidade_id?: number;
  evento_id: string; // Obrigatório
  
  // Tipo de reserva
  tipo_reserva: TipoReserva;
  
  // Dados básicos da reserva
  data_reserva: string;
  horario_inicio: string;
  horario_termino: string;
  quantidade_pessoas: number;
  
  // Dados do solicitante
  nome_solicitante: string;
  telefone_solicitante: string;
  
  // Motivo da reserva (seguindo o fluxo)
  motivo_reserva?: MotivoReservaAuditorio | MotivoReservaSala;
  titulo_evento_capacitacao?: string;
  descricao_pautas_evento_capacitacao?: string;
  
  // Campos específicos para auditório
  descricao_programacao_evento?: string;
  
  // Campos específicos para palestrante externo
  tem_palestrante_externo?: boolean;
  nome_palestrante_externo?: string;
  apresentacao_palestrante_externo?: string;
  eh_pessoa_publica?: boolean;
  
  // Campos para apoio externo
  ha_apoio_externo?: boolean;
  como_ajudara_organizacao?: string;
  
  // Campos específicos para sala
  necessidade_sala_plana?: boolean;
  motivo_sala_plana?: string;
  
  // Campos específicos para auditório
  precisa_sistema_som?: boolean;
  precisa_projetor?: boolean;
  precisa_iluminacao_especial?: boolean;
  precisa_montagem_palco?: boolean;
  precisa_gravacao?: boolean;
  motivo_gravacao?: string;
  equipamentos_adicionais?: string;
  precisa_suporte_tecnico?: boolean;
  detalhes_suporte_tecnico?: string;
  
  // Configuração do espaço
  configuracao_sala?: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha';
  motivo_configuracao_sala?: string;
  
  // Alimentação
  precisa_alimentacao?: boolean;
  detalhes_alimentacao?: string;
  custo_estimado_alimentacao?: number;
  
  // Segurança e controle de acesso
  precisa_seguranca?: boolean;
  detalhes_seguranca?: string;
  precisa_controle_acesso?: boolean;
  detalhes_controle_acesso?: string;
  
  // Limpeza e manutenção
  precisa_limpeza_especial?: boolean;
  detalhes_limpeza_especial?: string;
  precisa_manutencao?: boolean;
  detalhes_manutencao?: string;
  
  // Status da reserva
  status: StatusReserva;
  comentario_aprovacao?: string;
  data_aprovacao?: string;
  aprovador_email?: string;
  
  // Sala associada (quando aprovada)
  sala_id?: number;
  sala_nome?: string;
  sala_predio?: string;
  sala_andar?: string;
  
  // Observações adicionais
  observacoes?: string;
}

export interface ReservaDetalhada extends Reserva {
  // Dados relacionados
  nome_usuario?: string;
  curso_usuario?: string;
  celular_usuario?: string;
  nome_entidade?: string;
  contato_entidade?: string;
  email_entidade?: string;
  nome_evento?: string;
  descricao_evento?: string;
}

export interface ReservaFormData {
  // Dados básicos
  evento_id?: string; // Opcional - será criado após aprovação
  tipo_reserva: TipoReserva;
  data_reserva: string;
  horario_inicio: string;
  horario_termino: string;
  quantidade_pessoas: number;
  nome_solicitante: string;
  telefone_solicitante: string;
  
  // Motivo da reserva (seguindo o fluxo)
  motivo_reserva?: MotivoReservaAuditorio | MotivoReservaSala;
  titulo_evento_capacitacao?: string;
  descricao_pautas_evento_capacitacao?: string;
  
  // Campos específicos para auditório
  descricao_programacao_evento?: string;
  
  // Campos específicos para palestrante externo
  tem_palestrante_externo?: boolean;
  nome_palestrante_externo?: string;
  apresentacao_palestrante_externo?: string;
  eh_pessoa_publica?: boolean;
  
  // Campos para apoio externo
  ha_apoio_externo?: boolean;
  como_ajudara_organizacao?: string;
  
  // Campos específicos para sala
  necessidade_sala_plana?: boolean;
  motivo_sala_plana?: string;
  
  // Campos específicos para auditório
  precisa_sistema_som?: boolean;
  precisa_projetor?: boolean;
  precisa_iluminacao_especial?: boolean;
  precisa_montagem_palco?: boolean;
  precisa_gravacao?: boolean;
  motivo_gravacao?: string;
  equipamentos_adicionais?: string;
  precisa_suporte_tecnico?: boolean;
  detalhes_suporte_tecnico?: string;
  
  // Configuração do espaço
  configuracao_sala?: 'Teatro' | 'U' | 'Mesas' | 'Cadeiras em linha';
  motivo_configuracao_sala?: string;
  
  // Alimentação
  precisa_alimentacao?: boolean;
  detalhes_alimentacao?: string;
  custo_estimado_alimentacao?: number;
  
  // Segurança e controle de acesso
  precisa_seguranca?: boolean;
  detalhes_seguranca?: string;
  precisa_controle_acesso?: boolean;
  detalhes_controle_acesso?: string;
  
  // Limpeza e manutenção
  precisa_limpeza_especial?: boolean;
  detalhes_limpeza_especial?: string;
  precisa_manutencao?: boolean;
  detalhes_manutencao?: string;
  
  // Observações
  observacoes?: string;
}

export interface AprovacaoReserva {
  reserva_id: string;
  aprovador_email: string;
  comentario?: string;
}

// Labels para status
export const STATUS_LABELS: Record<StatusReserva, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  cancelada: 'Cancelada'
};

// Labels para tipo de reserva
export const TIPO_RESERVA_LABELS: Record<TipoReserva, string> = {
  sala: 'Sala de Aula',
  auditorio: 'Auditório'
};

// Labels para motivos de reserva de auditório
export const MOTIVO_AUDITORIO_LABELS: Record<MotivoReservaAuditorio, string> = {
  palestra_alunos_insper: 'Palestra aberta aos alunos Insper',
  palestra_publico_externo: 'Palestra aberta ao público externo'
};

// Labels para motivos de reserva de sala
export const MOTIVO_SALA_LABELS: Record<MotivoReservaSala, string> = {
  capacitacao: 'Capacitação',
  reuniao: 'Reunião',
  processo_seletivo: 'Processo Seletivo'
};
