/**
 * Utilitários para trabalhar com áreas de atuação
 */

/**
 * Converte áreas de atuação para array
 * @param area_atuacao - Pode ser string (separada por vírgulas), array de strings, ou null
 * @returns Array de strings com as áreas limpas
 */
export const parseAreasAtuacao = (area_atuacao: string[] | string | null): string[] => {
  if (!area_atuacao) return [];
  
  if (Array.isArray(area_atuacao)) {
    return area_atuacao.filter(area => area && area.trim());
  }
  
  if (typeof area_atuacao === 'string') {
    return area_atuacao
      .split(',')
      .map(area => area.trim())
      .filter(area => area);
  }
  
  return [];
};

/**
 * Converte array de áreas de atuação para string
 * @param areas - Array de strings com as áreas
 * @returns String com as áreas separadas por vírgula
 */
export const stringifyAreasAtuacao = (areas: string[]): string => {
  if (!Array.isArray(areas) || areas.length === 0) return '';
  return areas.filter(area => area && area.trim()).join(', ');
};

/**
 * Obtém a primeira área de atuação
 * @param area_atuacao - Pode ser string (separada por vírgulas), array de strings, ou null
 * @returns Primeira área ou null se não houver
 */
export const getFirstArea = (area_atuacao: string[] | string | null): string | null => {
  const areas = parseAreasAtuacao(area_atuacao);
  return areas.length > 0 ? areas[0] : null;
};

/**
 * Verifica se uma entidade tem uma área específica
 * @param entityAreas - Áreas da entidade (string ou array)
 * @param targetArea - Área a ser verificada
 * @returns true se a entidade tem a área
 */
export const hasArea = (entityAreas: string[] | string | null, targetArea: string): boolean => {
  const areas = parseAreasAtuacao(entityAreas);
  return areas.includes(targetArea);
};
