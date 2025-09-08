
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Mail, MapPin, Clock, Star, ExternalLink, Edit, Plus, LogIn, LogOut, Trash2, MoreVertical, FolderOpen, Building2, Target, Sparkles, Award, TrendingUp, Camera, Phone, ClipboardList, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEntidade } from '@/hooks/useEntidade';
import { useProjetos } from '@/hooks/useProjetos';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteProjeto } from '@/hooks/useDeleteProjeto';
import { useEventosEntidade } from '@/hooks/useEventosEntidade';
import { useDeleteEventoAsEntity } from '@/hooks/useDeleteEventoAsEntity';
import { useCheckInterestDemonstration } from '@/hooks/useCheckInterestDemonstration';
import { useReservasUsuario } from '@/hooks/useReservas';
import { supabase } from '@/integrations/supabase/client';
import EditarEventoEntidade from '@/components/EditarEventoEntidade';
import EntityLoginForm from '@/components/EntityLoginForm';
import EditarEntidadeForm from '@/components/EditarEntidadeForm';
import CriarProjetoForm from '@/components/CriarProjetoForm';
import EditarProjetoForm from '@/components/EditarProjetoForm';
import CriarEventoEntidade from '@/components/CriarEventoEntidade';
import GerenciarAreasInternas from '@/components/GerenciarAreasInternas';
import { ToastAction } from '@/components/ui/toast';
import { AreaAtuacaoDisplay } from '@/components/ui/area-atuacao-display';
import { getFirstAreaColor } from '@/lib/constants';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';
import { UploadFotoPerfil } from '@/components/UploadFotoPerfil';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { combineDataHorario } from '@/lib/date-utils';
import type { Projeto } from '@/hooks/useProjetos';
import type { Evento } from '@/hooks/useEventosEntidade';

const EntidadeDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleEntidadeUpdate = useCallback(() => {
    console.log('🔄 Entidade atualizada - resetando estado de loading');
    
    setIsUpdating(false);
  }, []);
  
  const { entidade, loading, error, refetch: refetchEntidade } = useEntidade(id, handleEntidadeUpdate);
  // console.log(entidade.encerramento_primeira_fase) 
  const { projetos, loading: projetosLoading, refetch: refetchProjetos } = useProjetos(entidade?.id);
  // const { eventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id);
  
  const { entidadeId, isAuthenticated, logout } = useEntityAuth();
  const { user, profile } = useAuth();
  const { deleteProjeto, loading: deleteLoading } = useDeleteProjeto();
  const { deleteEvento, loading: deleteEventoLoading } = useDeleteEventoAsEntity();
  const { hasDemonstratedInterest, loading: interestCheckLoading, refresh: refreshInterestCheck } = useCheckInterestDemonstration(entidade?.id);
  const { toast } = useToast();
  
  const isOwner = isAuthenticated && entidadeId === entidade?.id;
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [showFotoDialog, setShowFotoDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string | null>(null);
  
  const { eventos: allEventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id, isOwner);
  const eventos = allEventos?.filter(ev => {
    const hoje = new Date();
    const dataEvento = combineDataHorario(ev.data, ev.horario);
    return dataEvento >= hoje;
  });

  // Buscar reservas da entidade
  const { reservasUsuario, loading: reservasLoading, refetch: refetchReservas } = useReservasUsuario(user?.id || '');
  const reservasEntidade = reservasUsuario?.filter(reserva => 
    reserva.entidade_id === entidade?.id
  ) || [];

  // Sincronizar foto de perfil quando entidade for carregada
  useEffect(() => {
    if (entidade?.foto_perfil_url !== currentFotoUrl) {
      setCurrentFotoUrl(entidade?.foto_perfil_url || null);
    }
  }, [entidade?.foto_perfil_url, currentFotoUrl]);

  // Tratar mensagens de sucesso vindas de outras páginas
  useEffect(() => {
    if (location.state?.success && location.state?.message) {
      toast({
        title: '✅ Sucesso!',
        description: location.state.message,
        duration: 5000,
      });
      
      // Limpar o state para evitar mostrar a mensagem novamente
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, toast]);

  const handleDeleteProject = async (projeto: Projeto) => {
    if (!entidade) return;
    
    const success = await deleteProjeto(projeto.id, entidade.id);
    if (success) {
      refetchProjetos();
    }
  };

  const handleEditProject = (projeto: Projeto) => {
    setSelectedProject(projeto);
    setShowEditProjectDialog(true);
  };

  const handleDeleteEvent = async (evento: Evento) => {
    if (!entidade) return;
    
    const result = await deleteEvento(evento.id, entidade.id);
    if (result.success) {
      refetchEventos();
    }
  };

  const handleEditEvent = (evento: Evento) => {
    console.log('🔄 Abrindo modal de edição para evento:', evento);
    console.log('🆔 IDs:', { eventoId: evento.id, entidadeId: entidade?.id });
    console.log('🔍 Estado atual:', { 
      showEditEventDialog, 
      selectedEvent, 
      entidadeId: entidade?.id,
      eventosCount: eventos?.length 
    });
    setSelectedEvent(evento);
    setShowEditEventDialog(true);
    console.log('✅ Modal de edição aberto');
  };

  const handleFotoUpdated = (url: string) => {
    setCurrentFotoUrl(url);
    refetchEntidade();
    
    // Fechar o modal após um pequeno delay para mostrar o feedback
    setTimeout(() => {
      setShowFotoDialog(false);
      toast({
        title: "✅ Foto atualizada com sucesso!",
        description: "A foto de perfil da entidade foi atualizada.",
        duration: 3000,
      });
    }, 1000);
  };

  const handleDemonstrarInteresse = async () => {
    if (!user || !profile || !entidade) {
      navigate('/auth');
      return;
    }

    if (!profile.profile_completed) {
      navigate('/profile-setup');
      return;
    }

    if (hasDemonstratedInterest) {
      toast({
        title: "Interesse já demonstrado",
        description: "Você já demonstrou interesse nesta entidade. Clique em 'Ver Minhas Demonstrações' para editar.",
        variant: "default",
        action: (
          <ToastAction altText="Ver minhas demonstrações" onClick={() => navigate('/minhas-demonstracoes')}>
            Ver Minhas Demonstrações
          </ToastAction>
        )
      });
      return;
    }

    // Verificar se existe um processo seletivo ativo com link de inscrição
    if (entidade?.processo_seletivo_ativo && entidade?.link_processo_seletivo) {
      try {
        // Salvar automaticamente as informações do usuário na tabela demonstracoes_interesse
        const demonstrationData = {
          entidade_id: entidade.id,
          nome_estudante: profile.nome || '',
          email_estudante: user.email || '',
          curso_estudante: profile.curso || '',
          semestre_estudante: profile.semestre || 1,
          area_interesse: profile.area_interesse || '',
          status: 'pendente' as const
        };

        const { error: insertError } = await supabase
          .from('demonstracoes_interesse')
          .insert(demonstrationData);

        if (insertError) {
          console.error('❌ Erro ao salvar demonstração de interesse:', insertError);
          toast({
            title: "⚠️ Aviso",
            description: "Link de inscrição aberto, mas houve um erro ao salvar seu interesse. Entre em contato com o suporte.",
            variant: "destructive",
          });
        } else {
          console.log('✅ Demonstração de interesse salva automaticamente');
          toast({
            title: "✅ Interesse registrado!",
            description: "Seu interesse foi registrado e o formulário de inscrição foi aberto.",
            duration: 4000,
          });
          
          // Atualizar o estado de interesse demonstrado
          refreshInterestCheck();
        }

        // Abrir o link de inscrição em uma nova aba
        window.open(entidade.link_processo_seletivo, '_blank');
        
      } catch (error) {
        console.error('❌ Erro ao processar inscrição:', error);
        toast({
          title: "⚠️ Aviso",
          description: "Link de inscrição aberto, mas houve um erro ao salvar seu interesse. Entre em contato com o suporte.",
          variant: "destructive",
        });
        
        // Mesmo com erro, abrir o link para não bloquear o usuário
        window.open(entidade.link_processo_seletivo, '_blank');
      }
      return;
    }
    
    // Se não há processo seletivo ativo, redirecionar para a página de demonstração de interesse
    navigate(`/demonstrar-interesse/${entidade.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-6">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entidade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-insper-red" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-insper-black">Organização não encontrada</h2>
              <p className="text-insper-dark-gray mb-6">
                {error || 'A organização que você está procurando não existe ou foi removida.'}
              </p>
              <Link to="/entidades">
                <Button className="bg-insper-red hover:bg-red-700 text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Organizações
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCommitmentColor = (commitment: string) => {
    switch (commitment) {
      case 'Baixo': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Alto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/entidades">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Logo and Info */}
            <div className="flex items-center space-x-6">
              <div className="shadow-xl">
                <FotoPerfilEntidade
                  fotoUrl={entidade.foto_perfil_url}
                  nome={entidade.nome}
                  size="xl"
                  className="border-4 border-white/20"
                />
              </div>
              
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-3">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Organização Estudantil
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {entidade.nome}
                  {isUpdating && (
                    <span className="ml-3 inline-flex items-center text-2xl text-red-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Atualizando...
                    </span>
                  )}
                </h1>
                
                <p className="text-xl text-red-100 max-w-2xl leading-relaxed mb-6">
                  {entidade.descricao_curta}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-red-100">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    <span className="font-medium">{entidade.numero_membros}</span>
                    <span className="ml-1">membros</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Criada em {entidade.ano_criacao || new Date(entidade.created_at).getFullYear()}</span>
                  </div>
                  <AreaAtuacaoDisplay
                    area_atuacao={entidade.area_atuacao}
                    className="text-xs"
                    compact={true}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 lg:ml-auto">
              {isOwner ? (
                <>
                  {/* Primeira linha - Botões de Gerenciamento */}
                  <div className="grid grid-cols-2 gap-3">
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                          <Edit className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Editar Perfil</span>
                          <span className="sm:hidden">Editar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <EditarEntidadeForm 
                          entidade={entidade} 
                          onSuccess={() => {
                            // console.log('🔄 onSuccess chamado - fechando dialog e refetching');
                            setShowEditDialog(false);
                            setIsUpdating(true);
                            
                            // Mostrar feedback visual de atualização
                            toast({
                              title: "🔄 Atualizando...",
                              description: "Carregando as informações atualizadas da entidade.",
                              duration: 2000,
                            });
                            
                            // Refetch com pequeno delay para garantir que o toast seja exibido
                            setTimeout(async () => {
                              await refetchEntidade();
                            }, 100);
                          }} 
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showFotoDialog} onOpenChange={setShowFotoDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                          <Camera className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Gerenciar Foto</span>
                          <span className="sm:hidden">Foto</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-insper-black">Gerenciar Foto de Perfil</h3>
                            <p className="text-sm text-insper-dark-gray mt-1">
                              Adicione ou altere a foto de perfil da sua organização
                            </p>
                          </div>
                          <UploadFotoPerfil
                            entidadeId={entidade.id}
                            currentFotoUrl={currentFotoUrl}
                            onFotoUpdated={handleFotoUpdated}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {/* Segunda linha - Áreas Internas */}
                  <GerenciarAreasInternas 
                    entidadeId={entidade.id}
                    areasAtuais={entidade.areas_internas || []}
                    onSuccess={() => {
                      // console.log('Áreas internas atualizadas');
                      refetchEntidade();
                    }}
                  />
                  
                  {/* Terceira linha - Demonstrações e Sair */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/entidades/${entidade.id}/demonstracoes`)}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Ver Demonstrações</span>
                      <span className="sm:hidden">Demonstrações</span>
                    </Button>
                    
                    <Button variant="outline" onClick={logout} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                  
                  {/* Quarta linha - Botões de Reserva */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => navigate('/reserva-sala')}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Reservar Sala</span>
                      <span className="sm:hidden">Sala</span>
                    </Button>
                    <Button 
                      onClick={() => navigate('/reserva-auditorio')}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Reservar Auditório</span>
                      <span className="sm:hidden">Auditório</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {user && profile ? (
                    <Button 
                      onClick={handleDemonstrarInteresse}
                      disabled={interestCheckLoading}
                      variant={hasDemonstratedInterest ? "secondary" : "default"}
                      className={`${
                        hasDemonstratedInterest 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white text-red-600 hover:bg-gray-50"
                      } shadow-lg hover:shadow-xl transition-all duration-300`}
                      size="lg"
                    >
                      {interestCheckLoading ? 'Verificando...' : 
                       hasDemonstratedInterest ? '✓ Interesse já demonstrado' : 
                       'Inscreva-se'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="bg-white text-red-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      Fazer login para demonstrar interesse
                    </Button>
                  )}
                  <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Entrar como organização</span>
                        <span className="sm:hidden">Entrar</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <EntityLoginForm onSuccess={() => setShowLoginDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sobre */}
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-2xl text-gray-900">Sobre a Organização</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {entidade.descricao_detalhada || entidade.descricao_curta || 'Esta organização ainda não possui uma descrição detalhada.'}
                </p>
                
                <div className="flex flex-wrap gap-3 items-center">
                  <AreaAtuacaoDisplay 
                    area_atuacao={entidade.area_atuacao}
                    variant="secondary"
                    className="text-sm font-medium"
                    compact={true}
                  />
                  {/* {entidade.nivel_exigencia && (
                    <Badge 
                      variant="outline" 
                      className={`text-sm font-medium ${
                        entidade.nivel_exigencia === 'baixa' ? 'border-green-500 text-green-700 bg-green-50' :
                        entidade.nivel_exigencia === 'média' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                        'border-red-500 text-red-700 bg-red-50'
                      }`}
                    >
                      Exigência: {entidade.nivel_exigencia}
                    </Badge>
                  )} */}
                </div>
              </CardContent>
            </Card>

            {/* Informações da Feira - Só aparece se feira_ativa for true */}
            {entidade.feira_ativa && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-2xl text-red-800">Informações da Feira</CardTitle>
                    </div>
                    {isOwner && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Feira
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <EditarEntidadeForm 
                            entidade={entidade} 
                            onSuccess={() => {
                              // console.log('🔄 onSuccess chamado - refetching dados da entidade');
                              refetchEntidade();
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entidade.local_feira && (
                      <div className="flex items-center p-4 bg-white rounded-xl border border-red-200 shadow-sm">
                        <MapPin className="mr-4 h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">Local do Estande</div>
                          <div className="text-lg font-bold text-red-600">{entidade.local_feira}</div>
                        </div>
                      </div>
                    )}

                    {entidade.local_apresentacao && (
                      <div className="flex items-center p-4 bg-white rounded-xl border border-red-200 shadow-sm">
                        <MapPin className="mr-4 h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">Local da Apresentação</div>
                          <div className="text-lg text-gray-700">{entidade.local_apresentacao}</div>
                        </div>
                      </div>
                    )}

                    {entidade.horario_apresentacao && (
                      <div className="flex items-center p-4 bg-white rounded-xl border border-red-200 shadow-sm">
                        <Clock className="mr-4 h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">Horário da Apresentação</div>
                          <div className="text-lg text-gray-700">{entidade.horario_apresentacao}</div>
                        </div>
                      </div>
                    )}

                    {!entidade.local_feira && !entidade.local_apresentacao && !entidade.horario_apresentacao && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-gray-600 mb-2">
                          {isOwner 
                            ? 'Nenhuma informação da feira cadastrada ainda.'
                            : 'Esta organização ainda não cadastrou informações da feira.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

{/* Processo Seletivo - Só aparece se processo_seletivo_ativo for true */}
{entidade.processo_seletivo_ativo && (
  <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-600" />
          <CardTitle className="text-2xl text-green-800">Processo Seletivo</CardTitle>
        </div>
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Processo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <EditarEntidadeForm
                entidade={entidade}
                onSuccess={() => {
                  // console.log("🔄 onSuccess chamado - refetching dados da entidade");
                  refetchEntidade();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </CardHeader>

    <CardContent>
      <div className="space-y-6">


        {/* Datas do processo */}
        {(entidade.abertura_processo_seletivo ||
          entidade.fechamento_processo_seletivo ||
          entidade.data_primeira_fase ||
          entidade.data_segunda_fase ||
          entidade.data_terceira_fase ||
          entidade.encerramento_primeira_fase
        ) && (
          <div className="space-y-6">
            {/* Período de inscrições */}
            {(entidade.abertura_processo_seletivo || entidade.fechamento_processo_seletivo) && (
              <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="mr-2 h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Período do Processo Seletivo</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {entidade.abertura_processo_seletivo && (
                    <div>
                      <div className="text-sm text-gray-500">Abertura</div>
                      <div className="text-lg">
                      {
                        (() => {
                          const [y, m, d] = entidade.abertura_processo_seletivo.split("-");
                          return new Date(+y, +m - 1, +d).toLocaleDateString("pt-BR");
                        })()
                      }
                      </div>
                    </div>
                  )}
                  {entidade.fechamento_processo_seletivo && (
                    <div>
                      <div className="text-sm text-gray-500">Fechamento</div>
                      <div className="text-lg">
                        {
                          (() => {
                            const [y, m, d] = entidade.fechamento_processo_seletivo.split("-");
                            return new Date(+y, +m - 1, +d).toLocaleDateString("pt-BR");
                          })()
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fases agrupadas */}
            {[
              {
                titulo: "Primeira Fase",
                datas: [
                  { label: "Início 1ª Fase", valor: entidade.data_primeira_fase },
                  { label: "Encerramento 1ª Fase", valor: entidade.encerramento_primeira_fase }
                ],
              },
              {
                titulo: "Segunda Fase",
                datas: [
                  { label: "Início 2ª Fase", valor: entidade.data_segunda_fase },
                  { label: "Encerramento 2ª Fase", valor: entidade.encerramento_segunda_fase },
                ],
              },
              {
                titulo: "Terceira Fase",
                datas: [
                  { label: "Início 3ª Fase", valor: entidade.data_terceira_fase },
                  { label: "Encerramento 3ª Fase", valor: entidade.encerramento_terceira_fase },
                ],
              },
            ].map(
              (fase) =>
                fase.datas.some((d) => d.valor) && (
                <div
                  key={fase.titulo}
                  className="bg-white rounded-xl border border-green-200 shadow-sm p-4"
                >
                  <div className="flex items-center mb-3">
                    <Calendar className="mr-2 h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{fase.titulo}</h3>
                  </div>

                  <div className="flex">
                    {/* Primeira data */}
                    {fase.datas[0]?.valor && (
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-500">{fase.datas[0].label}</div>
                        <div className="text-lg">
                          {(() => {
                            const [y, m, day] = fase.datas[0].valor.split("-");
                            return new Date(+y, +m - 1, +day).toLocaleDateString("pt-BR");
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Segunda data, deslocada */}
                    {fase.datas[1]?.valor && (
                      <div className="flex flex-col ml-auto mr-[30%]">
                        <div className="text-sm text-gray-500">{fase.datas[1].label}</div>
                        <div className="text-lg">
                          {(() => {
                            const [y, m, day] = fase.datas[1].valor.split("-");
                            return new Date(+y, +m - 1, +day).toLocaleDateString("pt-BR");
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                )
            )}
          </div>
        )}

        {/* Caso não tenha nada */}
        {!entidade.link_processo_seletivo &&
          !entidade.data_primeira_fase &&
          !entidade.data_segunda_fase &&
          !entidade.data_terceira_fase && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-2">
                {isOwner
                  ? "Nenhuma informação do processo seletivo cadastrada ainda."
                  : "Esta organização ainda não cadastrou informações do processo seletivo."}
              </p>
            </div>
          )}
      </div>
    </CardContent>
  </Card>
)}




            {/* Eventos - Visível para todos os usuários */}
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-2xl text-gray-900">Eventos</CardTitle>
                  </div>
                  {isOwner && (
                    <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200">
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Evento
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CriarEventoEntidade 
                          onSuccess={() => {
                            setShowCreateProjectDialog(false);
                            refetchEventos();
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {eventosLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : eventos && eventos.length > 0 ? (
                  <div className="space-y-4">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="group border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2">
                              {evento.nome}
                            </h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {evento.descricao}
                            </p>
                          </div>
                          {isOwner && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEvent(evento)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o evento "{evento.nome}"? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteEvent(evento)}
                                      disabled={deleteEventoLoading}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {deleteEventoLoading ? 'Excluindo...' : 'Excluir'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="font-medium">{format(new Date(evento.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="font-medium">{evento.horario}</span>
                          </div>
                          {evento.local && (
                            <div className="flex items-center text-gray-600 sm:col-span-2">
                              <MapPin className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{evento.local}</span>
                            </div>
                          )}
                        </div>
                        {evento.link_evento && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <a
                              href={evento.link_evento}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Inscrever-se no evento
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-10 w-10 text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">
                      Nenhum evento cadastrado
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      {isOwner 
                        ? 'Que tal criar o primeiro evento da sua organização? Conecte-se com os estudantes!'
                        : 'Esta organização ainda não possui eventos cadastrados. Fique atento às atualizações!'
                      }
                    </p>
                    {isOwner && (
                      <Button 
                        onClick={() => setShowCreateProjectDialog(true)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Evento
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projetos */}
            {(projetos.length > 0 || isOwner) && (
              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-2xl text-gray-900">Projetos</CardTitle>
                    </div>
                    {isOwner && (
                      <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Projeto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <CriarProjetoForm 
                            entidadeId={entidade.id} 
                            onSuccess={() => {
                              setShowCreateProjectDialog(false);
                              refetchProjetos();
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {projetosLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : projetos.length > 0 ? (
                    <div className="space-y-4">
                      {projetos.map((projeto) => (
                        <div key={projeto.id} className="border-l-4 border-red-500 pl-6 py-4 bg-gradient-to-r from-red-50 to-transparent rounded-r-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold text-gray-900">{projeto.nome}</h4>
                                {isOwner && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditProject(projeto)}>
                                        <Edit className="mr-2 h-3 w-3" />
                                        Editar
                                      </DropdownMenuItem>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-destructive focus:text-destructive"
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
                                              onClick={() => handleDeleteProject(projeto)}
                                              disabled={deleteLoading}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              {deleteLoading ? 'Removendo...' : 'Remover'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3 leading-relaxed">{projeto.descricao}</p>
                              {projeto.tecnologias && projeto.tecnologias.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {projeto.tecnologias.map((tech, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {projeto.repositorio_url && (
                                <a 
                                  href={projeto.repositorio_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-red-600 hover:text-red-700 hover:underline inline-flex items-center"
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  Ver repositório
                                </a>
                              )}
                            </div>
                            <Badge 
                              variant={projeto.status === 'ativo' ? 'default' : 'secondary'}
                              className="ml-4 bg-red-600 hover:bg-red-700"
                            >
                              {projeto.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FolderOpen className="h-12 w-12 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Nenhum projeto cadastrado
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        {isOwner 
                          ? 'Que tal começar criando o primeiro projeto da sua organização? Mostre aos estudantes o que vocês estão desenvolvendo!'
                          : 'Esta organização ainda não possui projetos cadastrados. Fique atento às atualizações!'
                        }
                      </p>
                      {isOwner && (
                        <div className="space-y-4">
                          <Button 
                            onClick={() => setShowCreateProjectDialog(true)}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Criar Primeiro Projeto
                          </Button>
                          <p className="text-sm text-gray-500">
                            ✨ Projetos ajudam a mostrar o trabalho da organização
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Redes Sociais e Site */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-xl">Redes Sociais e Site</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {entidade.site_url && (
                  <div className="group flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                      <ExternalLink className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">Site</div>
                      <a 
                        href={entidade.site_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 hover:underline font-semibold text-base transition-colors"
                      >
                        Visitar site
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                )}

                {entidade.instagram_url && (
                  <div className="group flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                      <ExternalLink className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">Instagram</div>
                      <a 
                        href={entidade.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 hover:underline font-semibold text-base transition-colors"
                      >
                        @{entidade.instagram_url.split('/').pop() || 'instagram'}
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                )}

                {entidade.linkedin_url && (
                  <div className="group flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                      <ExternalLink className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">LinkedIn</div>
                      <a 
                        href={entidade.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 hover:underline font-semibold text-base transition-colors"
                      >
                        Ver perfil
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                )}

                {!entidade.site_url && !entidade.instagram_url && !entidade.linkedin_url && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="h-8 w-8 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Nenhuma informação de contato
                    </h4>
                    <p className="text-sm text-gray-500">
                      {isOwner 
                        ? 'Adicione links para suas redes sociais e site para conectar-se melhor com os estudantes.'
                        : 'Esta organização ainda não cadastrou informações de contato.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Minhas Reservas - Apenas para proprietários */}
            {isOwner && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-xl">Minhas Reservas</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {reservasLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full rounded-xl" />
                      <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                  ) : reservasEntidade && reservasEntidade.length > 0 ? (
                    <div className="space-y-4">
                      {reservasEntidade.map((reserva) => (
                        <div key={reserva.id} className="group border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                reserva.status === 'aprovada' ? 'bg-green-500' :
                                reserva.status === 'rejeitada' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                Reserva de {reserva.tipo_reserva === 'sala' ? 'Sala' : 'Auditório'}
                              </h4>
                            </div>
                            <Badge 
                              variant={
                                reserva.status === 'aprovada' ? 'default' : 
                                reserva.status === 'rejeitada' ? 'destructive' : 
                                'secondary'
                              }
                              className={`text-xs font-medium ${
                                reserva.status === 'aprovada' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                reserva.status === 'rejeitada' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                'bg-yellow-600 hover:bg-yellow-700 text-white'
                              }`}
                            >
                              {reserva.status === 'pendente' ? 'Pendente' :
                               reserva.status === 'aprovada' ? 'Aprovada' :
                               reserva.status === 'rejeitada' ? 'Rejeitada' :
                               'Cancelada'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{format(new Date(reserva.data_reserva), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{reserva.horario_inicio} - {reserva.horario_termino}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{reserva.quantidade_pessoas} pessoas</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{reserva.nome_solicitante}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="h-10 w-10 text-red-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg">
                        Nenhuma reserva cadastrada
                      </h4>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Crie a primeira reserva para começar a organizar seus eventos!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => navigate('/reserva-sala')}
                          className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Reservar Sala
                        </Button>
                        <Button 
                          onClick={() => navigate('/reserva-auditorio')}
                          className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Reservar Auditório
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog for editing projects */}
        {selectedProject && (
          <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <EditarProjetoForm 
                projeto={selectedProject}
                entidadeId={entidade?.id || 0}
                onSuccess={() => {
                  setShowEditProjectDialog(false);
                  setSelectedProject(null);
                  refetchProjetos();
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for editing events */}
        {selectedEvent && (
          <Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <EditarEventoEntidade 
                evento={selectedEvent}
                entidadeId={entidade?.id || 0}
                onSuccess={() => {
                  console.log('🎉 onSuccess chamado - fechando modal e recarregando eventos');
                  console.log('🔍 Estado antes de fechar:', { 
                    showEditEventDialog, 
                    selectedEvent, 
                    entidadeId: entidade?.id,
                    eventosCount: eventos?.length 
                  });
                  
                  // Fechar o modal primeiro
                  setShowEditEventDialog(false);
                  setSelectedEvent(null);
                  
                  // Aguardar um pouco antes de recarregar os eventos
                  setTimeout(() => {
                    console.log('🔄 Recarregando eventos após delay...');
                    console.log('🔍 Função refetchEventos:', typeof refetchEventos);
                    
                    try {
                      if (typeof refetchEventos === 'function') {
                        refetchEventos();
                        console.log('✅ refetchEventos chamado com sucesso');
                      } else {
                        console.error('❌ refetchEventos não é uma função:', refetchEventos);
                      }
                    } catch (error) {
                      console.error('❌ Erro ao chamar refetchEventos:', error);
                    }
                  }, 100);
                  
                  console.log('✅ Modal fechado e agendado recarregamento de eventos');
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default EntidadeDetalhes;
