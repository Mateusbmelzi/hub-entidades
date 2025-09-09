export interface EmpresaParceira {
  id: number;
  entidade_id: number;
  nome: string;
  descricao?: string;
  site_url?: string;
  logo_url?: string;
  email_contato?: string;
  telefone_contato?: string;
  area_atuacao: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaParceiraData {
  entidade_id: number;
  nome: string;
  descricao?: string;
  site_url?: string;
  logo_url?: string;
  email_contato?: string;
  telefone_contato?: string;
  area_atuacao?: string[];
  ativo?: boolean;
}

export interface UpdateEmpresaParceiraData {
  nome?: string;
  descricao?: string;
  site_url?: string;
  logo_url?: string;
  email_contato?: string;
  telefone_contato?: string;
  area_atuacao?: string[];
  ativo?: boolean;
}

export interface EmpresaParceiraWithEntidade extends EmpresaParceira {
  entidade: {
    id: number;
    nome: string;
    areas_atuacao: string[];
  };
}