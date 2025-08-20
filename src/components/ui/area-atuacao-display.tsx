import React from 'react';
import { Badge } from '@/components/ui/badge';
import { parseAreasAtuacao, getFirstArea } from '@/lib/area-utils';

interface AreaAtuacaoDisplayProps {
  area_atuacao: string[] | string | null;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
  compact?: boolean; // Nova prop para versão mais compacta
}

export const AreaAtuacaoDisplay: React.FC<AreaAtuacaoDisplayProps> = ({
  area_atuacao,
  variant = 'secondary',
  className = '',
  compact = false
}) => {
  if (!area_atuacao) return null;
  
  // Converter para array usando a função utilitária
  const areas = parseAreasAtuacao(area_atuacao);
  const validAreas = areas.filter(area => area && area.trim());
  
  if (validAreas.length === 0) return null;

  // Se for compacto e tiver muitas áreas, mostrar apenas as primeiras + contador
  if (compact && validAreas.length > 3) {
    const displayedAreas = validAreas.slice(0, 2);
    const remainingCount = validAreas.length - 2;
    
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {displayedAreas.map((area, index) => (
          <Badge
            key={`${area}-${index}`}
            variant={variant}
            className="text-xs px-2 py-0.5"
          >
            {area}
          </Badge>
        ))}
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 text-gray-600 border-gray-300"
        >
          +{remainingCount} mais
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {validAreas.map((area, index) => (
        <Badge
          key={`${area}-${index}`}
          variant={variant}
          className="text-xs px-2 py-0.5"
        >
          {area}
        </Badge>
      ))}
    </div>
  );
};

// Componente para exibir apenas a primeira área (mantido para compatibilidade)
export const AreaAtuacaoFirst: React.FC<AreaAtuacaoDisplayProps> = ({
  area_atuacao,
  variant = 'secondary',
  className = ''
}) => {
  if (!area_atuacao) return null;
  
  // Usar a função utilitária para obter a primeira área
  const firstArea = getFirstArea(area_atuacao);
    
  if (!firstArea || !firstArea.trim()) return null;

  return (
    <Badge
      variant={variant}
      className={`text-xs ${className}`}
    >
      {firstArea}
    </Badge>
  );
};

// Componente para exibir como string (mantido para compatibilidade)
export const AreaAtuacaoString: React.FC<AreaAtuacaoDisplayProps> = ({
  area_atuacao,
  variant = 'secondary',
  className = ''
}) => {
  if (!area_atuacao) return null;
  
  // Se for array, juntar com vírgula; se for string, usar diretamente
  const areaString = Array.isArray(area_atuacao) 
    ? area_atuacao.join(', ') 
    : area_atuacao;
    
  if (!areaString || !areaString.trim()) return null;

  return (
    <Badge
      variant={variant}
      className={`text-xs ${className}`}
    >
      {areaString}
    </Badge>
  );
}; 