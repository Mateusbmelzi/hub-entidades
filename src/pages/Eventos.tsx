
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users, ArrowRight, Clock, X, Sparkles, Target, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import InscricaoEventoForm from '@/components/InscricaoEventoForm';

const Eventos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['todos']);
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<string[]>([]);
  const [filteredByEntity, setFilteredByEntity] = useState<string | null>(null);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showInscricaoDialog, setShowInscricaoDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [displayedEventsCount, setDisplayedEventsCount] = useState(6);
  const { user } = useAuth();

  // Effect para detectar filtro de entidade na URL
  useEffect(() => {
    const entidadeId = searchParams.get('entidade');
    setFilteredByEntity(entidadeId);
  }, [searchParams]);

  // Effect para resetar paginação quando o termo de busca muda
  useEffect(() => {
    resetPagination();
  }, [searchTerm]);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome)
        `)
        .eq('status_aprovacao', 'aprovado') // Apenas eventos aprovados
        .order('data_evento', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar todas as entidades para o filtro
  const { data: entidades = [] } = useQuery({
    queryKey: ['entidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entidades')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar informações da entidade filtrada
  const { data: entidadeFiltrada } = useQuery({
    queryKey: ['entidade', filteredByEntity],
    queryFn: async () => {
      if (!filteredByEntity) return null;
      const { data, error } = await supabase
        .from('entidades')
        .select('nome')
        .eq('id', parseInt(filteredByEntity))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!filteredByEntity
  });

  // Buscar participantes de todos os eventos para verificar inscrições
  const { data: participantes = [], refetch: refetchParticipantes } = useQuery({
    queryKey: ['participantes-eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participantes_evento')
        .select('evento_id, email');
      
      if (error) throw error;
      return data;
    }
  });

  const filters = [
    { id: 'todos', label: 'Todos os futuros' },
    { id: 'proximos', label: 'Próximos' },
    { id: 'finalizados', label: 'Finalizados' },
    { id: 'passados', label: 'Mostrar eventos passados' },
  ];

  const entityFilters = entidades.map(entidade => ({
    id: entidade.id.toString(),
    label: entidade.nome
  }));

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.entidades?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const eventDate = new Date(evento.data_evento);
    const isPastEvent = eventDate < now;
    
    let matchesFilter = true;
    if (!selectedFilters.includes('todos')) {
      matchesFilter = selectedFilters.some(filter => {
        if (filter === 'proximos') return eventDate > now;
        if (filter === 'finalizados') return eventDate < now || evento.status === 'finalizado';
        if (filter === 'passados') return isPastEvent;
        return false;
      });
    } else {
      // Por padrão, mostrar apenas eventos futuros
      matchesFilter = !isPastEvent;
    }
    
    // Filtrar por entidade URL param ou filtros selecionados
    let matchesEntity = true;
    if (filteredByEntity) {
      matchesEntity = evento.entidades?.id?.toString() === filteredByEntity;
    } else if (selectedEntityFilters.length > 0) {
      matchesEntity = selectedEntityFilters.includes(evento.entidades?.id?.toString() || '');
    }
    
    return matchesSearch && matchesFilter && matchesEntity;
  }).sort((a, b) => {
    // Ordenar por data/hora, do mais antigo para o mais recente
    return new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime();
  });

  const clearEntityFilter = () => {
    setFilteredByEntity(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('entidade');
    setSearchParams(newSearchParams);
    resetPagination();
  };

  const toggleStatusFilter = (filterId: string) => {
    if (filterId === 'todos') {
      setSelectedFilters(['todos']);
    } else if (filterId === 'passados') {
      // Se "Mostrar eventos passados" está selecionado, remover "todos" e adicionar "passados"
      const newFilters = selectedFilters.includes(filterId)
        ? selectedFilters.filter(f => f !== filterId)
        : [...selectedFilters.filter(f => f !== 'todos'), filterId];
      
      setSelectedFilters(newFilters.length === 0 ? ['todos'] : newFilters);
    } else {
      const newFilters = selectedFilters.includes(filterId)
        ? selectedFilters.filter(f => f !== filterId)
        : [...selectedFilters.filter(f => f !== 'todos'), filterId];
      
      setSelectedFilters(newFilters.length === 0 ? ['todos'] : newFilters);
    }
    resetPagination();
  };

  const toggleEntityFilter = (entityId: string) => {
    setSelectedEntityFilters(prev => 
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
    resetPagination();
  };

  const clearAllFilters = () => {
    setSelectedFilters(['todos']);
    setSelectedEntityFilters([]);
    resetPagination();
  };

  const getActiveFiltersCount = () => {
    const statusCount = selectedFilters.includes('todos') ? 0 : selectedFilters.length;
    const entityCount = selectedEntityFilters.length;
    return statusCount + entityCount;
  };

  const handleLoadMore = () => {
    setDisplayedEventsCount(prev => prev + 6);
  };

  const resetPagination = () => {
    setDisplayedEventsCount(6);
  };

  // Funções auxiliares para verificar o status do evento e inscrição do usuário
  const getEventoStatus = (evento: any) => {
    const usuarioInscrito = user && participantes.find(p => p.evento_id === evento.id && p.email === user.email);
    const eventoAtivo = evento.status === 'ativo' && new Date(evento.data_evento) > new Date();
    const eventoLotado = evento.capacidade && participantes.filter(p => p.evento_id === evento.id).length >= evento.capacidade;
    
    return { usuarioInscrito, eventoAtivo, eventoLotado };
  };

  const handleInscricao = (evento: any) => {
    setSelectedEvento(evento);
    setShowInscricaoDialog(true);
  };

  const getStatusColor = (status: string, dataEvento: string) => {
    const now = new Date();
    const eventDate = new Date(dataEvento);
    
    if (status === 'cancelado') return 'destructive';
    if (status === 'finalizado' || eventDate < now) return 'secondary';
    return 'success';
  };

  const getStatusLabel = (status: string, dataEvento: string) => {
    const now = new Date();
    const eventDate = new Date(dataEvento);
    
    if (status === 'cancelado') return 'Cancelado';
    if (status === 'finalizado' || eventDate < now) return 'Finalizado';
    return 'Ativo';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando eventos...</p>
<p className="text-insper-dark-gray/60 text-sm mt-2">Preparando as melhores experiências para você</p>
        </div>
      </div>
    );
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
              {eventos.length} Eventos Disponíveis
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Eventos do Insper
            </h1>
            
            <p className="text-xl text-insper-red/90 max-w-3xl mx-auto leading-relaxed">
              Descubra workshops, palestras e atividades organizadas pelas entidades estudantis. 
              Conecte-se, aprenda e participe da comunidade que move o Insper.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 h-6 w-6 text-insper-dark-gray/60" />
                              <Input
                placeholder="Buscar eventos, entidades ou temas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetPagination();
                }}
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
                <PopoverContent className="w-80 z-50 bg-white border shadow-xl rounded-xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Filtros de Eventos</h4>
                        {getActiveFiltersCount() > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                            Limpar tudo
                          </Button>
                        )}
                      </div>
                      
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-3 block text-gray-900">Status do Evento</label>
                      <div className="space-y-3">
                            {filters.map((filter) => (
                            <div key={filter.id} className="flex items-center space-x-3">
                                <Checkbox
                                  id={filter.id}
                                  checked={selectedFilters.includes(filter.id)}
                                  onCheckedChange={() => toggleStatusFilter(filter.id)}
                                className="text-red-600"
                                />
                              <label htmlFor={filter.id} className="text-sm cursor-pointer hover:text-red-600 transition-colors">
                                  {filter.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                        <label className="text-sm font-medium mb-3 block text-gray-900">Entidades</label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {entityFilters.map((entity) => (
                            <div key={entity.id} className="flex items-center space-x-3">
                                <Checkbox
                                  id={entity.id}
                                  checked={selectedEntityFilters.includes(entity.id)}
                                  onCheckedChange={() => toggleEntityFilter(entity.id)}
                                className="text-red-600"
                                />
                              <label htmlFor={entity.id} className="text-sm cursor-pointer hover:text-red-600 transition-colors">
                                  {entity.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button size="sm" onClick={() => setShowFiltersPopover(false)} className="bg-red-600 hover:bg-red-700">
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
                  {!selectedFilters.includes('todos') && selectedFilters.map(filter => {
                    const filterObj = filters.find(f => f.id === filter);
                    return (
                    <Badge key={filter} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                        {filterObj?.label}
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
                  
                  {selectedEntityFilters.map(entityId => {
                    const entity = entityFilters.find(e => e.id === entityId);
                    return (
                    <Badge key={entityId} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                        {entity?.label}
                        <Button
                          variant="ghost"
                          size="sm"
                        className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                          onClick={() => toggleEntityFilter(entityId)}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Entity Filter Banner */}
        {filteredByEntity && entidadeFiltrada && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm bg-red-100 text-red-800 border-red-200 mb-1">
                  Filtrado por entidade
                </Badge>
                  <div className="text-sm font-semibold text-gray-900">
                  Mostrando eventos de: {entidadeFiltrada.nome}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearEntityFilter}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar filtro
              </Button>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-red-600" />
            <p className="text-gray-600 font-medium">
            {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} encontrado{filteredEventos.length !== 1 ? 's' : ''}
          </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEventos.slice(0, displayedEventsCount).map((evento) => (
            <Card key={evento.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-0 shadow-lg bg-white overflow-hidden">
              <Link to={`/eventos/${evento.id}`} className="block">
                <div className="relative">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-red-600 transition-colors duration-300 font-bold mb-3">
                        {evento.nome}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(evento.data_evento), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-2 h-4 w-4" />
                      {format(new Date(evento.data_evento), "HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                    </div>
                    <Badge 
                      variant={getStatusColor(evento.status, evento.data_evento)} 
                      className={`text-xs font-medium ${
                        getStatusColor(evento.status, evento.data_evento) === 'success' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : getStatusColor(evento.status, evento.data_evento) === 'destructive'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                    {getStatusLabel(evento.status, evento.data_evento)}
                  </Badge>
                </div>
              </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {evento.descricao}
                </p>

                    <div className="space-y-3">
                  {evento.local && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="mr-2 h-4 w-4" />
                      {evento.local}
                    </div>
                  )}
                  
                  {evento.capacidade && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-2 h-4 w-4" />
                      Capacidade: {evento.capacidade} pessoas
                    </div>
                  )}

                  {evento.entidades && (
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        {evento.entidades.nome}
                      </Badge>
                    </div>
                  )}
                </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const { usuarioInscrito, eventoAtivo, eventoLotado } = getEventoStatus(evento);
                    
                    if (usuarioInscrito) {
                      return (
                        <Button className="flex-1" variant="outline" disabled>
                          ✓ Já inscrito
                        </Button>
                      );
                    } else if (!eventoAtivo) {
                      return (
                        <Button className="flex-1" variant="outline" disabled>
                          {evento.status === 'cancelado' ? 'Cancelado' : 'Finalizado'}
                        </Button>
                      );
                    } else if (eventoLotado) {
                      return (
                        <Button className="flex-1" variant="outline" disabled>
                          Evento lotado
                        </Button>
                      );
                    } else if (!user) {
                      return (
                        <Button className="flex-1" variant="outline" asChild>
                          <Link to="/auth">
                            Fazer login
                          </Link>
                        </Button>
                      );
                    } else {
                      return (
                        <Button 
                              className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => handleInscricao(evento)}
                        >
                          Inscrever-se
                        </Button>
                      );
                    }
                  })()}
                      <Button variant="outline" size="sm" className="group-hover:bg-gray-50 border-gray-200 hover:border-gray-300" asChild>
                    <Link to={`/eventos/${evento.id}`}>
                      Ver Mais
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </Button>
                    </div>
                </div>
              </CardContent>
              </div>
            </Link>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {filteredEventos.length > displayedEventsCount && (
          <div className="flex justify-center mt-12">
            <Button 
              onClick={handleLoadMore}
              variant="outline"
              size="lg"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-8 py-3"
            >
              Carregar mais eventos
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        )}

        {filteredEventos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Calendar size={48} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
              Tente ajustar os filtros ou usar outros termos de busca para encontrar os eventos que você procura
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Limpar busca
              </Button>
              <Button 
                onClick={clearAllFilters}
                className="bg-red-600 hover:bg-red-700"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Inscrição */}
      {selectedEvento && (
        <Dialog open={showInscricaoDialog} onOpenChange={setShowInscricaoDialog}>
          <DialogContent>
            <InscricaoEventoForm 
              eventoId={selectedEvento.id}
              eventoNome={selectedEvento.nome}
              onSuccess={() => {
                setShowInscricaoDialog(false);
                setSelectedEvento(null);
                refetchParticipantes();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Eventos;
