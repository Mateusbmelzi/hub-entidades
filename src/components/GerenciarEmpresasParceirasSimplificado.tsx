import React, { useState } from 'react';
import { useEmpresasParceiras } from '../hooks/useEmpresasParceiras';
import { CreateEmpresaParceiraData, UpdateEmpresaParceiraData } from '../types/empresa-parceira';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Edit, Trash2, ExternalLink, Mail, Phone, Building2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { UploadLogoEmpresa } from './UploadLogoEmpresa';

interface GerenciarEmpresasParceirasSimplificadoProps {
  entidadeId: number;
  entidadeNome: string;
  onSuccess?: () => void;
}

export function GerenciarEmpresasParceirasSimplificado({ 
  entidadeId, 
  entidadeNome, 
  onSuccess 
}: GerenciarEmpresasParceirasSimplificadoProps) {
  const { empresas, loading, error, createEmpresa, updateEmpresa, deleteEmpresa } = useEmpresasParceiras(entidadeId);
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [formData, setFormData] = useState<CreateEmpresaParceiraData>({
    entidade_id: entidadeId,
    nome: '',
    descricao: '',
    site_url: '',
    logo_url: '',
    email_contato: '',
    telefone_contato: '',
    area_atuacao: [],
    ativo: true,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmpresa(formData);
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira adicionada com sucesso!',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar empresa parceira',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa) return;

    try {
      await updateEmpresa(editingEmpresa.id, formData);
      toast({
        title: 'Sucesso',
        description: 'Empresa parceira atualizada com sucesso!',
      });
      setIsEditDialogOpen(false);
      setEditingEmpresa(null);
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar empresa parceira',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover esta empresa parceira?')) {
      try {
        await deleteEmpresa(id);
        toast({
          title: 'Sucesso',
          description: 'Empresa parceira removida com sucesso!',
        });
        onSuccess?.();
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao remover empresa parceira',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setFormData({
      entidade_id: entidadeId,
      nome: empresa.nome,
      descricao: empresa.descricao || '',
      site_url: empresa.site_url || '',
      logo_url: empresa.logo_url || '',
      email_contato: empresa.email_contato || '',
      telefone_contato: empresa.telefone_contato || '',
      area_atuacao: empresa.area_atuacao || [],
      ativo: empresa.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      entidade_id: entidadeId,
      nome: '',
      descricao: '',
      site_url: '',
      logo_url: '',
      email_contato: '',
      telefone_contato: '',
      area_atuacao: [],
      ativo: true,
    });
  };

  const addAreaAtuacao = () => {
    setFormData(prev => ({
      ...prev,
      area_atuacao: [...prev.area_atuacao, '']
    }));
  };

  const updateAreaAtuacao = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      area_atuacao: prev.area_atuacao.map((area, i) => i === index ? value : area)
    }));
  };

  const removeAreaAtuacao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      area_atuacao: prev.area_atuacao.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Carregando empresas parceiras...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
        <p className="text-red-200">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Empresas Parceiras</h3>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {empresas.length}
          </Badge>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Empresa Parceira</DialogTitle>
              <DialogDescription>
                Adicione uma nova empresa parceira para {entidadeNome}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="site_url">Site</Label>
                  <Input
                    id="site_url"
                    type="url"
                    value={formData.site_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://exemplo.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva a empresa parceira..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_contato">Email de Contato</Label>
                  <Input
                    id="email_contato"
                    type="email"
                    value={formData.email_contato}
                    onChange={(e) => setFormData(prev => ({ ...prev, email_contato: e.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_contato">Telefone</Label>
                  <Input
                    id="telefone_contato"
                    value={formData.telefone_contato}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone_contato: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label>Áreas de Atuação</Label>
                <div className="space-y-2">
                  {formData.area_atuacao.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={area}
                        onChange={(e) => updateAreaAtuacao(index, e.target.value)}
                        placeholder="Digite uma área de atuação"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAreaAtuacao(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAreaAtuacao}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Área
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Empresa</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de empresas */}
      <div className="space-y-3">
        {empresas.length === 0 ? (
          <div className="text-center py-6">
            <Building2 className="w-12 h-12 text-white/50 mx-auto mb-2" />
            <p className="text-white/70">Nenhuma empresa parceira cadastrada</p>
            <p className="text-white/50 text-sm">Clique em "Adicionar" para começar</p>
          </div>
        ) : (
          empresas.map((empresa) => (
            <Card key={empresa.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Logo da empresa - apenas exibição */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-white/20 flex items-center justify-center">
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
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Informações da empresa */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{empresa.nome}</h4>
                          {empresa.site_url && (
                            <a
                              href={empresa.site_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                    
                    {empresa.descricao && (
                      <p className="text-white/80 text-sm mb-2">{empresa.descricao}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {empresa.email_contato && (
                        <div className="flex items-center gap-1 text-white/70 text-sm">
                          <Mail className="w-3 h-3" />
                          <span>{empresa.email_contato}</span>
                        </div>
                      )}
                      {empresa.telefone_contato && (
                        <div className="flex items-center gap-1 text-white/70 text-sm">
                          <Phone className="w-3 h-3" />
                          <span>{empresa.telefone_contato}</span>
                        </div>
                      )}
                    </div>

                    {empresa.area_atuacao.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {empresa.area_atuacao.map((area, index) => (
                          <Badge key={index} variant="secondary" className="bg-white/20 text-white text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(empresa)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(empresa.id)}
                          className="text-red-300 hover:text-red-200 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Empresa Parceira</DialogTitle>
            <DialogDescription>
              Edite as informações da empresa parceira
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome da Empresa *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-site_url">Site</Label>
                <Input
                  id="edit-site_url"
                  type="url"
                  value={formData.site_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_url: e.target.value }))}
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva a empresa parceira..."
              />
            </div>

            <div>
              <Label>Logo da Empresa</Label>
              <div className="mt-2">
                <UploadLogoEmpresa
                  empresaId={editingEmpresa?.id || 0}
                  currentLogoUrl={editingEmpresa?.logo_url}
                  onLogoUpdated={(url) => {
                    // Atualizar o formData com a nova URL da logo
                    setFormData(prev => ({ ...prev, logo_url: url }));
                    // Atualizar a empresa na lista local
                    if (editingEmpresa) {
                      const updatedEmpresas = empresas.map(emp => 
                        emp.id === editingEmpresa.id ? { ...emp, logo_url: url } : emp
                      );
                      // Aqui você pode chamar uma função para atualizar o estado global se necessário
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email_contato">Email de Contato</Label>
                <Input
                  id="edit-email_contato"
                  type="email"
                  value={formData.email_contato}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_contato: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-telefone_contato">Telefone</Label>
                <Input
                  id="edit-telefone_contato"
                  value={formData.telefone_contato}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone_contato: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label>Áreas de Atuação</Label>
              <div className="space-y-2">
                {formData.area_atuacao.map((area, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={area}
                      onChange={(e) => updateAreaAtuacao(index, e.target.value)}
                      placeholder="Digite uma área de atuação"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAreaAtuacao(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAreaAtuacao}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Área
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
