import React from 'react';
import { useEmpresasParceirasEntidade } from '../hooks/useEmpresasParceirasEntidade';
import { Building2 } from 'lucide-react';

interface EmpresasParceirasLogosProps {
  entidadeId: number;
  className?: string;
  maxLogos?: number;
}

export function EmpresasParceirasLogos({ 
  entidadeId, 
  className = '', 
  maxLogos = 3 
}: EmpresasParceirasLogosProps) {
  const { empresas, loading } = useEmpresasParceirasEntidade(entidadeId);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!empresas || empresas.length === 0) {
    return null;
  }

  const empresasToShow = empresas.slice(0, maxLogos);
  const hasMore = empresas.length > maxLogos;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {empresasToShow.map((empresa, index) => (
        <div
          key={empresa.id}
          className="relative group"
          title={empresa.nome}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm hover:shadow-md transition-shadow duration-200">
            {empresa.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={`Logo ${empresa.nome}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {empresa.nome}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">
            +{empresas.length - maxLogos}
          </span>
        </div>
      )}
    </div>
  );
}
