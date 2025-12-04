import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Calendar, X, Sparkles, Target, FolderOpen, Building2, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProjetosPublicos } from '@/hooks/useProjetosPublicos';
import { ProjetoCard } from '@/components/ProjetoCard';
import { AREAS_ATUACAO } from '@/lib/constants';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';

const Projetos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>(['ativo', 'em_desenvolvimento']);
  const [selectedAreaFilters, setSelectedAreaFilters] = useState<string[]>([]);
  const [selectedTecnologiasFilters, setSelectedTecnologiasFilters] = useState<string[]>([]);
  const [filteredByEntity, setFilteredByEntity] = useState<string | null>(null);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);

  // Effect para detectar filtro de entidade na URL
  useEffect(() => {
    const entidadeId = searchParams.get('entidade');
    setFilteredByEntity(entidadeId);
  }, [searchParams]);

  // Usar hook para buscar projetos públicos
  const { 
    projetos, 
    loading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore 
  } = useProjetosPublicos({ 
    pageSize: 10000, 
    enablePagination: true,
    entidadeId: filteredByEntity ? parseInt(filteredByEntity) : undefined
  });

  // Buscar informações da entidade filtrada
  const [entidadeFiltrada, setEntidadeFiltrada] = useState<any>(null);

  useEffect(() => {
    const fetchEntidadeFiltrada = async () => {
      if (!filteredByEntity) {
        setEntidadeFiltrada(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('entidades')
          .select('nome, foto_perfil_url')
          .eq('id', parseInt(filteredByEntity))
          .single();
        
        if (error) throw error;
        setEntidadeFiltrada(data);
      } catch (err) {
        console.error('Erro ao carregar entidade filtrada:', err);
        setEntidadeFiltrada(null);
      }
    };

    fetchEntidadeFiltrada();
  }, [filteredByEntity]);

  // Extrair todas as tecnologias únicas dos projetos
  const allTecnologias = React.useMemo(() => {
    const techSet = new Set<string>();
    projetos.forEach(projeto => {
      if (projeto.tecnologias && Array.isArray(projeto.tecnologias)) {
        projeto.tecnologias.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet).sort();
  }, [projetos]);

  // Funções de filtro
  const toggleStatusFilter = (status: string) => {
    setSelectedStatusFilters(prev => {
      if (status === 'todos') {
        return ['todos'];
      }
      if (prev.includes(status)) {
        const newFilters = prev.filter(f => f !== status);
        return newFilters.length === 0 ? ['todos'] : newFilters;
      }
      const newFilters = prev.filter(f => f !== 'todos');
      return [...newFilters, status];
    });
  };

  const toggleAreaFilter = (area: string) => {
    setSelectedAreaFilters(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleTecnologiaFilter = (tech: string) => {
    setSelectedTecnologiasFilters(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const clearEntityFilter = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('entidade');
      return newParams;
    });
    setFilteredByEntity(null);
  };

  const clearAllFilters = () => {
    setSelectedStatusFilters(['todos']);
    setSelectedAreaFilters([]);
    setSelectedTecnologiasFilters([]);
    clearEntityFilter();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (!selectedStatusFilters.includes('todos')) count += selectedStatusFilters.length;
    count += selectedAreaFilters.length;
    count += selectedTecnologiasFilters.length;
    return count;
  };

  // Filtrar projetos
  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = 
      projeto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.tecnologias?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
      projeto.entidades?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = selectedStatusFilters.includes('todos') || 
                               selectedStatusFilters.includes(projeto.status || 'ativo');
    
    const matchesAreaFilter = selectedAreaFilters.length === 0 || 
                             (projeto.entidades?.area_atuacao && 
                              selectedAreaFilters.some(selectedArea => 
                                Array.isArray(projeto.entidades?.area_atuacao)
                                  ? projeto.entidades.area_atuacao.includes(selectedArea)
                                  : projeto.entidades.area_atuacao === selectedArea
                              ));
    
    const matchesTecnologiaFilter = selectedTecnologiasFilters.length === 0 || 
                                    (projeto.tecnologias && 
                                     selectedTecnologiasFilters.some(selectedTech => 
                                       projeto.tecnologias!.includes(selectedTech)
                                     ));
    
    return matchesSearch && matchesStatusFilter && matchesAreaFilter && matchesTecnologiaFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando projetos...</p>
          <p className="text-insper-dark-gray/60 text-sm mt-2">Preparando os melhores projetos para você</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-insper-red" />
          </div>
          <h3 className="text-xl font-semibold text-insper-black mb-2">Erro ao carregar projetos</h3>
          <p className="text-insper-dark-gray mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-insper-red hover:bg-insper-red/90">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

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
              {projetos.length} Projetos Disponíveis
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Projetos das Organizações Estudantis
            </h1>
            
            <p className="text-xl text-insper-red/90 max-w-3xl mx-auto leading-relaxed">
              Descubra projetos inovadores desenvolvidos pelas organizações estudantis. 
              Explore tecnologias, soluções e iniciativas que movem o Insper.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 h-6 w-6 text-insper-dark-gray/60" />
              <Input
                placeholder="Buscar projetos, tecnologias, organizações estudantis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg text-black placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={`bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 ${
                      getActiveFiltersCount() > 0 ? "ring-2 ring-white/50" : ""
                    }`}
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    Filtros
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs bg-white/20 text-white border-white/30">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 z-[100] bg-white border shadow-2xl rounded-xl" 
                  side="bottom" 
                  align="center"
                  sideOffset={12}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-insper-black">Filtros de Projetos</h4>
                      {getActiveFiltersCount() > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-insper-red hover:text-insper-red/80">
                          Limpar tudo
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-3 block text-insper-dark-gray">Status do Projeto</label>
                        <div className="space-y-3">
                          {['todos', 'ativo', 'em_desenvolvimento', 'concluido', 'pausado'].map((status) => (
                            <div key={status} className="flex items-center space-x-3">
                              <Checkbox
                                id={status}
                                checked={selectedStatusFilters.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                                className="text-insper-red"
                              />
                              <label htmlFor={status} className="text-sm cursor-pointer hover:text-insper-red transition-colors capitalize">
                                {status === 'todos' ? 'Todos os projetos' : 
                                 status === 'em_desenvolvimento' ? 'Em Desenvolvimento' :
                                 status === 'concluido' ? 'Concluído' : status}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-3 block text-insper-dark-gray">Filtros por Área de Atuação</label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {AREAS_ATUACAO.map((area) => (
                            <div key={area} className="flex items-center space-x-3">
                              <Checkbox
                                id={`area-${area}`}
                                checked={selectedAreaFilters.includes(area)}
                                onCheckedChange={() => toggleAreaFilter(area)}
                                className="text-insper-red"
                              />
                              <label htmlFor={`area-${area}`} className="text-sm cursor-pointer hover:text-insper-red transition-colors">
                                {area}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {allTecnologias.length > 0 && (
                        <div>
                          <label className="text-sm font-medium mb-3 block text-insper-dark-gray">Tecnologias</label>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {allTecnologias.map((tech) => (
                              <div key={tech} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`tech-${tech}`}
                                  checked={selectedTecnologiasFilters.includes(tech)}
                                  onCheckedChange={() => toggleTecnologiaFilter(tech)}
                                  className="text-insper-red"
                                />
                                <label htmlFor={`tech-${tech}`} className="text-sm cursor-pointer hover:text-insper-red transition-colors">
                                  {tech}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button size="sm" onClick={() => setShowFiltersPopover(false)} className="bg-insper-red hover:bg-insper-red/90">
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtros Ativos */}
            {(getActiveFiltersCount() > 0 || filteredByEntity) && (
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {!selectedStatusFilters.includes('todos') && selectedStatusFilters.map(filter => {
                  return (
                    <Badge key={filter} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                      {filter === 'em_desenvolvimento' ? 'Em Desenvolvimento' :
                       filter === 'concluido' ? 'Concluído' : filter}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                        onClick={() => toggleStatusFilter(filter)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                
                {selectedAreaFilters.map(area => (
                  <Badge key={area} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                    {area}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                      onClick={() => toggleAreaFilter(area)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {selectedTecnologiasFilters.map(tech => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                    <Code className="w-3 h-3 mr-1" />
                    {tech}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                      onClick={() => toggleTecnologiaFilter(tech)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filteredByEntity && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                    <Building2 className="w-3 h-3 mr-1" />
                    {entidadeFiltrada?.nome || 'Entidade'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                      onClick={clearEntityFilter}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Entity Filter Banner */}
        {filteredByEntity && entidadeFiltrada && (
          <div className="mb-8 bg-gradient-to-r from-insper-red/10 to-insper-yellow/10 border border-insper-red/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FotoPerfilEntidade 
                  fotoUrl={entidadeFiltrada.foto_perfil_url}
                  nome={entidadeFiltrada.nome}
                  size="md"
                />
                <div>
                  <Badge variant="secondary" className="text-sm bg-insper-red/20 text-insper-red border-insper-red/30 mb-1">
                    Filtrado por entidade
                  </Badge>
                  <div className="text-sm font-semibold text-insper-dark-gray">
                    Mostrando projetos de: {entidadeFiltrada.nome}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearEntityFilter}
                className="border-insper-red/30 text-insper-red hover:bg-insper-red/10"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar filtro
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-insper-red" />
            <p className="text-insper-dark-gray font-medium">
              {filteredProjetos.length} projeto{filteredProjetos.length !== 1 ? 's' : ''} encontrado{filteredProjetos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {filteredProjetos.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou buscar com outros termos.
            </p>
            {getActiveFiltersCount() > 0 && (
              <Button onClick={clearAllFilters} variant="outline" className="bg-insper-red/10 text-insper-red border-insper-red/30 hover:bg-insper-red/20">
                Limpar todos os filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjetos.map((projeto) => (
              <ProjetoCard
                key={projeto.id}
                projeto={projeto}
                viewMode="grid"
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <Button 
              onClick={loadMore} 
              disabled={isLoadingMore}
              className="bg-insper-red hover:bg-insper-red/90"
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais projetos'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projetos;

