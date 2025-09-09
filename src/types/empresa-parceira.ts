// Tipo para representar uma empresa parceira
export interface EmpresaParceira {
  id: string;
  nome: string;
  site?: string;
  descricao?: string;
  logo_url?: string;
}

// Tipo para o array de empresas parceiras
export type EmpresasParceiras = EmpresaParceira[];
