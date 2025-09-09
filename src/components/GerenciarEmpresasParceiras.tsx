import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { EmpresaParceira, EmpresasParceiras } from '@/types/empresa-parceira';
import { useToast } from '@/hooks/use-toast';

interface GerenciarEmpresasParceirasProps {
  empresasParceiras: EmpresasParceiras;
  onEmpresasChange: (empresas: EmpresasParceiras) => void;
}

export const GerenciarEmpresasParceiras: React.FC<GerenciarEmpresasParceirasProps> = ({
  empresasParceiras,
  onEmpresasChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaParceira | null>(null);
  const [formData, setFormData] = useState<Omit<EmpresaParceira, 'id'>>({
    nome: '',
    site: '',
    descricao: '',
    logo_url: '',
  });
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddEmpresa = () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da empresa é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    const novaEmpresa: EmpresaParceira = {
      id: generateId(),
      ...formData,
    };

    onEmpresasChange([...empresasParceiras, novaEmpresa]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: 'Sucesso',
      description: 'Empresa parceira adicionada com sucesso',
    });
  };

  const handleEditEmpresa = (empresa: EmpresaParceira) => {
    setEditingEmpresa(empresa);
    setFormData({
      nome: empresa.nome,
      site: empresa.site || '',
      descricao: empresa.descricao || '',
      logo_url: empresa.logo_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleUpdateEmpresa = () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da empresa é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!editingEmpresa) return;

    const empresasAtualizadas = empresasParceiras.map(empresa =>
      empresa.id === editingEmpresa.id
        ? { ...empresa, ...formData }
        : empresa
    );

    onEmpresasChange(empresasAtualizadas);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: 'Sucesso',
      description: 'Empresa parceira atualizada com sucesso',
    });
  };

  const handleDeleteEmpresa = (empresaId: string) => {
    const empresasAtualizadas = empresasParceiras.filter(empresa => empresa.id !== empresaId);
    onEmpresasChange(empresasAtualizadas);
    
    toast({
      title: 'Sucesso',
      description: 'Empresa parceira removida com sucesso',
    });
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      site: '',
      descricao: '',
      logo_url: '',
    });
    setEditingEmpresa(null);
  };

  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    if (editingEmpresa) {
      handleUpdateEmpresa();
    } else {
      handleAddEmpresa();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Empresas Parceiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de empresas parceiras */}
        {empresasParceiras.length > 0 ? (
          <div className="grid gap-3">
            {empresasParceiras.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{empresa.nome}</h4>
                    {empresa.site && (
                      <a
                        href={empresa.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {empresa.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{empresa.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEmpresa(empresa)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmpresa(empresa.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma empresa parceira cadastrada</p>
            <p className="text-sm">Clique em "Adicionar Empresa" para começar</p>
          </div>
        )}

        {/* Botão para adicionar nova empresa */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? 'Editar Empresa Parceira' : 'Adicionar Empresa Parceira'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da empresa parceira"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="https://empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://empresa.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição da empresa parceira"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingEmpresa ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GerenciarEmpresasParceiras;
