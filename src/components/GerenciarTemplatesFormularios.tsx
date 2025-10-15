import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Copy, Trash2, Search, Filter, Calendar, Users, FileText } from 'lucide-react';
import { useTemplatesFormularios } from '@/hooks/useTemplatesFormularios';
import { CriarEditarTemplate } from './CriarEditarTemplate';
import { 
  TemplateFormulario,
  TIPO_EVENTO_LABELS,
  CAMPOS_BASICOS_LABELS
} from '@/types/template-formulario';

interface GerenciarTemplatesFormulariosProps {
  entidadeId: number;
}

export function GerenciarTemplatesFormularios({ entidadeId }: GerenciarTemplatesFormulariosProps) {
  const { 
    templates, 
    loading, 
    deleteTemplate, 
    duplicateTemplate,
    getTemplatesByTipo 
  } = useTemplatesFormularios(entidadeId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFormulario | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateFormulario | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');

  const handleEdit = (template: TemplateFormulario) => {
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  const handleDelete = (template: TemplateFormulario) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleDuplicate = async (template: TemplateFormulario) => {
    await duplicateTemplate(template.id);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const handleCloseEdit = () => {
    setShowEditDialog(false);
    setSelectedTemplate(null);
  };

  const handleCloseCreate = () => {
    setShowCreateDialog(false);
  };

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome_template.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.descricao && template.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipo = !tipoFilter || template.tipo_evento === tipoFilter;
    
    return matchesSearch && matchesTipo;
  });

  const getTipoEventoLabel = (tipo?: string) => {
    if (!tipo) return 'Sem tipo específico';
    return TIPO_EVENTO_LABELS[tipo as keyof typeof TIPO_EVENTO_LABELS] || tipo;
  };

  const getCamposBasicosCount = (template: TemplateFormulario) => {
    return template.campos_basicos_visiveis?.length || 0;
  };

  const getCamposPersonalizadosCount = (template: TemplateFormulario) => {
    return template.campos_personalizados?.length || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={tipoFilter || 'todos'} onValueChange={(value) => setTipoFilter(value === 'todos' ? '' : value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-gray-500">Total de Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.length}</p>
                <p className="text-sm text-gray-500">Filtrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.tipo_evento).length}
                </p>
                <p className="text-sm text-gray-500">Com Tipo Definido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de templates */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || tipoFilter ? 'Nenhum template encontrado' : 'Nenhum template criado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || tipoFilter 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Crie seu primeiro template para começar a reutilizar formulários de inscrição.'
              }
            </p>
            {!searchTerm && !tipoFilter && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{template.nome_template}</CardTitle>
                    {template.descricao && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {template.descricao}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.tipo_evento && (
                    <Badge variant="secondary" className="text-xs">
                      {getTipoEventoLabel(template.tipo_evento)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getCamposBasicosCount(template)} básicos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getCamposPersonalizadosCount(template)} personalizados
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {template.usa_limite_sala 
                        ? 'Limite: Capacidade da sala' 
                        : `Limite: ${template.limite_vagas_customizado || 'Sem limite'} vagas`
                      }
                    </span>
                  </div>
                  
                  {template.aceita_lista_espera && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Aceita lista de espera</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(template)}
                    title="Duplicar template"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(template)}
                    className="text-red-600 hover:text-red-700"
                    title="Excluir template"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CriarEditarTemplate
        entidadeId={entidadeId}
        isOpen={showCreateDialog}
        onClose={handleCloseCreate}
        onSuccess={() => setShowCreateDialog(false)}
      />

      <CriarEditarTemplate
        entidadeId={entidadeId}
        template={selectedTemplate}
        isOpen={showEditDialog}
        onClose={handleCloseEdit}
        onSuccess={() => setShowEditDialog(false)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "{templateToDelete?.nome_template}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
