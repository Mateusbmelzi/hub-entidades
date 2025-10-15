import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useEntidadeEmpresasParceiras } from '@/hooks/useEntidadeEmpresasParceiras';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmpresaParceira } from '@/types/empresa-parceira';

interface EmpresasParceirasDisplayProps {
  entidadeId: number;
  className?: string;
}

export const EmpresasParceirasDisplay: React.FC<EmpresasParceirasDisplayProps> = ({
  entidadeId,
  className = '',
}) => {
  const { empresasAssociadas, loading, error } = useEntidadeEmpresasParceiras(entidadeId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <Card className={`border-0 shadow-lg bg-white ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Empresas Parceiras
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-0 shadow-lg bg-white ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Empresas Parceiras
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Erro ao carregar empresas parceiras</p>
        </CardContent>
      </Card>
    );
  }

  if (empresasAssociadas.length === 0) {
    return (
      <Card className={`border-0 shadow-lg bg-white ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Empresas Parceiras
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma empresa parceira
            </h3>
            <p className="text-gray-500 text-sm">
              Esta entidade ainda não possui empresas parceiras associadas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 shadow-lg bg-white ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Empresas Parceiras
            </CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {empresasAssociadas.length} {empresasAssociadas.length === 1 ? 'empresa' : 'empresas'}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver empresas
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {empresasAssociadas.map((empresa) => (
              <EmpresaLogoCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface EmpresaLogoCardProps {
  empresa: EmpresaParceira;
}

const EmpresaLogoCard: React.FC<EmpresaLogoCardProps> = ({ empresa }) => {
  const handleClick = () => {
    if (empresa.link) {
      window.open(empresa.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="group cursor-pointer transition-all duration-200 hover:scale-110"
            onClick={handleClick}
          >
            <div className="relative">
              {empresa.logo ? (
                <img
                  src={empresa.logo}
                  alt={`Logo ${empresa.nome}`}
                  className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-lg group-hover:shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-lg group-hover:shadow-xl">
                          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-lg group-hover:shadow-xl">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {empresa.link && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{empresa.nome}</p>
            {empresa.descricao && (
              <p className="text-xs text-gray-600 mt-1 max-w-48">{empresa.descricao}</p>
            )}
            {empresa.link && (
              <p className="text-xs text-red-600 mt-1">Clique para visitar o site</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
