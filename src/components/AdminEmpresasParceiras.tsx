import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, Plus, Edit, Trash2, ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useEmpresasParceiras } from '@/hooks/useEmpresasParceiras';
import { useToast } from '@/hooks/use-toast';
import { UploadLogoEmpresa } from '@/components/UploadLogoEmpresa';
import type { EmpresaParceira, CreateEmpresaParceiraData, UpdateEmpresaParceiraData } from '@/types/empresa-parceira';

export const AdminEmpresasParceiras: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaParceira | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const {
    empresas,
    loading,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    refetch
  } = useEmpresasParceiras();

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empresa.descricao && empresa.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateEmpresa = async (data: CreateEmpresaParceiraData) => {
    try {
      await createEmpresa(data);
      setIsCreateDialogOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar empresa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEmpresa = async (data: UpdateEmpresaParceiraData) => {
    if (!editingEmpresa) return;
    
    try {
      await updateEmpresa(editingEmpresa.id, data);
      setIsEditDialogOpen(false);
      setEditingEmpresa(null);
      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar empresa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEmpresa = async (empresaId: number) => {
    try {
      await deleteEmpresa(empresaId);
      toast({
        title: 'Sucesso',
        description: 'Empresa removida com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover empresa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (empresa: EmpresaParceira) => {
    setEditingEmpresa(empresa);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Gerenciar Empresas Parceiras
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
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

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              Gerenciar Empresas Parceiras
            </CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {empresas.length} {empresas.length === 1 ? 'empresa' : 'empresas'}
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
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Empresa Parceira</DialogTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empresasFiltradas.map((empresa) => (
                <EmpresaCard
                  key={empresa.id}
                  empresa={empresa}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteEmpresa}
                />
              ))}
            </div>

            {empresasFiltradas.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Empresa Parceira</DialogTitle>
          </DialogHeader>
          {editingEmpresa && (
            <EditEmpresaForm
              empresa={editingEmpresa}
              onSubmit={handleUpdateEmpresa}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingEmpresa(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface EmpresaCardProps {
  empresa: EmpresaParceira;
  onEdit: (empresa: EmpresaParceira) => void;
  onDelete: (empresaId: number) => void;
}

const EmpresaCard: React.FC<EmpresaCardProps> = ({ empresa, onEdit, onDelete }) => {
  return (
    <div className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-red-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {empresa.logo ? (
            <img
              src={empresa.logo}
              alt={`Logo ${empresa.nome}`}
              className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200 group-hover:border-red-300 transition-colors"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-300 transition-colors">
                      <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-red-300 transition-colors">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base group-hover:text-red-700 transition-colors">
            {empresa.nome}
          </h3>
          {empresa.descricao && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {empresa.descricao}
            </p>
          )}
          {empresa.link && (
            <a
              href={empresa.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              Visitar site
            </a>
          )}
        </div>
        
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(empresa)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar empresa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover a empresa "{empresa.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(empresa.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
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
    const newErrors: Partial<Record<keyof CreateEmpresaParceiraData, string>> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
          placeholder="Ex: Google, Microsoft, etc."
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
          rows={3}
          placeholder="Breve descrição da empresa..."
        />
        {errors.descricao && (
          <p className="text-sm text-red-500">{errors.descricao}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Website</Label>
        <Input
          id="link"
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
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          Criar Empresa
        </Button>
      </DialogFooter>
    </form>
  );
};

interface EditEmpresaFormProps {
  empresa: EmpresaParceira;
  onSubmit: (data: UpdateEmpresaParceiraData) => void;
  onCancel: () => void;
}

const EditEmpresaForm: React.FC<EditEmpresaFormProps> = ({ empresa, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<UpdateEmpresaParceiraData>({
    nome: empresa.nome,
    descricao: empresa.descricao || '',
    link: empresa.link || '',
    logo: empresa.logo || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateEmpresaParceiraData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateEmpresaParceiraData, string>> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
          placeholder="Ex: Google, Microsoft, etc."
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
          rows={3}
          placeholder="Breve descrição da empresa..."
        />
        {errors.descricao && (
          <p className="text-sm text-red-500">{errors.descricao}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Website</Label>
        <Input
          id="link"
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
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          Salvar Alterações
        </Button>
      </DialogFooter>
    </form>
  );
};
