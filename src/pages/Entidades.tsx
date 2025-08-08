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
    pageSize: 12, 
    enablePagination: true,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showSortPopover, setShowSortPopover] = useState(false);
  const [sortBy, setSortBy] = useState<'nome' | 'ano_criacao'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounce para a pesquisa
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Effect para fazer busca global quando há termo de busca
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchEntidades(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchEntidades]);

  // Calcular estatísticas das áreas de atuação (memoizado)
  const areaStats = useMemo(() => {
    const stats: Record<string, number> = {};
    AREAS_ATUACAO.forEach(area => {
      stats[area] = entidades.filter(entity => {
        const entityArea = Array.isArray(entity.area_atuacao) 
          ? entity.area_atuacao[0] 
          : entity.area_atuacao;
        return entityArea === area;
      }).length;
    });
    return stats;
  }, [entidades]);

  // Filtros memoizados
  const filters = useMemo(() => [
    { id: 'todas', label: 'Todas as Áreas', count: 0 },
    ...AREAS_ATUACAO.map(area => ({
      id: area,
      label: area,
      count: areaStats[area] || 0
    }))
  ], [areaStats]);

  // Entidades filtradas e ordenadas (memoizado)
  const filteredEntities = useMemo(() => {
    // Se há termo de busca, usar resultados da busca global
    if (debouncedSearchTerm.trim()) {
      return searchResults.filter(entity => {
        const area = Array.isArray(entity.area_atuacao) 
          ? entity.area_atuacao[0] 
          : entity.area_atuacao;
        
        const matchesFilter = selectedFilters.length === 0 || 
                             (area && selectedFilters.includes(area));
        
        return matchesFilter;
      }).sort((a, b) => {
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
    }
    
    // Caso contrário, usar entidades carregadas normalmente
    return entidades.filter(entity => {
      const area = Array.isArray(entity.area_atuacao) 
        ? entity.area_atuacao[0] 
        : entity.area_atuacao;
      
      const matchesSearch = 
        (entity.nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (entity.descricao_curta?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (area?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesFilter = selectedFilters.length === 0 || 
                           (area && selectedFilters.includes(area));
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
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
  }, [entidades, searchResults, debouncedSearchTerm, selectedFilters, sortBy, sortOrder]);

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
    } else {
      setSelectedFilters(prev => 
        prev.includes(filterId) 
          ? prev.filter(f => f !== filterId)
          : [...prev, filterId]
      );
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
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
                    className={`bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 ${
                      selectedFilters.length > 0 ? "ring-2 ring-white/50" : ""
                    }`}
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Filtrar por Área
                    {selectedFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs bg-white/20 text-white border-white/30">
                        {selectedFilters.length}
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
                {selectedFilters.map(filterId => {
                  const filter = filters.find(f => f.id === filterId);
                  return (
                    <Badge key={filterId} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                      {filter?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                        onClick={() => toggleFilter(filterId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
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
            <p className="text-insper-dark-gray font-medium">
              {filteredEntities.length} entidade{filteredEntities.length !== 1 ? 's' : ''} encontrada{filteredEntities.length !== 1 ? 's' : ''}
              {debouncedSearchTerm && (
                <span className="text-insper-dark-gray/60">
                  {' '}para "{debouncedSearchTerm}"
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEntities.map((entity, index) => {
            const entityArea = Array.isArray(entity.area_atuacao) 
              ? entity.area_atuacao[0] 
              : entity.area_atuacao;
            
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
                          {/* Área de Atuação - Destacada */}
                          {entityArea && (
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`${getAreaColor(entityArea)} text-white font-medium text-xs px-3 py-1`}
                              >
                                {entityArea}
                              </Badge>
                            </div>
                          )}

                          <p className="text-insper-dark-gray text-sm leading-relaxed line-clamp-3">
                            {entity.descricao_curta || 'Descrição não disponível'}
                          </p>

                          {/* Informações da Feira - Design Melhorado */}
                          {(entity.link_processo_seletivo || entity.local_apresentacao || entity.horario_apresentacao) && (
                            <div className="bg-gradient-to-r from-insper-red/5 to-insper-yellow/5 border border-insper-red/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Presentation className="w-4 h-4 text-insper-red" />
                                <span className="text-sm font-semibold text-insper-red">Processo Seletivo</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                {entity.abertura_processo_seletivo && (
                                  <div className="flex items-center gap-2 text-insper-red">
                                    <Calendar size={14} className="text-insper-red flex-shrink-0" />
                                    <span className="font-medium">Abertura Inscrições: {entity.abertura_processo_seletivo}</span>
                                  </div>
                                )}
                                {entity.fechamento_processo_seletivo && (
                                  <div className="flex items-center gap-2 text-insper-red">
                                    <Calendar size={14} className="text-insper-red flex-shrink-0" />
                                    <span className="font-medium">Fechamento Inscrições: {entity.fechamento_processo_seletivo}</span>
                                  </div>
                                )}
                                {entity.data_primeira_fase && (
                                  <div className="flex items-center gap-2 text-insper-red">
                                    <CalendarDays size={14} className="text-insper-red flex-shrink-0" />
                                    <span>Primeira Fase: {entity.data_primeira_fase}</span>
                                  </div>
                                )}
                                {entity.data_segunda_fase && (
                                  <div className="flex items-center gap-2 text-insper-red">
                                    <CalendarDays size={14} className="text-insper-red flex-shrink-0" />
                                    <span>Segunda Fase: {entity.data_segunda_fase}</span>
                                  </div>
                                )}
                                {entity.data_terceira_fase && (
                                  <div className="flex items-center gap-2 text-insper-red">
                                    <CalendarDays size={14} className="text-insper-red flex-shrink-0" />
                                    <span>Terceira Fase: {entity.data_terceira_fase}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {/* {entity.nivel_exigencia && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium ${
                                  entity.nivel_exigencia === 'baixa' ? 'border-green-500 text-green-700 bg-green-50' :
                                  entity.nivel_exigencia === 'média' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                  'border-insper-red text-insper-red bg-insper-red/10'
                                }`}
                              >
                                {entity.nivel_exigencia}
                              </Badge>
                            )} */}
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

        {/* Botão carregar mais - apenas quando não há busca ativa */}
        {hasMore && !debouncedSearchTerm.trim() && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="border-insper-red/30 text-insper-red hover:bg-insper-red/5 hover:border-insper-red/50 px-8 py-3"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent mr-2"></div>
                  Carregando...
                </>
              ) : (
                <>
                  Carregar mais entidades
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
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
              Tente ajustar os filtros ou usar outros termos de busca para encontrar as entidades que você procura
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
