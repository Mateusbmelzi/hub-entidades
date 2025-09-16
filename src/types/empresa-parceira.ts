// Tipos para o sistema de empresas parceiras

export interface EmpresaParceira {
  id: number;
  created_at: string;
  updated_at: string;
  nome: string;
  descricao?: string;
  link?: string;
  logo?: string;
}

export interface EntidadeEmpresaParceira {
  id: number;
  created_at: string;
  updated_at: string;
  entidade_id: number;
  empresa_parceira_id: number;
}

export interface EmpresaParceiraWithAssociation extends EmpresaParceira {
  entidade_empresa_parceira?: EntidadeEmpresaParceira;
}

export interface CreateEmpresaParceiraData {
  nome: string;
  descricao?: string;
  link?: string;
  logo?: string;
}

export interface UpdateEmpresaParceiraData {
  nome?: string;
  descricao?: string;
  link?: string;
  logo?: string;
}

export interface AssociateEmpresaData {
  entidade_id: number;
  empresa_parceira_id: number;
}

export interface DisassociateEmpresaData {
  entidade_id: number;
  empresa_parceira_id: number;
}

// Labels para validação
export const EMPRESA_VALIDATION = {
  NOME_MIN_LENGTH: 2,
  NOME_MAX_LENGTH: 100,
  DESCRICAO_MAX_LENGTH: 500,
  LINK_MAX_LENGTH: 255,
  LOGO_MAX_LENGTH: 500,
} as const;

// Mensagens de erro
export const EMPRESA_ERROR_MESSAGES = {
  NOME_REQUIRED: 'Nome da empresa é obrigatório',
  NOME_TOO_SHORT: `Nome deve ter pelo menos ${EMPRESA_VALIDATION.NOME_MIN_LENGTH} caracteres`,
  NOME_TOO_LONG: `Nome não pode ter mais que ${EMPRESA_VALIDATION.NOME_MAX_LENGTH} caracteres`,
  DESCRICAO_TOO_LONG: `Descrição não pode ter mais que ${EMPRESA_VALIDATION.DESCRICAO_MAX_LENGTH} caracteres`,
  LINK_TOO_LONG: `Link não pode ter mais que ${EMPRESA_VALIDATION.LINK_MAX_LENGTH} caracteres`,
  LOGO_TOO_LONG: `URL do logo não pode ter mais que ${EMPRESA_VALIDATION.LOGO_MAX_LENGTH} caracteres`,
  LINK_INVALID: 'Link deve ser uma URL válida',
} as const;
