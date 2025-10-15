// Tipos para o sistema de templates de formulários de inscrição

export type TipoEventoTemplate = 
  | 'palestra_alunos_insper'
  | 'palestra_publico_externo'
  | 'capacitacao'
  | 'reuniao'
  | 'processo_seletivo';

export type CampoBasico = 
  | 'nome_completo'
  | 'email'
  | 'curso'
  | 'semestre'
  | 'telefone';

export interface CampoPersonalizado {
  id: string;
  label: string;
  tipo: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date';
  obrigatorio: boolean;
  placeholder?: string;
  opcoes?: string[]; // Para tipo 'select'
}

export interface TemplateFormulario {
  id: string;
  entidade_id: number;
  nome_template: string;
  descricao?: string;
  tipo_evento?: TipoEventoTemplate;
  campos_basicos_visiveis: CampoBasico[];
  campos_personalizados: CampoPersonalizado[];
  usa_limite_sala: boolean;
  limite_vagas_customizado?: number;
  aceita_lista_espera: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormularioFormData {
  nome_template: string;
  descricao?: string;
  tipo_evento?: TipoEventoTemplate;
  campos_basicos_visiveis: CampoBasico[];
  campos_personalizados: CampoPersonalizado[];
  usa_limite_sala: boolean;
  limite_vagas_customizado?: number;
  aceita_lista_espera: boolean;
}

export const TIPO_EVENTO_LABELS: Record<TipoEventoTemplate, string> = {
  palestra_alunos_insper: 'Palestra aberta aos alunos Insper',
  palestra_publico_externo: 'Palestra aberta ao público externo',
  capacitacao: 'Capacitação',
  reuniao: 'Reunião',
  processo_seletivo: 'Processo Seletivo'
};

export const CAMPOS_BASICOS_LABELS: Record<CampoBasico, string> = {
  nome_completo: 'Nome Completo',
  email: 'Email',
  curso: 'Curso',
  semestre: 'Semestre',
  telefone: 'Telefone'
};

export const TIPOS_CAMPO_LABELS: Record<CampoPersonalizado['tipo'], string> = {
  text: 'Texto Curto',
  textarea: 'Texto Longo',
  select: 'Múltipla Escolha',
  checkbox: 'Sim/Não',
  number: 'Número',
  date: 'Data'
};
