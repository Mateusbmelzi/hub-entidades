import React from 'react';
import { useEntidadeEmpresasParceiras } from '@/hooks/useEntidadeEmpresasParceiras';
import { Building2 } from 'lucide-react';

interface EmpresasParceirasLogosProps {
  entidadeId: number;
  className?: string;
  maxLogos?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const EmpresasParceirasLogos: React.FC<EmpresasParceirasLogosProps> = ({
  entidadeId,
  className = '',
  maxLogos = 5,
  size = 'sm'
}) => {
  const { empresasAssociadas, loading } = useEntidadeEmpresasParceiras(entidadeId);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`bg-gray-200 rounded-full animate-pulse ${
                size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!empresasAssociadas || empresasAssociadas.length === 0) {
    return null;
  }

  const logosToShow = empresasAssociadas.slice(0, maxLogos);
  const remainingCount = empresasAssociadas.length - maxLogos;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-1">
        {logosToShow.map((empresa) => (
          <div
            key={empresa.id}
            className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-sm overflow-hidden`}
            title={empresa.nome}
          >
            {empresa.logo ? (
              <img
                src={empresa.logo}
                alt={`Logo ${empresa.nome}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg class="w-3/4 h-3/4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Building2 className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center`}>
          <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-medium text-gray-600`}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};
