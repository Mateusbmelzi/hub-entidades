// Constantes para áreas de atuação organizadas
export const AREAS_ATUACAO = [
  "Consultoria e Negócios",
  "Tecnologia", 
  "Finanças",
  "Direito",
  "Educação",
  "Cultura",
  "Entretenimento",
  "Humanidades",
  "Esportes",
  "Mercado de Luxo",
  "Representatividade e Integração",
  "Saúde"
] as const;

export type AreaAtuacao = typeof AREAS_ATUACAO[number];

// Mapeamento de cores para cada área usando a nova paleta de cores
export const AREA_COLORS: Record<AreaAtuacao, string> = {
  'Consultoria e Negócios': 'bg-insper-red',
  'Tecnologia': 'bg-insper-blue',
  'Finanças': 'bg-insper-green',
  'Direito': 'bg-insper-purple',
  'Educação': 'bg-insper-yellow',
  'Cultura': 'bg-insper-purple',
  'Entretenimento': 'bg-insper-yellow',
  'Humanidades': 'bg-insper-green',
  'Esportes': 'bg-insper-blue',
  'Mercado de Luxo': 'bg-insper-red',
  'Representatividade e Integração': 'bg-insper-purple',
  'Saúde': 'bg-insper-green',
};

// Cores de texto correspondentes para cada área
export const AREA_TEXT_COLORS: Record<AreaAtuacao, string> = {
  'Consultoria e Negócios': 'text-white',
  'Tecnologia': 'text-white',
  'Finanças': 'text-white',
  'Direito': 'text-white',
  'Educação': 'text-insper-black',
  'Cultura': 'text-white',
  'Entretenimento': 'text-insper-black',
  'Humanidades': 'text-white',
  'Esportes': 'text-white',
  'Mercado de Luxo': 'text-white',
  'Representatividade e Integração': 'text-white',
  'Saúde': 'text-white',
};

// Função para obter a cor de uma área
export const getAreaColor = (area: string): string => {
  return AREA_COLORS[area as AreaAtuacao] || 'bg-insper-light-gray-1';
};

// Função para obter a cor do texto de uma área
export const getAreaTextColor = (area: string): string => {
  return AREA_TEXT_COLORS[area as AreaAtuacao] || 'text-insper-black';
};

// Função para obter a cor da primeira área de um array
export const getFirstAreaColor = (areas: string[] | string | null): string => {
  if (!areas) return 'bg-insper-light-gray-1';
  
  const areaArray = Array.isArray(areas) ? areas : [areas];
  const firstArea = areaArray.find(area => area && area.trim());
  
  if (!firstArea) return 'bg-insper-light-gray-1';
  
  return getAreaColor(firstArea);
};

// Função para obter a cor do texto da primeira área de um array
export const getFirstAreaTextColor = (areas: string[] | string | null): string => {
  if (!areas) return 'text-insper-black';
  
  const areaArray = Array.isArray(areas) ? areas : [areas];
  const firstArea = areaArray.find(area => area && area.trim());
  
  if (!firstArea) return 'text-insper-black';
  
  return getAreaTextColor(firstArea);
}; 