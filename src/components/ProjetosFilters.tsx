import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export type StatusFilter = 'todos' | 'ativo' | 'em_desenvolvimento' | 'concluido' | 'pausado';
export type SortOption = 'created_at_desc' | 'created_at_asc' | 'nome_asc' | 'nome_desc' | 'status' | 'data_inicio_desc' | 'data_inicio_asc';

interface ProjetosFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  tecnologiasFilter: string[];
  onTecnologiasFilterChange: (value: string[]) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  allTecnologias: string[];
}

export const ProjetosFilters: React.FC<ProjetosFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tecnologiasFilter,
  onTecnologiasFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  allTecnologias
}) => {
  const [showTecnologiasPopover, setShowTecnologiasPopover] = React.useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleTecnologiaToggle = (tech: string) => {
    if (tecnologiasFilter.includes(tech)) {
      onTecnologiasFilterChange(tecnologiasFilter.filter(t => t !== tech));
    } else {
      onTecnologiasFilterChange([...tecnologiasFilter, tech]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('todos');
    onTecnologiasFilterChange([]);
    onSortChange('created_at_desc');
  };

  const hasActiveFilters = statusFilter !== 'todos' || tecnologiasFilter.length > 0 || searchTerm.length > 0;

  return (
    <div className="space-y-4">
      {/* Barra de busca e controles principais */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos por nome, descrição ou tecnologias..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Filtro de status */}
          <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="pausado">Pausado</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de tecnologias */}
          <Popover open={showTecnologiasPopover} onOpenChange={setShowTecnologiasPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                Tecnologias
                {tecnologiasFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tecnologiasFilter.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <div className="space-y-2">
                <div className="font-semibold text-sm mb-3">Filtrar por tecnologias</div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {allTecnologias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tecnologia disponível</p>
                  ) : (
                    allTecnologias.map((tech) => (
                      <div
                        key={tech}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                        onClick={() => handleTecnologiaToggle(tech)}
                      >
                        <input
                          type="checkbox"
                          checked={tecnologiasFilter.includes(tech)}
                          onChange={() => handleTecnologiaToggle(tech)}
                          className="rounded"
                        />
                        <label className="text-sm cursor-pointer flex-1">{tech}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Ordenação */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at_desc">Mais recentes</SelectItem>
              <SelectItem value="created_at_asc">Mais antigos</SelectItem>
              <SelectItem value="nome_asc">Nome A-Z</SelectItem>
              <SelectItem value="nome_desc">Nome Z-A</SelectItem>
              <SelectItem value="data_inicio_desc">Data início (recente)</SelectItem>
              <SelectItem value="data_inicio_asc">Data início (antiga)</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle de visualização */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Badges de filtros ativos e botão limpar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {statusFilter !== 'todos' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onStatusFilterChange('todos')}
              />
            </Badge>
          )}
          {tecnologiasFilter.map((tech) => (
            <Badge key={tech} variant="secondary" className="gap-1">
              {tech}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTecnologiasFilterChange(tecnologiasFilter.filter(t => t !== tech))}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

