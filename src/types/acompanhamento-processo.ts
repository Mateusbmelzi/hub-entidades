export interface FaseProcessoSeletivo {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  entidade_id: number;
  tipo: string; // Coluna obrigatória que estava faltando
  data_inicio?: string;
  data_fim?: string;
  ativa?: boolean;
  criterios_aprovacao?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface InscricaoFasePS {
  id: string;
  inscricao_id: string;
  fase_id: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  respostas_formulario: Record<string, any>;
  feedback?: string;
  created_at: string;
  updated_at: string;
  fase?: FaseProcessoSeletivo;
}

export interface InscricaoProcessoUsuario {
  id: string;
  entidade_id: number;
  estudante_id: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
  updated_at: string;
  nome_estudante: string;
  email_estudante: string;
  curso_estudante: string;
  semestre_estudante: number;
  respostas_formulario: Record<string, any>;
  fase_atual?: FaseProcessoSeletivo;
  status_fase?: 'pendente' | 'aprovado' | 'reprovado';
  historico_fases?: InscricaoFasePS[];
  reserva_atribuida?: {
    id: string;
    data_reserva: string;
    horario_inicio: string;
    horario_termino: string;
    sala_nome?: string;
    sala_predio?: string;
    sala_andar?: string;
  } | null;
  inscricao_fase_atual_id?: string | null;
}

export interface MetricasFases {
  totalCandidatos: number;
  emProcesso: number;
  taxaAprovacao: number;
  tempoMedio: number;
  candidatosPorFase: Record<string, number>;
  statusPorFase: Record<string, {
    pendentes: number;
    aprovados: number;
    reprovados: number;
  }>;
}

export interface HistoricoFase {
  id: string;
  inscricao_id: string;
  fase_id: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  feedback?: string;
  created_at: string;
  fase: {
    nome: string;
    ordem: number;
  };
}

export interface NotaAvaliacao {
  id: string;
  candidato_id: string;
  avaliador_id: string;
  nota: number;
  comentario?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidatoCardData {
  id: string;
  nome: string;
  email: string;
  curso: string;
  semestre: number;
  fase_atual: string;
  status_fase: 'pendente' | 'aprovado' | 'reprovado';
  data_inscricao: string;
  tempo_na_fase: number; // em dias
  respostas_formulario: Record<string, any>;
}
