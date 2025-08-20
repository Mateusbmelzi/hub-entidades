
import React, { useState, useEffect } from 'react';
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
import { useEventos } from '@/hooks/useEventos';
import InscricaoEventoForm from '@/components/InscricaoEventoForm';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';

const Eventos = () => {

  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['futuro', 'proximo']);
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<string[]>([]);
  const [filteredByEntity, setFilteredByEntity] = useState<string | null>(null);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showInscricaoDialog, setShowInscricaoDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const { user } = useAuth();

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

  // Buscar todas as entidades para o filtro (otimizado)
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loadingEntidades, setLoadingEntidades] = useState(false);

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        setLoadingEntidades(true);
        const { data, error } = await supabase
          .from('entidades')
          .select('id, nome')
          .order('nome')
          .limit(50); // Limitar para não sobrecarregar
        
        if (error) throw error;
        setEntidades(data || []);
      } catch (err) {
        console.error('Erro ao carregar entidades:', err);
      } finally {
        setLoadingEntidades(false);
      }
    };

    fetchEntidades();
  }, []);

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

  const toggleEntityFilter = (entityId: string) => {
    setSelectedEntityFilters(prev => 
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters(['todos']);
    setSelectedEntityFilters([]);
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return (selectedFilters.length > 0 && !selectedFilters.includes('todos') ? selectedFilters.length : 0) + 
           selectedEntityFilters.length;
  };

  const getEventoStatus = (evento: any) => {
    const now = new Date();
    const dataEvento = evento.data;
    const horarioEvento = evento.horario;
  
    if (!dataEvento) return 'futuro';
  
    // Criar data completa combinando data e horário direto na linha
    const dataCompleta = (() => {
      const [y, m, d] = dataEvento.split("-");
      const [h = 0, min = 0] = horarioEvento ? horarioEvento.split(":") : [0, 0];
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
  

  const handleInscricao = (evento: any) => {
    setSelectedEvento(evento);
    setShowInscricaoDialog(true);
  };

  const getStatusColor = (status: string, dataEvento: string, horarioEvento?: string) => {
    const eventoStatus = getEventoStatus({ data: dataEvento, horario: horarioEvento });
    
    switch (eventoStatus) {
      case 'finalizado':
        return 'bg-gray-100 text-gray-600';
      case 'proximo':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusLabel = (status: string, dataEvento: string, horarioEvento?: string) => {
    const eventoStatus = getEventoStatus({ data: dataEvento, horario: horarioEvento });
    
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
    
    const matchesEntityFilter = selectedEntityFilters.length === 0 || 
                               selectedEntityFilters.includes(evento.entidade_id?.toString());
    
    return matchesSearch && matchesStatusFilter && matchesEntityFilter;
  });

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
                        <label className="text-sm font-medium mb-3 block text-insper-dark-gray">Organizações Estudantis</label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {!loadingEntidades && entidades.slice(0, 10).map((entidade) => (
                            <div key={entidade.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={entidade.id.toString()}
                                checked={selectedEntityFilters.includes(entidade.id.toString())}
                                onCheckedChange={() => toggleEntityFilter(entidade.id.toString())}
                                className="text-insper-red"
                              />
                              <label htmlFor={entidade.id.toString()} className="text-sm cursor-pointer hover:text-insper-red transition-colors">
                                {entidade.nome}
                              </label>
                            </div>
                          ))}
                        </div>
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
                
                {selectedEntityFilters.map(entityId => {
                  const entity = entidades.find(e => e.id.toString() === entityId);
                  return (
                    <Badge key={entityId} variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
                      {entity?.nome}
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

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-insper-red" />
            <p className="text-insper-dark-gray font-medium">
              {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} encontrado{filteredEventos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEventos.map((evento) => (
            <div key={evento.id} className="group">
              <Card className="h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                <div className="relative flex flex-col h-full">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-insper-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
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
                                getStatusColor('', (evento as any).data, (evento as any).horario) === 'bg-green-100 text-green-700' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : getStatusColor('', (evento as any).data, (evento as any).horario) === 'bg-orange-100 text-orange-700'
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              } font-medium text-xs px-3 py-1`}
                            >
                              {getStatusLabel('', (evento as any).data, (evento as any).horario)}
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
                                {(evento as any).horario || 'Horário não definido'}
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

        {filteredEventos.length === 0 && (
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
