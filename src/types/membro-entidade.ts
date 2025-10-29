// Tipos para o sistema de gestão de membros das organizações estudantis

export interface CargoEntidade {
  id: string;
  entidade_id: number;
  nome: string;
  descricao?: string;
  nivel_hierarquia: number;
  cor?: string;
  created_at: string;
  updated_at: string;
}

export interface MembroEntidade {
  id: string;
  user_id: string;
  entidade_id: number;
  cargo_id: string;
  data_entrada: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembroEntidadeComDetalhes extends MembroEntidade {
  cargo?: CargoEntidade;
  profile?: {
    id: string;
    nome: string;
    email: string;
    curso?: string;
    semestre?: number;
  };
}

export interface CargoComPermissoes extends CargoEntidade {
  permissoes?: PermissaoCargo[];
  total_membros?: number;
}

export interface PermissaoCargo {
  id: string;
  cargo_id: string;
  permissao: Permissao;
  created_at: string;
}

export type Permissao = 
  | 'gerenciar_membros'
  | 'criar_eventos'
  | 'editar_entidade'
  | 'editar_projetos'
  | 'gerenciar_cargos'
  | 'aprovar_conteudo'
  | 'visualizar';

export interface CreateCargoData {
  entidade_id: number;
  nome: string;
  descricao?: string;
  nivel_hierarquia: number;
  cor?: string;
  permissoes: Permissao[];
}

export interface UpdateCargoData {
  nome?: string;
  descricao?: string;
  nivel_hierarquia?: number;
  cor?: string;
  permissoes?: Permissao[];
}

export interface AddMembroData {
  user_id: string;
  entidade_id: number;
  cargo_id: string;
}

// Labels amigáveis para as permissões
export const PERMISSAO_LABELS: Record<Permissao, string> = {
  gerenciar_membros: 'Gerenciar Membros',
  criar_eventos: 'Criar Eventos',
  editar_entidade: 'Editar Entidade',
  editar_projetos: 'Editar Projetos',
  gerenciar_cargos: 'Gerenciar Cargos',
  aprovar_conteudo: 'Aprovar Conteúdo',
  visualizar: 'Visualizar',
};

// Descrições das permissões
export const PERMISSAO_DESCRIPTIONS: Record<Permissao, string> = {
  gerenciar_membros: 'Pode adicionar, remover e alterar cargos de membros',
  criar_eventos: 'Pode criar e gerenciar eventos da organização estudantil',
  editar_entidade: 'Pode editar informações da organização estudantil',
  editar_projetos: 'Pode criar e editar projetos da organização estudantil',
  gerenciar_cargos: 'Pode criar, editar e remover cargos',
  aprovar_conteudo: 'Pode aprovar conteúdo e solicitações',
  visualizar: 'Pode visualizar informações da organização estudantil',
};

// Cores padrão sugeridas para cargos
export const CARGO_CORES_SUGERIDAS = [
  { nome: 'Roxo', valor: '#9333ea' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Amarelo', valor: '#f59e0b' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Índigo', valor: '#6366f1' },
  { nome: 'Teal', valor: '#14b8a6' },
];

