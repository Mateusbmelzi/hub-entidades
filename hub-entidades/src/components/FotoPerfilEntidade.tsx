import React from 'react';
import { Building, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FotoPerfilEntidadeProps {
  fotoUrl?: string | null;
  nome?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

export const FotoPerfilEntidade: React.FC<FotoPerfilEntidadeProps> = ({
  fotoUrl,
  nome,
  size = 'md',
  className,
  showFallback = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const getInitials = (name: string) => {
    if (!name) return 'EN';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    // Gerar cor baseada no nome da organização
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    if (!name) return colors[0];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Se tem foto URL, tentar mostrar a imagem
  if (fotoUrl) {
    return (
      <div className={cn(
        'rounded-full overflow-hidden bg-gray-100 border-2 border-red-200 flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        <img
          src={fotoUrl}
          alt={`Foto de perfil de ${nome || 'organização'}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Se a imagem falhar ao carregar, mostrar fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center ${getBackgroundColor(nome || '')} text-white font-semibold">
                  ${getInitials(nome || 'EN')}
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // Se não deve mostrar fallback
  if (!showFallback) {
    return (
      <div className={cn(
        'rounded-full overflow-hidden bg-gray-100 border-2 border-red-200 flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        <Camera className="text-gray-400" size={iconSizes[size]} />
      </div>
    );
  }

  // Fallback com iniciais ou ícone
  if (nome) {
    return (
      <div className={cn(
        'rounded-full overflow-hidden flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        getBackgroundColor(nome),
        className
      )}>
        <span className="text-sm font-bold">
          {getInitials(nome)}
        </span>
      </div>
    );
  }

  // Fallback padrão com ícone
  return (
    <div className={cn(
      'rounded-full overflow-hidden bg-gray-100 border-2 border-red-200 flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <Building className="text-gray-400" size={iconSizes[size]} />
    </div>
  );
}; 