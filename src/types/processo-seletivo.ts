// Simplificado - seguindo padrão de demonstracoes_interesse
export interface InscricaoProcessoSeletivo {
  id: string;
  entidade_id: number;
  user_id: string;
  nome_estudante: string;
  email_estudante: string;
  curso_estudante?: string;
  semestre_estudante?: number;
  area_interesse?: string;
  mensagem?: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    nome: string;
    curso?: string;
    email: string;
  };
}

export interface FaseProcessoSeletivo {
  id: string;
  entidade_id: number;
  ordem: number;
  nome: string;
  descricao?: string;
  tipo: 'triagem' | 'entrevista' | 'dinamica' | 'case' | 'outro';
  data_inicio?: string;
  data_fim?: string;
  ativa: boolean;
  template_formulario_id?: string; // Template de formulário vinculado a esta fase
  criterios_aprovacao?: {
    tipo: 'manual' | 'automatico';
    regras?: Record<string, any>;
  };
  created_at: string;
  updated_at: string;
}

export interface FormularioFasePS {
  id?: string;
  fase_id: string;
  entidade_id: number;
  ativo: boolean;
  campos_basicos_visiveis: string[];
  campos_personalizados: CampoPersonalizado[];
  created_at?: string;
  updated_at?: string;
}

export interface InscricaoFasePS {
  id: string;
  inscricao_id: string;
  fase_id: string;
  respostas_formulario: Record<string, any>;
  formulario_preenchido: boolean; // Indica se o candidato já preencheu o formulário desta fase
  status: 'pendente' | 'em_avaliacao' | 'aprovado' | 'reprovado';
  avaliacao_automatica?: Record<string, any>;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// Reutilizar do sistema de formulários existente
export interface CampoPersonalizado {
  id: string;
  label: string;
  tipo: 'text' | 'textarea' | 'select' | 'checkbox';
  obrigatorio: boolean;
  opcoes?: string[];
  placeholder?: string;
}


