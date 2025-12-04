import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, MoreVertical, ExternalLink, Calendar, Code, Users, FolderOpen, Building2, Presentation } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Projeto } from '@/hooks/useProjetos';
import { useProjetoEmpresasParceiras } from '@/hooks/useProjetoEmpresasParceiras';

interface ProjetoCardProps {
  projeto: Projeto;
  isOwner?: boolean;
  onEdit?: (projeto: Projeto) => void;
  onDelete?: (projeto: Projeto) => void;
  deleteLoading?: boolean;
  viewMode?: 'list' | 'grid';
}

export const ProjetoCard: React.FC<ProjetoCardProps> = ({
  projeto,
  isOwner = false,
  onEdit,
  onDelete,
  deleteLoading = false,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const { empresasAssociadas: empresasParceiras } = useProjetoEmpresasParceiras(projeto.id);

  const handleCardClick = () => {
    navigate(`/projetos/${projeto.id}`);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em_desenvolvimento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'em_desenvolvimento':
        return 'Em Desenvolvimento';
      case 'concluido':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      default:
        return status;
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="border-l-4 border-red-500 pl-6 py-4 bg-gradient-to-r from-red-50 to-transparent rounded-r-xl hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xl font-bold text-gray-900">{projeto.nome}</h4>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={handleDropdownClick}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={handleDropdownClick}>
                    {onEdit && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(projeto);
                        }}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="text-destructive focus:text-destructive"
                            onClick={handleDropdownClick}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Remover
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o projeto "{projeto.nome}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(projeto)}
                              disabled={deleteLoading}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteLoading ? 'Removendo...' : 'Remover'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {projeto.descricao && (
              <p className="text-gray-600 mb-3 leading-relaxed line-clamp-2">{projeto.descricao}</p>
            )}
            {projeto.tecnologias && projeto.tecnologias.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {projeto.tecnologias.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {projeto.data_inicio && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Início: {format(new Date(projeto.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              )}
              {empresasParceiras && empresasParceiras.length > 0 && (
                <div className="flex items-center gap-1.5" title={`${empresasParceiras.length} ${empresasParceiras.length === 1 ? 'empresa parceira' : 'empresas parceiras'}`}>
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <div className="flex -space-x-1.5">
                    {empresasParceiras.slice(0, 3).map((empresa) => (
                      <div
                        key={empresa.id}
                        className="w-5 h-5 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center"
                        title={empresa.nome}
                      >
                        {empresa.logo ? (
                          <img
                            src={empresa.logo}
                            alt={empresa.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg class="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Building2 className="w-2.5 h-2.5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {empresasParceiras.length > 3 && (
                    <span className="text-xs text-gray-500">+{empresasParceiras.length - 3}</span>
                  )}
                </div>
              )}
              {projeto.repositorio_url && (
                <a 
                  href={projeto.repositorio_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Repositório
                </a>
              )}
              {projeto.link_apresentacao && (
                <a 
                  href={projeto.link_apresentacao} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Presentation className="h-3 w-3" />
                  Apresentação
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={`${getStatusColor(projeto.status || 'ativo')}`}
            >
              {getStatusLabel(projeto.status || 'ativo')}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card 
      className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {projeto.imagem_url && (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={projeto.imagem_url}
            alt={projeto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <FolderOpen className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-red-600 transition-colors">
                {projeto.nome}
              </h3>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDropdownClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={handleDropdownClick}>
                {onEdit && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(projeto);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="text-destructive focus:text-destructive"
                        onClick={handleDropdownClick}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o projeto "{projeto.nome}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(projeto)}
                          disabled={deleteLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteLoading ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {projeto.descricao && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {projeto.descricao}
          </p>
        )}

        {projeto.categoria && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mb-2">
            {projeto.categoria}
          </Badge>
        )}
        {projeto.tecnologias && projeto.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {projeto.tecnologias.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                <Code className="h-3 w-3 mr-1" />
                {tech}
              </Badge>
            ))}
            {projeto.tecnologias.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                +{projeto.tecnologias.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4">
          {projeto.data_inicio && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Início: {format(new Date(projeto.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          )}
          {projeto.data_fim && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Fim: {format(new Date(projeto.data_fim), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline"
              className={getStatusColor(projeto.status || 'ativo')}
            >
              {getStatusLabel(projeto.status || 'ativo')}
            </Badge>
            {empresasParceiras && empresasParceiras.length > 0 && (
              <div className="flex items-center gap-1.5" title={`${empresasParceiras.length} ${empresasParceiras.length === 1 ? 'empresa parceira' : 'empresas parceiras'}`}>
                <div className="flex -space-x-2">
                  {empresasParceiras.slice(0, 3).map((empresa) => (
                    <div
                      key={empresa.id}
                      className="w-6 h-6 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center"
                      title={empresa.nome}
                    >
                      {empresa.logo ? (
                        <img
                          src={empresa.logo}
                          alt={empresa.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {empresasParceiras.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">+{empresasParceiras.length - 3}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {projeto.repositorio_url && (
              <a 
                href={projeto.repositorio_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Repositório
              </a>
            )}
            {projeto.link_apresentacao && (
              <a 
                href={projeto.link_apresentacao} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Presentation className="h-3 w-3" />
                Apresentação
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

