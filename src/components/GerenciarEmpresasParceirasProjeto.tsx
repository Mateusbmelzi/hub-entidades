import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, X, Check, Plus, ExternalLink } from 'lucide-react';
import { useProjetoEmpresasParceiras } from '@/hooks/useProjetoEmpresasParceiras';
import { useEntidadeEmpresasParceiras } from '@/hooks/useEntidadeEmpresasParceiras';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { EmpresaParceira } from '@/types/empresa-parceira';

interface GerenciarEmpresasParceirasProjetoProps {
  projetoId: number | string;
  entidadeId: number;
  onSuccess?: () => void;
}

export const GerenciarEmpresasParceirasProjeto: React.FC<GerenciarEmpresasParceirasProjetoProps> = ({
  projetoId,
  entidadeId,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    empresasAssociadas: empresasProjeto,
    loading: loadingProjeto,
    associarEmpresa,
    desassociarEmpresa,
    isEmpresaAssociada,
    refetch: refetchProjeto,
  } = useProjetoEmpresasParceiras(projetoId);

  const {
    empresasAssociadas: empresasEntidade,
    loading: loadingEntidade,
  } = useEntidadeEmpresasParceiras(entidadeId);

  const empresasFiltradas = empresasEntidade.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssociarEmpresa = async (empresaId: number) => {
    const success = await associarEmpresa(empresaId);
    if (success) {
      refetchProjeto();
      onSuccess?.();
    }
  };

  const handleDesassociarEmpresa = async (empresaId: number) => {
    const success = await desassociarEmpresa(empresaId);
    if (success) {
      refetchProjeto();
      onSuccess?.();
    }
  };

  if (loadingProjeto || loadingEntidade) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      {empresasEntidade.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Lista simples de empresas */}
      {empresasEntidade.length > 0 ? (
        empresasFiltradas.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {empresasFiltradas.map((empresa) => {
              const associada = isEmpresaAssociada(empresa.id);
              return (
                <div
                  key={empresa.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    associada
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'
                  }`}
                >
                  {empresa.logo ? (
                    <img
                      src={empresa.logo}
                      alt={empresa.nome}
                      className="w-12 h-12 object-contain rounded border border-gray-200 bg-white p-1 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {empresa.nome}
                    </p>
                    {empresa.descricao && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {empresa.descricao}
                      </p>
                    )}
                  </div>
                  {associada ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDesassociarEmpresa(empresa.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => handleAssociarEmpresa(empresa.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Nenhuma empresa encontrada</p>
            <p className="text-xs text-gray-500 mt-1">Tente buscar com outro termo</p>
          </div>
        )
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-base font-semibold text-gray-800 mb-2">
            Sua entidade não possui empresas parceiras
          </p>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Para associar empresas parceiras a este projeto, você precisa primeiro adicionar empresas parceiras à sua entidade.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate(`/entidades/${entidadeId}?section=areas`);
            }}
            className="bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Adicionar Empresas à Entidade
          </Button>
        </div>
      )}
    </div>
  );
};

