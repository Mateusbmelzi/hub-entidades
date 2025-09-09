import React from 'react';
import { useEmpresasParceiras } from '../hooks/useEmpresasParceiras';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Mail, Phone, Building2 } from 'lucide-react';

interface EmpresasParceirasDisplayProps {
  entidadeId: number;
  className?: string;
}

export function EmpresasParceirasDisplay({ entidadeId, className }: EmpresasParceirasDisplayProps) {
  const { empresas, loading, error } = useEmpresasParceiras(entidadeId);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Erro ao carregar empresas parceiras
      </div>
    );
  }

  if (!empresas || empresas.length === 0) {
    return null; // Não exibe nada se não há empresas
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-red-600" />
          Empresas Parceiras
          <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200">
            {empresas.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {empresas.map((empresa) => (
          <div key={empresa.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Logo da empresa */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
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
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Informações da empresa */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 truncate">{empresa.nome}</h4>
                {empresa.site_url && (
                  <a
                    href={empresa.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 hover:underline font-semibold text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              {empresa.descricao && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{empresa.descricao}</p>
              )}

              {empresa.area_atuacao.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {empresa.area_atuacao.slice(0, 2).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                      {area}
                    </Badge>
                  ))}
                  {empresa.area_atuacao.length > 2 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                      +{empresa.area_atuacao.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}