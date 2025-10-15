
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users, ArrowRight, Clock, X, Sparkles, Target, TrendingUp, Building2, Heart, Star } from 'lucide-react';
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
import { useEventos } from '@/hooks/useEventos';
import InscricaoEventoForm from '@/components/InscricaoEventoForm';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';
import { AREAS_ATUACAO } from '@/lib/constants';

const Eventos = () => {

  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['futuro', 'proximo']);
  
  // Filtros simplificados
  const [selectedAreaFilters, setSelectedAreaFilters] = useState<string[]>([]);
  const [enablePersonalizedFilter, setEnablePersonalizedFilter] = useState(false);
  
  const [filteredByEntity, setFilteredByEntity] = useState<string | null>(null);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showInscricaoDialog, setShowInscricaoDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const { user, profile } = useAuth();

  // Effect para detectar filtro de entidade na URL
  useEffect(() => {
    const entidadeId = searchParams.get('entidade');
    setFilteredByEntity(entidadeId);
  }, [searchParams]);

  // Usar o novo hook otimizado para eventos
  const { 
    eventos, 
    loading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore 
  } = useEventos({ 
    pageSize: 10000, 
    enablePagination: true,
    statusAprovacao: 'aprovado',
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
          .select('nome')
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

  // Buscar participantes de todos os eventos para verificar inscrições (otimizado)
  const [participantes, setParticipantes] = useState<any[]>([]);

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const { data, error } = await supabase
          .from('participantes_evento')
          .select('evento_id, email')
          .limit(1000); // Limitar para não sobrecarregar
        
        if (error) throw error;
        setParticipantes(data || []);
      } catch (err) {
        console.error('Erro ao carregar participantes:', err);
      }
    };

    fetchParticipantes();
  }, []);

  const clearEntityFilter = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('entidade');
      return newParams;
    });
  };

  const toggleStatusFilter = (filterId: string) => {
    if (filterId === 'todos') {
      setSelectedFilters(['futuro', `proximo`]);
    } else {
      setSelectedFilters(prev => 
        prev.includes('todos') 
          ? [filterId]
          : prev.includes(filterId)
            ? prev.filter(f => f !== filterId)
            : [...prev, filterId]
      );
    }
  };

  const toggleAreaFilter = (area: string) => {
    setSelectedAreaFilters(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters(['todos']);
    setSelectedAreaFilters([]);
    setEnablePersonalizedFilter(false);
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return (selectedFilters.length > 0 && !selectedFilters.includes('todos') ? selectedFilters.length : 0) + 
           selectedAreaFilters.length + 
           (enablePersonalizedFilter ? 1 : 0);
  };

  const getEventoStatus = (evento: any) => {
    const now = new Date();
    const dataEvento = evento.data;
    const horarioInicio = evento.horario_inicio;
  
    if (!dataEvento) return 'futuro';
  
    // Criar data completa combinando data e horário de início
    const dataCompleta = (() => {
      const [y, m, d] = dataEvento.split("-");
      const [h = 0, min = 0] = horarioInicio ? horarioInicio.split(":") : [0, 0];
      return new Date(+y, +m - 1, +d, +h, +min);
    })();
  
    if (dataCompleta < now) {
      return 'finalizado';
    } else if (dataCompleta.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return 'proximo';
    } else {
      return 'futuro';
    }
  };

  // Função para calcular score de personalização baseado nas áreas de interesse do usuário
  const getPersonalizedScore = (evento: any) => {
    if (!enablePersonalizedFilter || !profile?.area_interesse || !evento.area_atuacao) {
      return 0;
    }

    const userAreas = Array.isArray(profile.area_interesse) ? profile.area_interesse : [profile.area_interesse];
    const eventoAreas = Array.isArray(evento.area_atuacao) ? evento.area_atuacao : [evento.area_atuacao];
    
    // Contar quantas áreas do usuário coincidem com as do evento
    const matchingAreas = eventoAreas.filter(area => userAreas.includes(area));
    
    // Score baseado na porcentagem de match
    return matchingAreas.length / Math.max(userAreas.length, eventoAreas.length);
  };

  const handleInscricao = (evento: any) => {
    setSelectedEvento(evento);
    setShowInscricaoDialog(true);
  };

  const getStatusColor = (status: string, dataEvento: string, horarioInicio?: string) => {
    const eventoStatus = getEventoStatus({ data: dataEvento, horario_inicio: horarioInicio });
    
    switch (eventoStatus) {
      case 'finalizado':
        return 'bg-gray-100 text-gray-600';
      case 'proximo':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusLabel = (status: string, dataEvento: string, horarioInicio?: string) => {
    const eventoStatus = getEventoStatus({ data: dataEvento, horario_inicio: horarioInicio });
    
    switch (eventoStatus) {
      case 'finalizado':
        return 'Finalizado';
      case 'proximo':
        return 'Próximo';
      default:
        return 'Futuro';
    }
  };

  const isUserInscrito = (eventoId: string) => {
    if (!user?.email) return false;
    return participantes.some(p => p.evento_id === eventoId && p.email === user.email);
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = 
      evento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.entidades?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = selectedFilters.includes('todos') || 
                               selectedFilters.includes(getEventoStatus(evento));
    
    const matchesAreaFilter = selectedAreaFilters.length === 0 || 
                             (evento.area_atuacao && 
                              selectedAreaFilters.some(selectedArea => 
                                evento.area_atuacao.includes(selectedArea)
                              ));
    
    return matchesSearch && matchesStatusFilter && matchesAreaFilter;
  });

  // Ordenar eventos se o filtro personalizado estiver ativo
  const sortedEventos = enablePersonalizedFilter 
    ? [...filteredEventos].sort((a, b) => {
        const scoreA = getPersonalizedScore(a);
        const scoreB = getPersonalizedScore(b);
        return scoreB - scoreA; // Ordenar por score decrescente
      })
    : filteredEventos;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando eventos...</p>
          <p className="text-insper-dark-gray/60 text-sm mt-2">Preparando as melhores oportunidades para você</p>
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
          <h3 className="text-xl font-semibold text-insper-black mb-2">Erro ao carregar eventos</h3>
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
              {/* {eventos.length} Eventos Disponíveis */}
              {eventos.filter(e => new Date(e.data) > new Date()).length} Eventos Disponíveis

            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Eventos das Organizações Estudantis
            </h1>
            
            <p className="text-xl text-insper-red/90 max-w-3xl mx-auto leading-relaxed">
              Descubra workshops, palestras e atividades organizadas pelas organizações estudantis. 
              Conecte-se, aprenda e participe da comunidade que move o Insper.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-4 h-6 w-6 text-insper-dark-gray/60" />
              <Input
                placeholder="Buscar eventos, organizações estudantis ou temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg text-black placeholder:text-gray-500"
              />
              <div className="absolute right-4 top-4 text-xs text-gray-400">
                💡 Dica: Digite o nome de uma organização para ver seus eventos
              </div>
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
                  avoidCollisions={true}
                  collisionPadding={20}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-insper-black">Filtros de Eventos</h4>
                      {getActiveFiltersCount() > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-insper-red hover:text-insper-red/80">
                          Limpar tudo
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-3 block text-insper-dark-gray">Status do Evento</label>
                        <div className="space-y-3">
                          {['todos', 'futuro', 'proximo', 'finalizado'].map((status) => (
                            <div key={status} className="flex items-center space-x-3">
                              <Checkbox
                                id={status}
                                checked={selectedFilters.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                                className="text-insper-red"
                              />
                              <label htmlFor={status} className="text-sm cursor-pointer hover:text-insper-red transition-colors capitalize">
                                {status === 'todos' ? 'Todos os eventos' : status}
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

                      <div>
                        <label className="text-sm font-medium mb-3 block text-insper-dark-gray">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="personalizado"
                              checked={enablePersonalizedFilter}
                              onCheckedChange={() => setEnablePersonalizedFilter(!enablePersonalizedFilter)}
                              className="text-insper-red"
                            />
                            <span className="text-sm cursor-pointer hover:text-insper-red transition-colors">
                              Filtro Personalizado
                            </span>
                          </div>
                        </label>
                        {enablePersonalizedFilter && (
                          <div className="mt-3 p-3 bg-insper-red/5 rounded-lg border border-insper-red/20">
                            <div className="flex items-center gap-2 text-sm text-insper-red mb-2">
                              <Heart className="w-4 h-4" />
                              <span className="font-medium">Baseado nas suas áreas de interesse</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Os eventos serão ordenados por relevância baseada nas suas áreas de interesse cadastradas no perfil.
                            </p>
                            {profile?.area_interesse && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Suas áreas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(profile.area_interesse) 
                                    ? profile.area_interesse.map(area => (
                                        <Badge key={area} variant="secondary" className="text-xs bg-insper-red/20 text-insper-red">
                                          {area}
                                        </Badge>
                                      ))
                                    : (
                                        <Badge variant="secondary" className="text-xs bg-insper-red/20 text-insper-red">
                                          {profile.area_interesse}
                                        </Badge>
                                      )
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                {!selectedFilters.includes('todos') && selectedFilters.map(filter => {
                  return (
                    <Badge key={filter} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                      {filter === 'futuro' ? 'Futuros' : filter === 'proximo' ? 'Próximos' : filter === 'finalizado' ? 'Finalizados' : filter}
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

                {enablePersonalizedFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                    <Heart className="w-3 h-3" />
                    Personalizado
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-white/20 text-white"
                      onClick={() => setEnablePersonalizedFilter(false)}
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
                <div className="w-10 h-10 bg-insper-red/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-insper-red" />
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm bg-insper-red/20 text-insper-red border-insper-red/30 mb-1">
                    Filtrado por entidade
                  </Badge>
                  <div className="text-sm font-semibold text-insper-dark-gray">
                    Mostrando eventos de: {entidadeFiltrada.nome}
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
              {sortedEventos.length} evento{sortedEventos.length !== 1 ? 's' : ''} encontrado{sortedEventos.length !== 1 ? 's' : ''}
            </p>
            {enablePersonalizedFilter && (
              <Badge variant="secondary" className="bg-insper-red/20 text-insper-red border-insper-red/30">
                <Heart className="w-3 h-3 mr-1" />
                Personalizado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {enablePersonalizedFilter && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Star className="w-3 h-3 text-insper-red" />
                Ordenado por relevância
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedEventos.map((evento) => (
            <div key={evento.id} className="group">
              <Card className="h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                <div className="relative flex flex-col h-full">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-insper-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {/* Indicador de relevância personalizada */}
                  {enablePersonalizedFilter && (
                    <div className="absolute top-3 right-3 z-10">
                      {(() => {
                        const score = getPersonalizedScore(evento);
                        if (score > 0.7) {
                          return (
                            <Badge className="bg-green-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Alta Relevância
                            </Badge>
                          );
                        } else if (score > 0.3) {
                          return (
                            <Badge className="bg-yellow-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Relevante
                            </Badge>
                          );
                        } else if (score > 0) {
                          return (
                            <Badge className="bg-blue-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Relacionado
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  
                  {/* Área clicável do card - leva para página do evento */}
                  <div 
                    className="flex-1 cursor-pointer z-10 relative"
                    onClick={() => {
                      window.location.href = `/eventos/${evento.id}`;
                    }}
                  >
                    <CardHeader className="pb-4 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-insper-red transition-colors duration-300 font-bold mb-3">
                            {evento.nome}
                          </CardTitle>
                          
                          {/* Status do evento com design melhorado */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge 
                              className={`${
                                getStatusColor('', (evento as any).data, (evento as any).horario_inicio) === 'bg-green-100 text-green-700' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : getStatusColor('', (evento as any).data, (evento as any).horario_inicio) === 'bg-orange-100 text-orange-700'
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              } font-medium text-xs px-3 py-1`}
                            >
                              {getStatusLabel('', (evento as any).data, (evento as any).horario_inicio)}
                            </Badge>
                            
                            {/* Badge da entidade organizadora */}
                            {evento.entidades && (
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-insper-red/10 text-insper-red border-insper-red/20 font-medium px-3 py-1"
                              >
                                {evento.entidades.nome}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Informações de data e horário */}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-insper-dark-gray/70">
                              <Calendar className="mr-2 h-4 w-4 text-insper-red" />
                              <span className="font-medium">
                                {format(
                                  (() => {
                                    const [y, m, d] = ((evento as any).data as string).split("-");
                                    return new Date(+y, +m - 1, +d);
                                  })(),
                                  "dd 'de' MMMM, yyyy",
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-insper-dark-gray/70">
                              <Clock className="mr-2 h-4 w-4 text-insper-red" />
                              <span className="font-medium">
                                {(evento as any).horario_inicio && (evento as any).horario_termino 
                                  ? `${(evento as any).horario_inicio} - ${(evento as any).horario_termino}`
                                  : (evento as any).horario_inicio || 'Horário não definido'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Logo da entidade organizadora */}
                        {evento.entidades && (
                          <div className="ml-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <FotoPerfilEntidade 
                              fotoUrl={evento.entidades.foto_perfil_url}
                              nome={evento.entidades.nome}
                              size="lg"
                              className="shadow-lg"
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        {/* Descrição do evento */}
                        <p className="text-insper-dark-gray text-sm leading-relaxed line-clamp-3">
                          {evento.descricao || 'Descrição não disponível'}
                        </p>

                        {/* Áreas de atuação */}
                        {evento.area_atuacao && evento.area_atuacao.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {evento.area_atuacao.map((area) => (
                              <Badge 
                                key={area} 
                                variant="secondary" 
                                className="text-xs bg-insper-red/10 text-insper-red border-insper-red/20 hover:bg-insper-red/20 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAreaFilter(area);
                                }}
                              >
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Professores Convidados */}
                        {evento.reservas && evento.reservas.length > 0 && evento.reservas[0].professores_convidados_json && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-insper-dark-gray mb-2">
                              <Users className="w-4 h-4 text-insper-red" />
                              Professores Convidados
                            </div>
                            <div className="text-sm text-gray-700">
                              {(() => {
                                try {
                                  const professores = JSON.parse(evento.reservas[0].professores_convidados_json);
                                  return professores.map((professor: any, index: number) => (
                                    <span key={index}>
                                      {professor.nomeCompleto}
                                      {index < professores.length - 1 ? ', ' : ''}
                                    </span>
                                  ));
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Informações adicionais em cards destacados */}
                        <div className="space-y-3">
                          {evento.local && (
                            <div className="bg-gradient-to-r from-insper-light-gray/50 to-insper-light-gray/30 border border-insper-light-gray-1 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-insper-red flex-shrink-0" />
                                <span className="text-sm font-medium text-insper-dark-gray">
                                  {evento.local}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {evento.capacidade && (
                            <div className="bg-gradient-to-r from-insper-yellow/10 to-insper-yellow/5 border border-insper-yellow/20 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-insper-yellow-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-insper-dark-gray">
                                  Capacidade: {evento.capacidade} pessoas
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Link do evento se disponível */}
                        {evento.link_evento && (
                          <div className="bg-gradient-to-r from-insper-blue/10 to-insper-blue/5 border border-insper-blue/20 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-insper-blue rounded-full flex-shrink-0"></div>
                              <span className="text-sm font-medium text-insper-dark-gray">
                                Link do evento disponível
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  {/* Área dos botões - não clicável para navegação do card */}
                  <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-100 flex-shrink-0 px-6 pb-6">
                    {/* Botão de inscrição */}
                    {(() => {
                      if (isUserInscrito(evento.id)) {
                        return (
                          <Button className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300" disabled>
                            ✓ Já inscrito
                          </Button>
                        );
                      } else if (!user) {
                        return (
                          <Button className="flex-1 bg-insper-red hover:bg-insper-red/90 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                            <Link to="/auth">
                              Fazer login
                            </Link>
                          </Button>
                        );
                      } else {
                        return (
                          <Button 
                            className="flex-1 bg-insper-red hover:bg-insper-red/90 shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInscricao(evento);
                            }}
                          >
                            Inscrever-se
                          </Button>
                        );
                      }
                    })()}
                    
                    {/* Botão de ver mais */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="group-hover:bg-insper-light-gray border-insper-light-gray-1 hover:border-insper-light-gray-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/eventos/${evento.id}`;
                      }}
                    >
                      Ver Mais
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <Button 
              onClick={loadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="border-insper-red/30 text-insper-red hover:bg-insper-red/10 hover:border-insper-red/50 px-8 py-3"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-insper-red border-t-transparent mr-2"></div>
                  Carregando...
                </>
              ) : (
                <>
                  Carregar mais eventos
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {sortedEventos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-insper-red/20 to-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Calendar size={48} className="text-insper-red" />
            </div>
            <h3 className="text-2xl font-bold text-insper-black mb-4">
              Nenhum evento encontrado
            </h3>
            <p className="text-insper-dark-gray text-lg max-w-md mx-auto mb-8">
              Tente ajustar os filtros ou usar outros termos de busca para encontrar os eventos que você procura
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="border-insper-red/30 text-insper-red hover:bg-insper-red/10"
              >
                Limpar busca
              </Button>
              <Button 
                onClick={clearAllFilters}
                className="bg-insper-red hover:bg-insper-red/90"
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
               link_evento={selectedEvento.link_evento || ''}
               onSuccess={() => {
                 setShowInscricaoDialog(false);
                 setSelectedEvento(null);
                 // Recarregar participantes
                 window.location.reload();
               }}
             />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Eventos;
