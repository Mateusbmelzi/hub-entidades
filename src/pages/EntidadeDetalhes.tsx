
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Mail, MapPin, Clock, Star, ExternalLink, Edit, Plus, LogIn, LogOut, Trash2, MoreVertical, FolderOpen, Building2, Target, Sparkles, Award, TrendingUp, Camera, Phone, ClipboardList, User, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEntidade } from '@/hooks/useEntidade';
import { useUpdateEntidade } from '@/hooks/useUpdateEntidade';
import { useProjetos } from '@/hooks/useProjetos';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteProjeto } from '@/hooks/useDeleteProjeto';
import { useEventosEntidade } from '@/hooks/useEventosEntidade';
import { useDeleteEventoAsEntity } from '@/hooks/useDeleteEventoAsEntity';
import { useCheckInterestDemonstration } from '@/hooks/useCheckInterestDemonstration';
import { useCheckProcessoSeletivo } from '@/hooks/useCheckProcessoSeletivo';
import { useAplicacaoProcesso } from '@/hooks/useAplicacaoProcesso';
import { useReservasUsuario } from '@/hooks/useReservas';
import { supabase } from '@/integrations/supabase/client';
import EditarEventoEntidade from '@/components/EditarEventoEntidade';
import EntityLoginForm from '@/components/EntityLoginForm';
import EditarEntidadeForm from '@/components/EditarEntidadeForm';
import EditarProcessoSeletivo from '@/components/EditarProcessoSeletivo';
import CriarProjetoForm from '@/components/CriarProjetoForm';
import EditarProjetoForm from '@/components/EditarProjetoForm';
import CriarEventoEntidade from '@/components/CriarEventoEntidade';
import GerenciarAreasInternas from '@/components/GerenciarAreasInternas';
import GerenciarAreasProcessoSeletivo from '@/components/GerenciarAreasProcessoSeletivo';
import { GerenciarEmpresasParceiras } from '@/components/GerenciarEmpresasParceiras';
import { EmpresasParceirasDisplay } from '@/components/EmpresasParceirasDisplay';
import { ToastAction } from '@/components/ui/toast';
import { CriarEventoDeReserva } from '@/components/CriarEventoDeReserva';
import { GerenciarTemplatesFormularios } from '@/components/GerenciarTemplatesFormularios';
import { VincularEventoReserva } from '@/components/VincularEventoReserva';
import { EventosReservasTabsEntidade } from '@/components/EventosReservasTabsEntidade';
import { AreaAtuacaoDisplay } from '@/components/ui/area-atuacao-display';
import { ConfigurarFormularioInscricao } from '@/components/ConfigurarFormularioInscricao';
import { GerenciarMembrosEntidade } from '@/components/GerenciarMembrosEntidade';
import { GerenciarCargosEntidade } from '@/components/GerenciarCargosEntidade';
import { GerenciarFasesProcesso } from '@/components/GerenciarFasesProcesso';
import { AcompanhamentoFasesPS } from '@/components/AcompanhamentoFasesPS';
import ListaInscricoesEntidade from '@/components/ListaInscricoesEntidade';
import BotaoInscreverEntidade from '@/components/BotaoInscreverEntidade';
import { getFirstAreaColor } from '@/lib/constants';
import { FotoPerfilEntidade } from '@/components/FotoPerfilEntidade';
import { UploadFotoPerfil } from '@/components/UploadFotoPerfil';
import { EntidadeOwnerNavigation } from '@/components/EntidadeOwnerNavigation';
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
  const [numeroTotalFases, setNumeroTotalFases] = useState<number | undefined>(undefined);
  const [salvandoNumeroFases, setSalvandoNumeroFases] = useState(false);
  
  const handleEntidadeUpdate = useCallback(() => {
    setIsUpdating(false);
  }, []);
  
  const { entidade, loading, error, refetch: refetchEntidade } = useEntidade(id, handleEntidadeUpdate);
  
  // Sincronizar estado local com entidade quando ela mudar
  useEffect(() => {
    setNumeroTotalFases(entidade?.numero_total_fases);
  }, [entidade?.numero_total_fases]);
  // console.log(entidade.encerramento_primeira_fase) 
  const { projetos, loading: projetosLoading, refetch: refetchProjetos } = useProjetos(entidade?.id);
  const { updateEntidade } = useUpdateEntidade();
  
  // Debug log removido para melhor visualização
  // const { eventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id);
  
  const { entidadeId, isAuthenticated, logout } = useEntityAuth();
  const { user, profile } = useAuth();
  const { deleteProjeto, loading: deleteLoading } = useDeleteProjeto();
  const { deleteEvento, loading: deleteEventoLoading } = useDeleteEventoAsEntity();
  const { hasDemonstratedInterest, loading: interestCheckLoading, refresh: refreshInterestCheck } = useCheckInterestDemonstration(entidade?.id);
  const { hasInscricaoProcesso, loading: processoCheckLoading, refresh: refreshProcessoCheck } = useCheckProcessoSeletivo(entidade?.id);
  const { aplicar: aplicarProcessoSeletivo, loading: aplicacaoLoading } = useAplicacaoProcesso(entidade?.id);
  const { toast } = useToast();
  
  const isOwner = isAuthenticated && entidadeId === entidade?.id;
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [mostrarDialogFormulario, setMostrarDialogFormulario] = useState(false);
  const [eventoSelecionadoFormulario, setEventoSelecionadoFormulario] = useState<any>(null);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [showFotoDialog, setShowFotoDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string | null>(null);
  const [showCreateEventFromReservaDialog, setShowCreateEventFromReservaDialog] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any | null>(null);
  const [showGerenciarTemplates, setShowGerenciarTemplates] = useState(false);
  const [showVincularDialog, setShowVincularDialog] = useState(false);
  const [selectedEventoVincular, setSelectedEventoVincular] = useState<any>(null);
  const [selectedReservaVincular, setSelectedReservaVincular] = useState<any>(null);
  
  // Estado para controlar qual seção está ativa (apenas para donos)
  const [activeSection, setActiveSection] = useState<'visao-geral' | 'eventos' | 'projetos' | 'gestao' | 'processo' | 'templates' | 'areas'>('visao-geral');
  
  const { eventos: allEventos, loading: eventosLoading, refetch: refetchEventos } = useEventosEntidade(entidade?.id, isOwner);
  const eventos = allEventos?.filter(ev => {
    const hoje = new Date();
    const dataEvento = combineDataHorario(ev.data, ev.horario_inicio);
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

  const handleCriarEventoDeReserva = (reserva: any) => {
    setSelectedReserva(reserva);
    setShowCreateEventFromReservaDialog(true);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section as any);
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

    // Verificar se existe um processo seletivo ativo
    if (entidade?.processo_seletivo_ativo) {
      // Se já se inscreveu no processo seletivo
      if (hasInscricaoProcesso) {
        toast({
          title: "Inscrição já realizada",
          description: "Você já se inscreveu no processo seletivo desta entidade.",
          variant: "default",
        });
        return;
      }

      // Usar nosso sistema interno de processo seletivo
      try {
        const result = await aplicarProcessoSeletivo();
        if (result.success) {
          toast({
            title: "✅ Inscrição enviada!",
            description: "Sua inscrição no processo seletivo foi enviada com sucesso.",
            duration: 4000,
          });
          refreshProcessoCheck();
        } else {
          toast({
            title: "❌ Erro ao inscrever",
            description: result.error || "Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Erro ao processar inscrição no processo seletivo:', error);
        toast({
          title: "❌ Erro",
          description: "Erro ao processar inscrição no processo seletivo.",
          variant: "destructive",
        });
      }
      return;
    }

    // Se há processo seletivo ativo com link externo (comportamento antigo)
    if (entidade?.processo_seletivo_ativo && entidade?.link_processo_seletivo) {
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

  // Calcular estatísticas para a navegação (apenas para donos)
  const ownerStats = isOwner ? {
    totalProjetos: projetos?.filter(p => p.status === 'ativo').length || 0,
    totalEventos: allEventos?.filter(e => e.status_aprovacao === 'aprovado').length || 0,
    totalMembros: entidade?.numero_membros || 0,
    totalTemplates: 0, // TODO: implementar contagem de templates
    processoAtivo: entidade?.processo_seletivo_ativo || false,
    totalAreas: 0 // TODO: implementar contagem de áreas
  } : {};

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
                    entidadeId={entidade.id}
                    showEmpresasLogos={true}
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
                  setShowEditDialog(false);
                  setIsUpdating(true);
                  
                  toast({
                    title: "🔄 Atualizando...",
                    description: "Carregando as informações atualizadas da entidade.",
                    duration: 2000,
                  });
                  
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
                    areasAtuais={entidade.areas_estrutura_organizacional || []}
                    variant="header"
                    onSuccess={() => {
                      // console.log('Áreas internas atualizadas');
                      refetchEntidade();
                    }}
                  />
                  
                  {/* Terceira linha - Empresas Parceiras */}
                  <GerenciarEmpresasParceiras 
                    entidadeId={entidade.id}
                    entidadeNome={entidade.nome || 'Entidade'}
                    onSuccess={() => {
                      refetchEntidade();
                    }}
                  />
                  
                  {/* Quarta linha - Demonstrações e Sair */}
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
                    <>
                      {entidade?.processo_seletivo_ativo ? (
                        // Usar novo componente com dialog quando processo seletivo ativo
                        <BotaoInscreverEntidade entidadeId={entidade.id} />
                      ) : (
                        // Usar botão antigo para demonstrar interesse quando processo não ativo
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
                           'Demonstrar Interesse'}
                    </Button>
                      )}
                    </>
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

      {/* Navigation for Owners */}
      {isOwner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EntidadeOwnerNavigation
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            stats={ownerStats}
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isOwner ? (
          // Layout para donos - apenas a seção selecionada
          <div className="space-y-8">
            {activeSection === 'visao-geral' && (
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
                    entidadeId={entidade.id}
                    showEmpresasLogos={true}
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
              <EditarProcessoSeletivo
                entidade={entidade}
                onSuccess={() => {
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




            {/* Eventos e Reservas com Tabs - Sempre visível */}
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-2xl text-gray-900">Eventos e Reservas</CardTitle>
                    {isOwner && allEventos && (
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          {allEventos.filter(e => e.status_aprovacao === 'aprovado').length} eventos aprovados
                        </Badge>
                        {allEventos.filter(e => e.status_aprovacao === 'pendente').length > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            {allEventos.filter(e => e.status_aprovacao === 'pendente').length} pendentes
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {reservasEntidade?.filter((r: any) => r.status_reserva === 'aprovada').length || 0} reservas aprovadas
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Evento
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <CriarEventoEntidade
                            onSuccess={() => {
                              refetchEventos();
                              toast({
                                title: 'Evento criado!',
                                description: 'Seu evento foi enviado para aprovação do admin.',
                              });
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button size="sm" variant="outline" onClick={() => navigate(`/entidades/${id}/calendario`)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver calendário
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {eventosLoading || reservasLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : (
                  <EventosReservasTabsEntidade
                    eventos={allEventos || []}
                    reservas={reservasEntidade || []}
                    entidadeId={entidade.id}
                    isOwner={isOwner}
                    onConfigurarFormulario={(evento) => {
                      setEventoSelecionadoFormulario(evento);
                      setMostrarDialogFormulario(true);
                    }}
                    onRefetch={() => {
                      refetchEventos();
                      refetchReservas();
                    }}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                  />
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

            {/* Templates de Formulários */}
            {isOwner && (
              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-2xl text-gray-900">Templates de Formulários</CardTitle>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowGerenciarTemplates(true)}
                      className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar Templates
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ClipboardList className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Templates de Inscrição
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                      Crie e gerencie templates de formulários para reutilizar em seus eventos. 
                      Economize tempo configurando inscrições padronizadas.
                    </p>
                    <Button 
                      onClick={() => setShowGerenciarTemplates(true)}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gestão de Membros - Apenas para proprietários */}
            {isOwner && entidade && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-2xl text-blue-800">Gestão de Membros</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gerencie os membros e cargos da sua organização estudantil
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="membros" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="membros">
                        <Users className="h-4 w-4 mr-2" />
                        Membros
                      </TabsTrigger>
                      <TabsTrigger value="cargos">
                        <Settings className="h-4 w-4 mr-2" />
                        Cargos
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="membros" className="mt-6">
                      <GerenciarMembrosEntidade entidadeId={entidade.id} />
                    </TabsContent>
                    <TabsContent value="cargos" className="mt-6">
                      {/* Flag global para os hooks detectarem modo owner e usarem RPC */}
                      <script
                        dangerouslySetInnerHTML={{
                          __html: 'window.isOwnerEntity = true;',
                        }}
                      />
                      <GerenciarCargosEntidade entidadeId={entidade.id} isOwner={isOwner} />
                    </TabsContent>
                  </Tabs>
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

            {/* Empresas Parceiras - Exibição pública */}
            <EmpresasParceirasDisplay 
              entidadeId={entidade.id}
              className="mb-6"
            />

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
                          
                          {/* Botão para criar evento a partir da reserva aprovada */}
                          {reserva.status === 'aprovada' && !reserva.evento_id && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <Button
                                size="sm"
                                onClick={() => handleCriarEventoDeReserva(reserva)}
                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Evento desta Reserva
                              </Button>
                            </div>
                          )}
                          
                          {/* Indicador de evento já criado */}
                          {reserva.status === 'aprovada' && reserva.evento_id && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span className="font-medium">Evento já criado para esta reserva</span>
                              </div>
                            </div>
                          )}
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
            )}

            {activeSection === 'eventos' && (
              <div className="space-y-8">
                {/* Eventos e Reservas */}
                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-2xl text-gray-900">Eventos e Reservas</CardTitle>
                        {allEventos && (
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              {allEventos.filter(e => e.status_aprovacao === 'aprovado').length} eventos aprovados
                            </Badge>
                            {allEventos.filter(e => e.status_aprovacao === 'pendente').length > 0 && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                {allEventos.filter(e => e.status_aprovacao === 'pendente').length} pendentes
                              </Badge>
                            )}
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              {reservasEntidade?.filter((r: any) => r.status_reserva === 'aprovada').length || 0} reservas aprovadas
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Evento
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <CriarEventoEntidade
                              onSuccess={() => {
                                refetchEventos();
                                toast({
                                  title: 'Evento criado!',
                                  description: 'Seu evento foi enviado para aprovação do admin.',
                                });
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/entidades/${id}/calendario`)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Ver calendário
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {eventosLoading || reservasLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                      </div>
                    ) : (
                      <EventosReservasTabsEntidade
                        eventos={allEventos || []}
                        reservas={reservasEntidade || []}
                        entidadeId={entidade.id}
                        isOwner={isOwner}
                        onConfigurarFormulario={(evento) => {
                          setEventoSelecionadoFormulario(evento);
                          setMostrarDialogFormulario(true);
                        }}
                        onRefetch={() => {
                          refetchEventos();
                          refetchReservas();
                        }}
                        onEditEvent={handleEditEvent}
                        onDeleteEvent={handleDeleteEvent}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'projetos' && (
              <div className="space-y-8">
                {/* Projetos */}
                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-2xl text-gray-900">Projetos</CardTitle>
                      </div>
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
                          Que tal começar criando o primeiro projeto da sua organização? Mostre aos estudantes o que vocês estão desenvolvendo!
                        </p>
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'gestao' && (
              <div className="space-y-8">
                {/* Gestão de Membros */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-purple-50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-2xl text-blue-800">Gestão de Membros</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gerencie os membros e cargos da sua organização estudantil
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="membros" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="membros">
                          <Users className="h-4 w-4 mr-2" />
                          Membros
                        </TabsTrigger>
                        <TabsTrigger value="cargos">
                          <Settings className="h-4 w-4 mr-2" />
                          Cargos
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="membros" className="mt-6">
                        <GerenciarMembrosEntidade entidadeId={entidade.id} />
                      </TabsContent>
                      <TabsContent value="cargos" className="mt-6">
                        <script
                          dangerouslySetInnerHTML={{
                            __html: 'window.isOwnerEntity = true;',
                          }}
                        />
                        <GerenciarCargosEntidade entidadeId={entidade.id} isOwner={isOwner} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'processo' && entidade?.processo_seletivo_ativo && (
              <div className="space-y-8">
                {/* Processo Seletivo */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-2xl text-green-800">Processo Seletivo</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gerencie todo o processo seletivo: configuração, fases, inscrições e acompanhamento
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="configuracao" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="configuracao">
                          <Settings className="h-4 w-4 mr-2" />
                          Configuração
                        </TabsTrigger>
                        <TabsTrigger value="fases">
                          <Target className="h-4 w-4 mr-2" />
                          Fases
                        </TabsTrigger>
                        <TabsTrigger value="inscricoes">
                          <Users className="h-4 w-4 mr-2" />
                          Inscrições
                        </TabsTrigger>
                        <TabsTrigger value="acompanhamento">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Acompanhamento
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="configuracao" className="mt-6">
                        <div className="space-y-6">
                          {/* Switch de ativação do processo seletivo */}
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="processo-seletivo-ativo" className="text-base font-semibold">
                                    Processo Seletivo Ativo
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Ative para permitir que estudantes se inscrevam no processo seletivo
                                  </p>
                                </div>
                                <Switch
                                  id="processo-seletivo-ativo"
                                  checked={entidade.processo_seletivo_ativo || false}
                                  onCheckedChange={async (checked) => {
                                    const success = await updateEntidade(entidade.id, {
                                      processo_seletivo_ativo: checked
                                    });
                                    if (success) {
                                      refetchEntidade();
                                    }
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Período do Processo Seletivo - Edição */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                Período do Processo Seletivo
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                Configure as datas de abertura e fechamento do processo seletivo
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="abertura-processo">Data de Abertura</Label>
                                  <Input
                                    id="abertura-processo"
                                    type="date"
                                    value={entidade.abertura_processo_seletivo || ''}
                                    onChange={async (e) => {
                                      const success = await updateEntidade(entidade.id, {
                                        abertura_processo_seletivo: e.target.value || null
                                      });
                                      if (success) {
                                        refetchEntidade();
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="fechamento-processo">Data de Fechamento</Label>
                                  <Input
                                    id="fechamento-processo"
                                    type="date"
                                    value={entidade.fechamento_processo_seletivo || ''}
                                    onChange={async (e) => {
                                      const success = await updateEntidade(entidade.id, {
                                        fechamento_processo_seletivo: e.target.value || null
                                      });
                                      if (success) {
                                        refetchEntidade();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Número Total de Fases */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                Número Total de Fases
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                Defina quantas fases terá o processo seletivo
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="numero-total-fases">Quantas fases terá o processo seletivo?</Label>
                                <Input
                                  id="numero-total-fases"
                                  type="number"
                                  min="1"
                                  max="10"
                                  placeholder="Ex: 3"
                                  value={numeroTotalFases || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                    setNumeroTotalFases(value);
                                  }}
                                  className="mt-2"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                  Ao aprovar um candidato na última fase, ele será automaticamente adicionado como membro da organização estudantil.
                                </p>
                              </div>
                              <div className="flex justify-end pt-2">
                                <Button
                                  onClick={async () => {
                                    setSalvandoNumeroFases(true);
                                    const success = await updateEntidade(entidade.id, {
                                      numero_total_fases: numeroTotalFases || null
                                    });
                                    if (success) {
                                      refetchEntidade();
                                    }
                                    setSalvandoNumeroFases(false);
                                  }}
                                  disabled={salvandoNumeroFases || numeroTotalFases === entidade?.numero_total_fases}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {salvandoNumeroFases ? 'Salvando...' : 'Salvar'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="fases" className="mt-6">
                        <GerenciarFasesProcesso entidadeId={entidade.id} />
                      </TabsContent>
                      
                      <TabsContent value="inscricoes" className="mt-6">
                        <ListaInscricoesEntidade entidadeId={entidade.id} />
                      </TabsContent>
                      
                      <TabsContent value="acompanhamento" className="mt-6">
                        <AcompanhamentoFasesPS entidadeId={entidade.id} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'templates' && (
              <div className="space-y-8">
                {/* Templates de Formulários */}
                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-2xl text-gray-900">Templates de Formulários</CardTitle>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setShowGerenciarTemplates(true)}
                        className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Templates
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ClipboardList className="h-10 w-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Templates de Inscrição
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        Crie e gerencie templates de formulários para reutilizar em seus eventos. 
                        Economize tempo configurando inscrições padronizadas.
                      </p>
                      <Button 
                        onClick={() => setShowGerenciarTemplates(true)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'areas' && (
              <div className="space-y-8">
                {/* Áreas Internas */}
                <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <CardTitle className="text-2xl text-gray-900">Áreas Internas</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gerencie as áreas de atuação e empresas parceiras da sua organização
                    </p>
                  </CardHeader>
                  <CardContent>
                    <GerenciarAreasInternas 
                      entidadeId={entidade.id}
                      areasAtuais={entidade.areas_estrutura_organizacional || []}
                      onSuccess={() => {
                        refetchEntidade();
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          // Layout público - manter estrutura original
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
                    entidadeId={entidade.id}
                    showEmpresasLogos={true}
                    variant="secondary"
                    className="text-sm font-medium"
                    compact={true}
                  />
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
                    </div>
                  )}

                  {entidade.instagram_url && (
                    <div className="group flex items-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200 hover:border-pink-300 hover:shadow-md transition-all duration-200">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-pink-200 transition-colors">
                        <ExternalLink className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-1">Instagram</div>
                        <a 
                          href={entidade.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 hover:underline font-semibold text-base transition-colors"
                        >
                          @{entidade.instagram_url.split('/').pop()}
                        </a>
                      </div>
                    </div>
                  )}

                  {entidade.linkedin_url && (
                    <div className="group flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-1">LinkedIn</div>
                        <a 
                          href={entidade.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-semibold text-base transition-colors"
                        >
                          Ver perfil
                        </a>
                      </div>
                    </div>
                  )}

                  {!entidade.site_url && !entidade.instagram_url && !entidade.linkedin_url && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExternalLink className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        {isOwner 
                          ? 'Nenhuma rede social cadastrada ainda.'
                          : 'Esta organização ainda não cadastrou redes sociais.'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Empresas Parceiras */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-xl">Empresas Parceiras</CardTitle>
                    </div>
                    {isOwner && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                            <Settings className="mr-2 h-4 w-4" />
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <GerenciarEmpresasParceiras 
                            entidadeId={entidade.id}
                            entidadeNome={entidade.nome}
                            onSuccess={() => {
                              refetchEntidade();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <EmpresasParceirasDisplay entidadeId={entidade.id} />
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
        )}

        {/* Dialogs */}
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
                  
                  setTimeout(() => {
                    if (typeof refetchEventos === 'function') {
                      refetchEventos();
                    }
                  }, 100);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for creating event from reservation */}
        {selectedReserva && entidade && (
          <Dialog open={showCreateEventFromReservaDialog} onOpenChange={setShowCreateEventFromReservaDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <CriarEventoDeReserva
                reserva={selectedReserva}
                entidadeId={entidade.id}
                onSuccess={() => {
                  setShowCreateEventFromReservaDialog(false);
                  setSelectedReserva(null);
                  refetchEventos();
                  refetchReservas();
                }}
                onCancel={() => {
                  setShowCreateEventFromReservaDialog(false);
                  setSelectedReserva(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for managing templates */}
        {entidade && (
          <Dialog open={showGerenciarTemplates} onOpenChange={setShowGerenciarTemplates}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Templates de Formulários</DialogTitle>
              </DialogHeader>
              <GerenciarTemplatesFormularios entidadeId={entidade.id} />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for configuring event registration form */}
        <Dialog open={mostrarDialogFormulario} onOpenChange={setMostrarDialogFormulario}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurar Formulário de Inscrição</DialogTitle>
            </DialogHeader>
            
            {eventoSelecionadoFormulario && (
              <ConfigurarFormularioInscricao
                eventoId={eventoSelecionadoFormulario.id}
                entidadeId={entidade.id}
                capacidadeSala={eventoSelecionadoFormulario.capacidade}
                onSave={() => {
                  setMostrarDialogFormulario(false);
                  setEventoSelecionadoFormulario(null);
                  refetchEventos(); // Atualizar lista de eventos
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EntidadeDetalhes;
