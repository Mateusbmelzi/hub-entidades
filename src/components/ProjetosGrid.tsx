import React from 'react';
import { ProjetoCard } from './ProjetoCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Projeto } from '@/hooks/useProjetos';

interface ProjetosGridProps {
  projetos: Projeto[];
  loading?: boolean;
  isOwner?: boolean;
  viewMode?: 'list' | 'grid';
  onEdit?: (projeto: Projeto) => void;
  onDelete?: (projeto: Projeto) => void;
  deleteLoading?: boolean;
}

export const ProjetosGrid: React.FC<ProjetosGridProps> = ({
  projetos,
  loading = false,
  isOwner = false,
  viewMode = 'grid',
  onEdit,
  onDelete,
  deleteLoading = false
}) => {
  if (loading) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (projetos.length === 0) {
    return null; // Empty state será tratado pelo componente pai
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {projetos.map((projeto, index) => (
          <div
            key={projeto.id}
            className="animate-in fade-in-0 slide-in-from-left-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <ProjetoCard
              projeto={projeto}
              isOwner={isOwner}
              viewMode="list"
              onEdit={onEdit}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projetos.map((projeto, index) => (
        <div
          key={projeto.id}
          className="animate-in fade-in-0 zoom-in-95"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
          <ProjetoCard
            projeto={projeto}
            isOwner={isOwner}
            viewMode="grid"
            onEdit={onEdit}
            onDelete={onDelete}
            deleteLoading={deleteLoading}
          />
        </div>
      ))}
    </div>
  );
};

