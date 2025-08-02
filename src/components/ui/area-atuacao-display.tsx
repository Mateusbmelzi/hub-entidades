import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AreaAtuacaoDisplayProps {
  area_atuacao: string | null;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export const AreaAtuacaoDisplay: React.FC<AreaAtuacaoDisplayProps> = ({
  area_atuacao,
  variant = 'secondary',
  className = ''
}) => {
  if (!area_atuacao || !area_atuacao.trim()) return null;

  return (
    <Badge
      variant={variant}
      className={`text-xs ${className}`}
    >
      {area_atuacao}
    </Badge>
  );
};

// Componente para exibir apenas a primeira área (mantido para compatibilidade)
export const AreaAtuacaoFirst: React.FC<AreaAtuacaoDisplayProps> = ({
  area_atuacao,
  variant = 'secondary',
  className = ''
}) => {
  if (!area_atuacao) return null;
  
  // Se for array, pegar o primeiro elemento
  const firstArea = Array.isArray(area_atuacao) 
    ? area_atuacao[0] 
    : area_atuacao;
    
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
  
  // Se for array, juntar com vírgula
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