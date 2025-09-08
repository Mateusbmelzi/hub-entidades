import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Users, Building, ArrowRight, X, MapPin, Clock, Presentation, Sparkles, Target, Calendar, ArrowUpDown, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useEntidades } from '@/hooks/useEntidades';
import { useDebounce } from '@/hooks/useDebounce';
import { AreaAtuacaoDisplay } from '@/components/ui/area-atuacao-display';
import { AREAS_ATUACAO, getFirstAreaColor, getAreaColor } from '@/lib/constants';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';
import { parseAreasAtuacao, getFirstArea } from '@/lib/area-utils';
import { supabase } from '@/integrations/supabase/client';

const Entidades = () => {

  
  const navigate = useNavigate();
  const { 
    entidades, 
    loading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore,
    searchEntidades,
    searchResults,
    isSearching,
    searchError
  } = useEntidades({ 
    pageSize: 1000, // Carregar todas as entidades de uma vez
    enablePagination: false, // Desabilitar paginação
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showSortPopover, setShowSortPopover] = useState(false);
  const [sortBy, setSortBy] = useState<'nome' | 'ano_criacao'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados para filtros híbridos
  const [filteredFromServer, setFilteredFromServer] = useState<boolean>(false);
  const [serverFilterResults, setServerFilterResults] = useState<any[]>([]);
  const [isFilteringFromServer, setIsFilteringFromServer] = useState<boolean>(false);

  // Estados para paginação visual
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [showAll, setShowAll] = useState<boolean>(false);

  // Debounce para a pesquisa
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Effect para fazer busca global quando há termo de busca
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchEntidades(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchEntidades]);

  // Effect para aplicar filtros no servidor quando necessário
  useEffect(() => {
    if (selectedFilters.length > 0 && !filteredFromServer) {
      applyServerFilters();
    } else if (selectedFilters.length === 0 && filteredFromServer) {
      // Limpar filtros do servidor
      setFilteredFromServer(false);
      setServerFilterResults([]);
    }
  }, [selectedFilters, filteredFromServer]);

  // Effect para resetar paginação visual quando filtros mudam
  useEffect(() => {
    setVisibleCount(12);
    setShowAll(false);
  }, [selectedFilters, debouncedSearchTerm]);

  // Função para aplicar filtros no servidor
  const applyServerFilters = async () => {
    if (selectedFilters.length === 0) return;
    
    setIsFilteringFromServer(true);
    
    try {
      // Como area_atuacao agora é um array JSON, precisamos usar uma abordagem diferente
      // Por enquanto, vamos desabilitar o filtro do servidor e usar apenas filtros locais
      // TODO: Implementar filtro JSON quando o Supabase suportar melhor arrays JSON
      setFilteredFromServer(false);
      
      // Fallback para filtros locais
      setServerFilterResults([]);
      
    } catch (err) {
      // Fallback para filtros locais
      setFilteredFromServer(false);
    } finally {
      setIsFilteringFromServer(false);
    }
  };

  // Função para obter a área de atuação de uma entidade
  const getEntityArea = (entity: any): string | null => {
    if (!entity || !entity.area_atuacao) {
      return null;
    }
    
    const firstArea = getFirstArea(entity.area_atuacao);
    
    // Verificar se a área está na lista de áreas válidas
    if (firstArea && AREAS_ATUACAO.includes(firstArea as any)) {
      return firstArea;
    }
    
    // Se não estiver na lista, retornar null
    return null;
  };

  // Calcular estatísticas das áreas de atuação (memoizado)
  const areaStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    // Inicializar todas as áreas com 0
    AREAS_ATUACAO.forEach(area => {
      stats[area] = 0;
    });
    
    // Contar entidades por área (uma entidade pode ser contada em múltiplas áreas)
    entidades.forEach(entity => {
      if (!entity.area_atuacao) return;
      
      const areas = parseAreasAtuacao(entity.area_atuacao);
      
      // Contar em cada área válida
      areas.forEach(area => {
        if (AREAS_ATUACAO.includes(area as any)) {
          stats[area]++;
        }
      });
    });
    
    return stats;
  }, [entidades]);

  // Filtros memoizados
  const filters = useMemo(() => [
    { id: 'todas', label: 'Todas as Áreas', count: entidades.length },
    ...AREAS_ATUACAO.map(area => ({
      id: area,
      label: area,
      count: areaStats[area] || 0
    }))
  ], [areaStats, entidades.length]);

  // Entidades filtradas e ordenadas (memoizado)
  const filteredEntities = useMemo(() => {
    let entitiesToFilter = entidades;
    
    // Se há filtros ativos, usar resultados do servidor se disponível
    if (selectedFilters.length > 0 && filteredFromServer) {
      entitiesToFilter = serverFilterResults;
    }
    
    // Aplicar filtros locais (para entidades já carregadas ou como fallback)
    let filtered = entitiesToFilter;
    if (selectedFilters.length > 0 && !filteredFromServer) {
      filtered = entitiesToFilter.filter(entity => {
        if (!entity.area_atuacao) return false;
        
        let areas: string[] = [];
        
        // Se for array, usar diretamente
        if (Array.isArray(entity.area_atuacao)) {
          areas = entity.area_atuacao.filter((area: any) => area && area.trim());
        } else if (typeof entity.area_atuacao === 'string') {
          // Se for string, separar por vírgulas
          areas = parseAreasAtuacao(entity.area_atuacao);
        }
        
        // Verificar se alguma das áreas da entidade está nos filtros selecionados
        const matchesFilter = areas.some(area => selectedFilters.includes(area));
        
        return matchesFilter;
      });
    }
    
    // DEPOIS aplicar busca (se houver)
    if (debouncedSearchTerm.trim()) {
      // Se há resultados de busca global, filtrar por eles
      if (searchResults.length > 0) {
        const searchResultIds = new Set(searchResults.map(e => e.id));
        filtered = filtered.filter(entity => searchResultIds.has(entity.id));
      } else {
        // Busca local nos dados já filtrados
        filtered = filtered.filter(entity => {
          const area = getEntityArea(entity);
          const searchLower = debouncedSearchTerm.toLowerCase();
          
          return (
            (entity.nome?.toLowerCase().includes(searchLower)) ||
            (entity.descricao_curta?.toLowerCase().includes(searchLower)) ||
            (area?.toLowerCase().includes(searchLower))
          );
        });
      }
    }
    
    // Ordenar
    return filtered.sort((a, b) => {
      if (sortBy === 'nome') {
        const aName = a.nome?.toLowerCase() || '';
        const bName = b.nome?.toLowerCase() || '';
        return sortOrder === 'asc' 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else {
        const aYear = a.ano_criacao || 0;
        const bYear = b.ano_criacao || 0;
        return sortOrder === 'asc' ? aYear - bYear : bYear - aYear;
      }
    });
  }, [entidades, searchResults, debouncedSearchTerm, selectedFilters, sortBy, sortOrder, filteredFromServer, serverFilterResults]);

  // Entidades visíveis na tela (com paginação visual)
  const visibleEntities = useMemo(() => {
    if (showAll) {
      return filteredEntities;
    }
    return filteredEntities.slice(0, visibleCount);
  }, [filteredEntities, visibleCount, showAll]);

  // Função para mostrar mais entidades
  const showMoreEntities = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleCount(12);
    } else {
      setVisibleCount(prev => Math.min(prev + 12, filteredEntities.length));
      if (visibleCount + 12 >= filteredEntities.length) {
        setShowAll(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando entidades...</p>
          <p className="text-insper-dark-gray/60 text-sm mt-2">Preparando as melhores oportunidades para você</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-insper-red" />
          </div>
          <h3 className="text-xl font-semibold text-insper-black mb-2">Erro ao carregar entidades</h3>
          <p className="text-insper-dark-gray mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-insper-red hover:bg-insper-red/90">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const toggleFilter = (filterId: string) => {
    if (filterId === 'todas') {
      setSelectedFilters([]);
      setFilteredFromServer(false);
      setServerFilterResults([]);
      setVisibleCount(12);
      setShowAll(false);
    } else {
      setSelectedFilters(prev => {
        if (prev.includes(filterId)) {
          // Remover filtro
          const newFilters = prev.filter(f => f !== filterId);
          
          // Se não há mais filtros, limpar servidor e resetar paginação
          if (newFilters.length === 0) {
            setFilteredFromServer(false);
            setServerFilterResults([]);
            setVisibleCount(12);
            setShowAll(false);
          }
          
          return newFilters;
        } else {
          // Adicionar filtro
          const newFilters = [...prev, filterId];
          
          // Resetar filtros do servidor e paginação para forçar nova busca
          setFilteredFromServer(false);
          setServerFilterResults([]);
          setVisibleCount(12);
          setShowAll(false);
          
          return newFilters;
        }
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
    setFilteredFromServer(false);
    setServerFilterResults([]);
    setVisibleCount(12);
    setShowAll(false);
    
    // Limpar resultados de busca para voltar à lista completa
    if (searchResults.length > 0) {
      // Forçar re-render para limpar searchResults
      setSearchTerm('');
    }
  };

  const handleSort = (field: 'nome' | 'ano_criacao') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortLabel = () => {
    if (sortBy === 'nome') {
      return sortOrder === 'asc' ? 'Nome A-Z' : 'Nome Z-A';
    } else {
      return sortOrder === 'asc' ? 'Mais Antigas' : 'Mais Recentes';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
      {/* Hero Header */}
      <div className="relative bg-insper-red text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {entidades.length} Organizações Estudantis Disponíveis
              {selectedFilters.length > 0 && (
                <span className="ml-2 text-white/80">
                  • {filteredEntities.length} filtradas
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Explore as Organizações Estudantis
              <span> do Insper</span>
            </h1>
            
            <p className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Descubra oportunidades únicas para desenvolver suas habilidades, expandir sua rede de contatos e fazer parte de projetos incríveis
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 h-6 w-6 text-insper-dark-gray/60" />
              <Input
                placeholder="Buscar entidades, áreas de atuação ou tecnologias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg text-insper-black placeholder:text-insper-dark-gray/60"
              />
              {isSearching && (
                <div className="absolute right-4 top-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-insper-red border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Filtros e Ordenação */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={`bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200 ${
                      selectedFilters.length > 0 ? "ring-2 ring-white/50 bg-white/20" : ""
                    }`}
                    disabled={isFilteringFromServer}
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Filtrar por Área
                    {isFilteringFromServer && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                    )}
                    {selectedFilters.length > 0 && !isFilteringFromServer && (
                      <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs bg-white/20 text-white border-white/30 animate-pulse">
                        {filteredFromServer ? 'Servidor' : 'Local'}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-50 bg-white border shadow-xl rounded-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-insper-black">Filtros por Área de Atuação</h4>
                      {selectedFilters.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-insper-red hover:text-insper-red/80">
                          Limpar tudo
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {filters.slice(1).map((filter) => (
                        <div key={filter.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={filter.id}
                              checked={selectedFilters.includes(filter.id)}
                              onCheckedChange={() => toggleFilter(filter.id)}
                              className="text-insper-red"
                            />
                            <label htmlFor={filter.id} className="text-sm cursor-pointer hover:text-insper-red transition-colors">
                              {filter.label}
                            </label>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {filter.count}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button size="sm" onClick={() => setShowFiltersPopover(false)} className="bg-insper-red hover:bg-insper-red/90">
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={showSortPopover} onOpenChange={setShowSortPopover}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <ArrowUpDown className="mr-2 h-5 w-5" />
                    {getSortLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 z-50 bg-white border shadow-xl rounded-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-insper-black">Ordenar por</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-insper-dark-gray">Nome</h5>
                        <div className="space-y-2">
                          <Button
                            variant={sortBy === 'nome' && sortOrder === 'asc' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleSort('nome')}
                            className={`w-full justify-start ${
                              sortBy === 'nome' && sortOrder === 'asc' 
                                ? 'bg-insper-red text-white hover:bg-insper-red/90' 
                                : 'hover:bg-insper-light-gray'
                            }`}
                          >
                            A → Z
                          </Button>
                          <Button
                            variant={sortBy === 'nome' && sortOrder === 'desc' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleSort('nome')}
                            className={`w-full justify-start ${
                              sortBy === 'nome' && sortOrder === 'desc' 
                                ? 'bg-insper-red text-white hover:bg-insper-red/90' 
                                : 'hover:bg-insper-light-gray'
                            }`}
                          >
                            Z → A
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-insper-dark-gray">Ano de Criação</h5>
                        <div className="space-y-2">
                          <Button
                            variant={sortBy === 'ano_criacao' && sortOrder === 'asc' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleSort('ano_criacao')}
                            className={`w-full justify-start ${
                              sortBy === 'ano_criacao' && sortOrder === 'asc' 
                                ? 'bg-insper-red text-white hover:bg-insper-red/90' 
                                : 'hover:bg-insper-light-gray'
                            }`}
                          >
                            Mais Antigas
                          </Button>
                          <Button
                            variant={sortBy === 'ano_criacao' && sortOrder === 'desc' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleSort('ano_criacao')}
                            className={`w-full justify-start ${
                              sortBy === 'ano_criacao' && sortOrder === 'desc' 
                                ? 'bg-insper-red text-white hover:bg-insper-red/90' 
                                : 'hover:bg-insper-light-gray'
                            }`}
                          >
                            Mais Recentes
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button size="sm" onClick={() => setShowSortPopover(false)} className="bg-insper-red hover:bg-insper-red/90">
                        Fechar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtros Ativos */}
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                <span className="text-white/80 text-sm mr-2">Filtros ativos:</span>
                {selectedFilters.map(filterId => {
                  const filter = filters.find(f => f.id === filterId);
                  return (
                    <Badge key={filterId} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                      {filter?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-white/30 text-white rounded-full"
                        onClick={() => toggleFilter(filterId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/20 text-sm"
                  onClick={clearAllFilters}
                >
                  Limpar todos
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-insper-red" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <p className="text-insper-dark-gray font-medium">
                {filteredEntities.length} entidade{filteredEntities.length !== 1 ? 's' : ''} encontrada{filteredEntities.length !== 1 ? 's' : ''}
                {!showAll && visibleCount < filteredEntities.length && (
                  <span className="text-insper-dark-gray/60">
                    {' '}(mostrando {visibleCount} de {filteredEntities.length})
                  </span>
                )}
                {debouncedSearchTerm && (
                  <span className="text-insper-dark-gray/60">
                    {' '}para "{debouncedSearchTerm}"
                  </span>
                )}
                {selectedFilters.length > 0 && (
                  <span className="text-insper-dark-gray/60">
                    {' '}em {selectedFilters.length} área{selectedFilters.length !== 1 ? 's' : ''} selecionada{selectedFilters.length !== 1 ? 's' : ''}
                    {filteredFromServer && (
                      <span className="text-insper-blue font-medium"> (busca completa no servidor)</span>
                    )}
                  </span>
                )}
              </p>
              {selectedFilters.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-insper-dark-gray/60">
                  <Filter className="w-3 h-3" />
                  <span>Filtros ativos</span>
                  {filteredFromServer && (
                    <span className="text-insper-blue font-medium"> • Servidor</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-insper-red border-insper-red/30 hover:bg-insper-red/5"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleEntities.map((entity, index) => {
            const entityArea = getEntityArea(entity);
            
            return (
              <div key={entity.id} className="group">
                <Card className="h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                  <div className="relative flex flex-col h-full">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Área clicável do card - leva para página da entidade */}
                    <div 
                      className="flex-1 cursor-pointer z-10 relative"
                      onClick={() => {
                        navigate(`/entidades/${entity.id}`);
                      }}
                    >
                      <CardHeader className="pb-4 flex-shrink-0">
                        <div className="flex items-center space-x-4">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            <FotoPerfilEntidade
                              fotoUrl={entity.foto_perfil_url}
                              nome={entity.nome}
                              size="lg"
                              className="shadow-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl group-hover:text-insper-red transition-colors duration-300 font-bold">
                              {entity.nome || 'Nome não informado'}
                            </CardTitle>
                            <div className="flex items-center text-sm text-insper-dark-gray/60 mt-2">
                              <Users size={16} className="mr-2" />
                              <span className="font-medium">{entity.numero_membros || 0}</span>
                              <span className="ml-1">membros</span>
                            </div>
                            <div className="flex items-center text-sm text-insper-dark-gray/60 mt-1">
                              <Calendar size={16} className="mr-2" />
                              <span>Criada em {entity.ano_criacao || new Date(entity.created_at).getFullYear()}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <div className="space-y-4 flex-1">
                          {/* Áreas de Atuação - Destacadas */}
                          <AreaAtuacaoDisplay
                            area_atuacao={entity.area_atuacao}
                            variant="secondary"
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
                            compact={true}
                          />

                          <p className="text-insper-dark-gray text-sm leading-relaxed line-clamp-3">
                            {entity.descricao_curta || 'Descrição não disponível'}
                          </p>
                          
                          {/* Informações da Feira - Tem preferência sobre processo seletivo quando ativa */}
                          {entity.feira_ativa === true && (
                            <div className="bg-gradient-to-r from-insper-blue/5 to-insper-green/5 border border-insper-blue/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Building className="w-4 h-4 text-insper-blue" />
                                <span className="text-sm font-semibold text-insper-blue">Feira de Entidades</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                {entity.local_feira && (
                                  <div className="flex items-center gap-2 text-insper-blue">
                                    <MapPin size={14} className="text-insper-blue flex-shrink-0" />
                                    <span className="font-medium">Local: {entity.local_feira}</span>
                                  </div>
                                )}
                                {entity.sala_feira && (
                                  <div className="flex items-center gap-2 text-insper-blue">
                                    <Building size={14} className="text-insper-blue flex-shrink-0" />
                                    <span className="font-medium">Sala: {entity.sala_feira}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-insper-blue">Visite nosso estande na feira para mais informações!</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Informações do Processo Seletivo - Só aparece se não houver feira ativa, houver link_processo_seletivo válido e a data de encerramento for maior ou igual à data atual */}
                          {!entity.feira_ativa && entity.link_processo_seletivo && entity.link_processo_seletivo.trim() !== '' && (() => {
                            // Verificar se a data de encerramento é maior ou igual à data atual (processo ainda aberto)
                            if (entity.fechamento_processo_seletivo) {
                              const dataEncerramento = new Date(entity.fechamento_processo_seletivo);
                              const dataAtual = new Date();
                              // Zerar as horas para comparar apenas as datas
                              dataAtual.setHours(0, 0, 0, 0);
                              dataEncerramento.setHours(0, 0, 0, 0);
                              
                              // Só mostrar se a data de encerramento for maior ou igual à data atual (ainda aberto)
                              if (dataEncerramento < dataAtual) {
                                return null;
                              }
                            }
                            
                            return (
                              <div className="bg-gradient-to-r from-insper-red/5 to-insper-yellow/5 border border-insper-red/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Presentation className="w-4 h-4 text-insper-red" />
                                  <span className="text-sm font-semibold text-insper-red">Processo Seletivo</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {entity.fechamento_processo_seletivo && (
                                    <div className="flex items-center gap-2 text-insper-red">
                                      <Calendar size={14} className="text-insper-red flex-shrink-0" />
                                      <span className="font-medium">
                                        Inscrições abertas até: {entity.fechamento_processo_seletivo?.split('-').reverse().join('-')}
                                      </span> 
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-insper-red">Para mais informações do processo seletivo, veja o perfil da organização.</div>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="flex flex-wrap gap-2">
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Área dos botões - não clicável para navegação do card */}
                    <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-100 flex-shrink-0 px-6 pb-6">
                      <Button 
                        className="flex-1 bg-insper-red hover:bg-insper-red/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => {
                          navigate(`/entidades/${entity.id}`);
                        }}
                      >
                        Ver Detalhes
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group-hover:bg-insper-light-gray border-insper-light-gray-1 hover:border-insper-light-gray-1" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/eventos?entidade=${entity.id}`);
                        }}
                      >
                        Eventos
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Botão de paginação visual - substitui o "carregar mais" */}
        {filteredEntities.length > visibleCount && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={showMoreEntities}
              className="border-insper-red/30 text-insper-red hover:bg-insper-red/5 hover:border-insper-red/50 px-8 py-3"
            >
              {showAll ? (
                <>
                  <ArrowUpDown size={18} className="mr-2" />
                  Mostrar Menos
                </>
              ) : (
                <>
                  Mostrar Mais Entidades
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
            
            {!showAll && (
              <p className="text-sm text-insper-dark-gray/60 mt-3">
                Mostrando {visibleCount} de {filteredEntities.length} entidades
              </p>
            )}
          </div>
        )}

        {filteredEntities.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-insper-red/10 to-insper-red/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search size={48} className="text-insper-red" />
            </div>
            <h3 className="text-2xl font-bold text-insper-black mb-4">
              Nenhuma entidade encontrada
            </h3>
            <p className="text-insper-dark-gray text-lg max-w-md mx-auto mb-8">
              {debouncedSearchTerm.trim() 
                ? `Nenhuma entidade encontrada para "${debouncedSearchTerm}"`
                : selectedFilters.length > 0
                ? filteredFromServer
                  ? `Nenhuma entidade encontrada no servidor para as áreas selecionadas`
                  : `Nenhuma entidade encontrada localmente para as áreas selecionadas`
                : 'Nenhuma entidade disponível no momento'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="border-insper-red/30 text-insper-red hover:bg-insper-red/5"
              >
                Limpar busca
              </Button>
              <Button 
                onClick={() => setSelectedFilters([])}
                className="bg-insper-red hover:bg-insper-red/90"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entidades;

