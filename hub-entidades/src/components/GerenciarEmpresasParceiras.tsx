import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Building2, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmpresasParceiras } from '@/hooks/useEmpresasParceiras';
import { useEntidadeEmpresasParceiras } from '@/hooks/useEntidadeEmpresasParceiras';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { CreateEmpresaParceiraData } from '@/types/empresa-parceira';
import { EMPRESA_VALIDATION, EMPRESA_ERROR_MESSAGES } from '@/types/empresa-parceira';
import { UploadLogoEmpresa } from '@/components/UploadLogoEmpresa';

interface GerenciarEmpresasParceirasProps {
  entidadeId: number;
  entidadeNome: string;
  onSuccess?: () => void;
}

export const GerenciarEmpresasParceiras: React.FC<GerenciarEmpresasParceirasProps> = ({
  entidadeId,
  entidadeNome,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const {
    empresas: todasEmpresas,
    loading: loadingEmpresas,
    createEmpresa,
  } = useEmpresasParceiras();

  const {
    empresasAssociadas,
    loading: loadingAssociadas,
    associarEmpresa,
    desassociarEmpresa,
    isEmpresaAssociada,
    refetch: refetchAssociadas,
  } = useEntidadeEmpresasParceiras(entidadeId);

  const empresasFiltradas = todasEmpresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssociarEmpresa = async (empresaId: number) => {
    const success = await associarEmpresa(empresaId);
    if (success) {
      onSuccess?.();
    }
  };

  const handleDesassociarEmpresa = async (empresaId: number) => {
    const success = await desassociarEmpresa(empresaId);
    if (success) {
      onSuccess?.();
    }
  };

  const handleCreateEmpresa = async (data: CreateEmpresaParceiraData) => {
    console.log('🎯 handleCreateEmpresa chamado com:', data);
    const novaEmpresa = await createEmpresa(data);
    console.log('📋 Resultado da criação:', novaEmpresa);
    if (novaEmpresa) {
      console.log('✅ Empresa criada, fechando dialog');
      setIsCreateDialogOpen(false);
      onSuccess?.();
    } else {
      console.log('❌ Falha na criação da empresa');
    }
  };


  if (loadingEmpresas || loadingAssociadas) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Gerenciar Empresas Parceiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Empresas Parceiras
            </CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {empresasAssociadas.length} {empresasAssociadas.length === 1 ? 'empresa' : 'empresas'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
                  Gerenciar
                </>
              )}
            </Button>
            {isExpanded && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa Parceira</DialogTitle>
                  </DialogHeader>
                  <CreateEmpresaForm
                    onSubmit={handleCreateEmpresa}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {empresasFiltradas.map((empresa) => {
              const isAssociada = isEmpresaAssociada(empresa.id);
              
              return (
                <div key={empresa.id} className="relative group">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          {empresa.logo ? (
                            <img
                              src={empresa.logo}
                              alt={`Logo ${empresa.nome}`}
                              className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-lg group-hover:shadow-xl cursor-pointer"
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
                              onClick={() => {
                                if (empresa.link) {
                                  window.open(empresa.link, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-300 transition-colors shadow-lg group-hover:shadow-xl cursor-pointer"
                              onClick={() => {
                                if (empresa.link) {
                                  window.open(empresa.link, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              <Building2 className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Badge de status */}
                          {isAssociada && (
                            <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full p-1">
                              <div className="h-3 w-3 rounded-full bg-white"></div>
                            </div>
                          )}
                          
                          {/* Ícone de link externo */}
                          {empresa.link && (
                            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          )}
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
                          {isAssociada && (
                            <p className="text-xs text-green-600 mt-1">✓ Associada</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Botões de ação */}
                  <div className="absolute -top-2 -left-2 flex gap-1">
                    {isAssociada ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDesassociarEmpresa(empresa.id)}
                        className="h-6 w-6 p-0 bg-white shadow-md hover:bg-red-50 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAssociarEmpresa(empresa.id)}
                        className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white shadow-md"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {empresasFiltradas.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa disponível'}
              </p>
            </div>
          )}
        </div>
        </CardContent>
      )}
    </Card>
  );
};

interface CreateEmpresaFormProps {
  onSubmit: (data: CreateEmpresaParceiraData) => void;
  onCancel: () => void;
}

const CreateEmpresaForm: React.FC<CreateEmpresaFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateEmpresaParceiraData>({
    nome: '',
    descricao: '',
    link: '',
    logo: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEmpresaParceiraData, string>>>({});

  const validateForm = (): boolean => {
    console.log('🔍 Validando formulário com dados:', formData);
    const newErrors: Partial<Record<keyof CreateEmpresaParceiraData, string>> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = EMPRESA_ERROR_MESSAGES.NOME_REQUIRED;
      console.log('❌ Nome vazio');
    } else if (formData.nome.length < EMPRESA_VALIDATION.NOME_MIN_LENGTH) {
      newErrors.nome = EMPRESA_ERROR_MESSAGES.NOME_TOO_SHORT;
      console.log('❌ Nome muito curto');
    } else if (formData.nome.length > EMPRESA_VALIDATION.NOME_MAX_LENGTH) {
      newErrors.nome = EMPRESA_ERROR_MESSAGES.NOME_TOO_LONG;
      console.log('❌ Nome muito longo');
    } else {
      console.log('✅ Nome válido');
    }

    if (formData.descricao && formData.descricao.length > EMPRESA_VALIDATION.DESCRICAO_MAX_LENGTH) {
      newErrors.descricao = EMPRESA_ERROR_MESSAGES.DESCRICAO_TOO_LONG;
      console.log('❌ Descrição muito longa');
    }

    if (formData.link && formData.link.length > EMPRESA_VALIDATION.LINK_MAX_LENGTH) {
      newErrors.link = EMPRESA_ERROR_MESSAGES.LINK_TOO_LONG;
      console.log('❌ Link muito longo');
    }

    if (formData.logo && formData.logo.length > EMPRESA_VALIDATION.LOGO_MAX_LENGTH) {
      newErrors.logo = EMPRESA_ERROR_MESSAGES.LOGO_TOO_LONG;
      console.log('❌ Logo muito longo');
    }

    console.log('📋 Erros encontrados:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Formulário válido:', isValid);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Formulário submetido:', formData);
    console.log('🔍 Validando formulário...');
    if (validateForm()) {
      console.log('✅ Validação passou, enviando dados');
      onSubmit(formData);
    } else {
      console.log('❌ Validação falhou');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Empresa *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          className={errors.nome ? 'border-red-500' : ''}
          placeholder="Digite o nome da empresa"
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          className={errors.descricao ? 'border-red-500' : ''}
          placeholder="Descrição da empresa"
          rows={3}
        />
        {errors.descricao && (
          <p className="text-sm text-red-500">{errors.descricao}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link do Site</Label>
        <Input
          id="link"
          type="url"
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          className={errors.link ? 'border-red-500' : ''}
          placeholder="https://exemplo.com"
        />
        {errors.link && (
          <p className="text-sm text-red-500">{errors.link}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Logo da Empresa</Label>
        <UploadLogoEmpresa
          onLogoUploaded={(logoUrl) => setFormData(prev => ({ ...prev, logo: logoUrl }))}
          currentLogo={formData.logo}
        />
        {formData.logo && (
          <div className="mt-2">
            <Label htmlFor="logo-url">URL do Logo (opcional)</Label>
            <Input
              id="logo-url"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              className={errors.logo ? 'border-red-500' : ''}
              placeholder="https://exemplo.com/logo.png"
            />
            {errors.logo && (
              <p className="text-sm text-red-500">{errors.logo}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Criar Empresa
        </Button>
      </div>
    </form>
  );
};
