
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Mail, MapPin, Clock, Star, ExternalLink, Edit, Plus, LogIn, LogOut, Trash2, MoreVertical, FolderOpen, Building2, Target, Sparkles, Award, TrendingUp, Camera } from 'lucide-react';
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
import type { Projeto } from '@/hooks/useProjetos';
import type { Evento } from '@/hooks/useEventosEntidade';

const EntidadeDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleEntidadeUpdate = useCallback(() => {
    console.log('🔄 Entidade atualizada - resetando estado de loading');
    setIsUpdating(false);
  }, []);
  
  const { entidade, loading, error, refetch: refetchEntidade } = useEntidade(id, handleEntidadeUpdate);
  const { projetos, loading: projetosLoading, refetch: refetchProjetos } = useProjetos(entidade?.id);
  const { eventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id);
  const { entidadeId, isAuthenticated, logout } = useEntityAuth();
  const { user, profile } = useAuth();
  const { deleteProjeto, loading: deleteLoading } = useDeleteProjeto();
  const { deleteEvento, loading: deleteEventoLoading } = useDeleteEventoAsEntity();
  const { hasDemonstratedInterest, loading: interestCheckLoading } = useCheckInterestDemonstration(entidade?.id);
  const { toast } = useToast();
  
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
  
  const isOwner = isAuthenticated && entidadeId === entidade?.id;

  // Sincronizar foto de perfil quando entidade for carregada
  useEffect(() => {
    if (entidade?.foto_perfil_url !== currentFotoUrl) {
      setCurrentFotoUrl(entidade?.foto_perfil_url || null);
    }
  }, [entidade?.foto_perfil_url, currentFotoUrl]);

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
    setSelectedEvent(evento);
    setShowEditEventDialog(true);
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

  const handleDemonstrarInteresse = () => {
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

    navigate(`/demonstrar-interesse/${entidade.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Organização não encontrada</h2>
              <p className="text-gray-600 mb-6">
                {error || 'A organização que você está procurando não existe ou foi removida.'}
              </p>
              <Link to="/entidades">
                <Button className="bg-red-600 hover:bg-red-700">
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
                    area_atuacao={Array.isArray(entidade.area_atuacao) ? entidade.area_atuacao[0] : entidade.area_atuacao}
                    variant="secondary"
                    className="text-sm bg-white/20 text-white border-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 lg:ml-auto">
              {isOwner ? (
                <>
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <EditarEntidadeForm 
                        entidade={entidade} 
                        onSuccess={() => {
                          console.log('🔄 onSuccess chamado - fechando dialog e refetching');
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
                      <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                        <Camera className="mr-2 h-4 w-4" />
                        Gerenciar Foto
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
                  
                  <GerenciarAreasInternas 
                    entidadeId={entidade.id}
                    areasAtuais={entidade.areas_internas || []}
                    onSuccess={() => {
                      console.log('Áreas internas atualizadas');
                      refetchEntidade();
                    }}
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/entidades/${entidade.id}/demonstracoes`)}
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver Demonstrações
                  </Button>
                  <Button variant="outline" onClick={logout} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
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
                       'Demonstrar interesse'}
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
                      <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar como organização
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
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-2xl">Sobre a Organização</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {entidade.descricao_detalhada || entidade.descricao_curta || 'Esta organização ainda não possui uma descrição detalhada.'}
                </p>
                
                <div className="flex flex-wrap gap-3 items-center">
                  <AreaAtuacaoDisplay 
                    area_atuacao={Array.isArray(entidade.area_atuacao) ? entidade.area_atuacao[0] : entidade.area_atuacao}
                    variant="secondary"
                    className="text-sm font-medium"
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

            {/* Informações da Feira */}
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
                            console.log('🔄 onSuccess chamado - refetching dados da entidade');
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

            {/* Projetos */}
            {(projetos.length > 0 || isOwner) && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-2xl">Projetos</CardTitle>
                    </div>
                    {isOwner && (
                      <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
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
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FolderOpen className="h-10 w-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Nenhum projeto cadastrado
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Esta organização ainda não possui projetos cadastrados. 
                        {isOwner ? ' Que tal começar criando o primeiro projeto?' : ' Fique atento às atualizações!'}
                      </p>
                      {isOwner && (
                        <Button 
                          onClick={() => setShowCreateProjectDialog(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Primeiro Projeto
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Próximos Eventos */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-xl">Próximos Eventos</CardTitle>
                  </div>
                  {isOwner && <CriarEventoEntidade onSuccess={refetchEventos} />}
                </div>
              </CardHeader>
              <CardContent>
                {eventosLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : eventos && eventos.length > 0 ? (
                  <div className="space-y-4">
                    {eventos.map((evento) => (
                      <Link key={evento.id} to={`/eventos/${evento.id}`} className="block">
                        <div className="border-l-4 border-red-500 pl-4 hover:bg-red-50 transition-colors rounded-r-xl p-3 -ml-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{evento.nome}</h4>
                                {isOwner && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleEditEvent(evento); }}>
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
                                              Tem certeza que deseja remover o evento "{evento.nome}"? 
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
                                              {deleteEventoLoading ? 'Removendo...' : 'Remover'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              {evento.descricao && (
                                <p className="text-sm text-gray-600 mb-2">{evento.descricao}</p>
                              )}
                              <div className="space-y-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {new Date((evento as any).data).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                                          {(evento as any).horario || 'Horário não definido'}
                                </div>
                                {evento.local && (
                                  <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {evento.local}
                                  </div>
                                )}
                                {evento.capacidade && (
                                  <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    Capacidade: {evento.capacidade}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={evento.status === 'ativo' ? 'default' : 'secondary'}
                              className="text-xs bg-red-600 hover:bg-red-700"
                            >
                              {evento.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Nenhum evento cadastrado
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isOwner ? 'Crie o primeiro evento para começar!' : 'Fique atento aos próximos eventos!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  setShowEditEventDialog(false);
                  setSelectedEvent(null);
                  refetchEventos();
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
