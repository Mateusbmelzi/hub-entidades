import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building2 } from 'lucide-react';
import { EmpresasParceiras } from '@/types/empresa-parceira';

interface EmpresasParceirasDisplayProps {
  empresasParceiras: EmpresasParceiras;
}

export const EmpresasParceirasDisplay: React.FC<EmpresasParceirasDisplayProps> = ({
  empresasParceiras,
}) => {
  if (!empresasParceiras || empresasParceiras.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Empresas Parceiras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {empresasParceiras.map((empresa) => (
            <div
              key={empresa.id}
              className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">{empresa.nome}</h4>
                  {empresa.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{empresa.descricao}</p>
                  )}
                  {empresa.site && (
                    <a
                      href={empresa.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visitar Site
                    </a>
                  )}
                </div>
                {empresa.logo_url && (
                  <div className="ml-3">
                    <img
                      src={empresa.logo_url}
                      alt={`Logo ${empresa.nome}`}
                      className="w-12 h-12 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpresasParceirasDisplay;
