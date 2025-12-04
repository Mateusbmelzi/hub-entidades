import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, Plus, Sparkles } from 'lucide-react';
import { useProjetos } from '@/hooks/useProjetos';
import { useDeleteProjeto } from '@/hooks/useDeleteProjeto';
import { ProjetosGrid } from './ProjetosGrid';
import { ProjetosFilters, type StatusFilter, type SortOption } from './ProjetosFilters';
import { ProjetosStats } from './ProjetosStats';
import CriarProjetoForm from './CriarProjetoForm';
import EditarProjetoForm from './EditarProjetoForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Projeto } from '@/hooks/useProjetos';

interface GerenciarProjetosEntidadeProps {
  entidadeId: number;
  isOwner?: boolean;
}

export const GerenciarProjetosEntidade: React.FC<GerenciarProjetosEntidadeProps> = ({
  entidadeId,
  isOwner = false
}) => {
  const { projetos, loading, refetch: refetchProjetos } = useProjetos(entidadeId);
  const { deleteProjeto, loading: deleteLoading } = useDeleteProjeto();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [tecnologiasFilter, setTecnologiasFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('created_at_desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Extrair todas as tecnologias únicas dos projetos
  const allTecnologias = useMemo(() => {
    const techSet = new Set<string>();
    projetos.forEach(projeto => {
      if (projeto.tecnologias && Array.isArray(projeto.tecnologias)) {
        projeto.tecnologias.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet).sort();
  }, [projetos]);

  // Filtrar e ordenar projetos
  const filteredAndSortedProjetos = useMemo(() => {
    let filtered = [...projetos];

    // Filtro de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(projeto => {
        const matchNome = projeto.nome?.toLowerCase().includes(searchLower);
        const matchDescricao = projeto.descricao?.toLowerCase().includes(searchLower);
        const matchTecnologias = projeto.tecnologias?.some(tech => 
          tech.toLowerCase().includes(searchLower)
        );
        return matchNome || matchDescricao || matchTecnologias;
      });
    }

    // Filtro de status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(projeto => projeto.status === statusFilter);
    }

    // Filtro de tecnologias
    if (tecnologiasFilter.length > 0) {
      filtered = filtered.filter(projeto => {
        if (!projeto.tecnologias || !Array.isArray(projeto.tecnologias)) return false;
        return tecnologiasFilter.some(tech => projeto.tecnologias!.includes(tech));
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'created_at_asc':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'nome_asc':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'nome_desc':
          return (b.nome || '').localeCompare(a.nome || '');
        case 'data_inicio_desc':
          if (!a.data_inicio && !b.data_inicio) return 0;
          if (!a.data_inicio) return 1;
          if (!b.data_inicio) return -1;
          return new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime();
        case 'data_inicio_asc':
          if (!a.data_inicio && !b.data_inicio) return 0;
          if (!a.data_inicio) return 1;
          if (!b.data_inicio) return -1;
          return new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime();
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [projetos, searchTerm, statusFilter, tecnologiasFilter, sortBy]);

  const handleEdit = (projeto: Projeto) => {
    setSelectedProject(projeto);
    setShowEditDialog(true);
  };

  const handleDelete = async (projeto: Projeto) => {
    const success = await deleteProjeto(projeto.id, entidadeId);
    if (success) {
      refetchProjetos();
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refetchProjetos();
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedProject(null);
    refetchProjetos();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-in fade-in-0 duration-300">
        {/* Estatísticas */}
        {projetos.length > 0 && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <ProjetosStats projetos={projetos} />
          </div>
        )}

      {/* Card principal */}
      <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-red-600" />
              <CardTitle className="text-2xl text-gray-900">Projetos</CardTitle>
              {projetos.length > 0 && (
                <span className="text-sm text-muted-foreground">({filteredAndSortedProjetos.length} de {projetos.length})</span>
              )}
            </div>
            {isOwner && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Projeto
                        </Button>
                      </DialogTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Criar um novo projeto para sua organização</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogDescription className="sr-only">
                    Formulário para criar um novo projeto para sua organização
                  </DialogDescription>
                  <CriarProjetoForm 
                    entidadeId={entidadeId} 
                    onSuccess={handleCreateSuccess} 
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          {projetos.length > 0 && (
            <div className="mb-6">
              <ProjetosFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                tecnologiasFilter={tecnologiasFilter}
                onTecnologiasFilterChange={setTecnologiasFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                allTecnologias={allTecnologias}
              />
            </div>
          )}

          {/* Conteúdo */}
          {loading ? (
            <div className="space-y-4">
              {viewMode === 'list' ? (
                <>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              )}
            </div>
          ) : filteredAndSortedProjetos.length > 0 ? (
            <ProjetosGrid
              projetos={filteredAndSortedProjetos}
              isOwner={isOwner}
              viewMode={viewMode}
              onEdit={isOwner ? handleEdit : undefined}
              onDelete={isOwner ? handleDelete : undefined}
              deleteLoading={deleteLoading}
            />
          ) : projetos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FolderOpen className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum projeto cadastrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Que tal começar criando o primeiro projeto da sua organização? Mostre aos estudantes o que vocês estão desenvolvendo!
              </p>
              {isOwner && (
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Criar Primeiro Projeto
                  </Button>
                  <p className="text-sm text-gray-500">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    Projetos ajudam a mostrar o trabalho da organização
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum projeto encontrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Tente ajustar os filtros para encontrar projetos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Dialog de edição */}
        {selectedProject && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogDescription className="sr-only">
                Formulário para editar informações do projeto
              </DialogDescription>
              <EditarProjetoForm
                projeto={selectedProject}
                entidadeId={entidadeId}
                onSuccess={handleEditSuccess}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

