import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Filter, 
  Building, 
  Users, 
  Trash2,
  Search,
  Eye,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useAprovarEventos, EventoParaAprovacao } from '@/hooks/useAprovarEventos';
import { useDeleteEventoAsEntity } from '@/hooks/useDeleteEventoAsEntity';
import { toast } from 'sonner';
import { formatData } from '@/lib/date-utils';

const AprovarEventosV2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { type } = useAuthStateContext();
  const { eventos, loading, aprovarEvento } = useAprovarEventos();
  const { deleteEvento, loading: deleteLoading } = useDeleteEventoAsEntity();
  
  // Estados
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoParaAprovacao | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoParaAprovacao | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');

  // Verificar se o usuário é super admin
  const isSuperAdmin = 
    type === 'superAdmin' || 
    user?.user_metadata?.role === 'superAdmin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.email === 'admin@admin' ||
    localStorage.getItem('superAdmin') === 'true';

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = eventos.length;
    const pendentes = eventos.filter(e => e.status_aprovacao === 'pendente').length;
    const aprovados = eventos.filter(e => e.status_aprovacao === 'aprovado').length;
    const rejeitados = eventos.filter(e => e.status_aprovacao === 'rejeitado').length;
    const taxaAprovacao = total > 0 ? (aprovados / total) * 100 : 0;

    return { total, pendentes, aprovados, rejeitados, taxaAprovacao };
  }, [eventos]);

  // Filtrar eventos
  const filteredEventos = useMemo(() => {
    let filtered = eventos;

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(e => e.status_aprovacao === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.entidade_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.local?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [eventos, statusFilter, searchTerm]);

  // Handlers
  const handleAprovarEvento = async (evento: EventoParaAprovacao) => {
    setUpdatingId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'aprovado');
      if (result.success) {
        toast.success(`Evento "${evento.nome}" aprovado com sucesso!`);
      } else {
        toast.error('Erro ao aprovar evento');
      }
    } catch (error) {
      toast.error('Erro ao aprovar evento');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejeitarEvento = async (evento: EventoParaAprovacao, comentario: string) => {
    setUpdatingId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'rejeitado', comentario);
      if (result.success) {
        toast.success(`Evento "${evento.nome}" rejeitado`);
        setShowRejectionDialog(false);
        setRejectionComment('');
        setSelectedEvento(null);
      } else {
        toast.error('Erro ao rejeitar evento');
      }
    } catch (error) {
      toast.error('Erro ao rejeitar evento');
    } finally {
      setUpdatingId(null);
    }
  };

  const openRejectionDialog = (evento: EventoParaAprovacao) => {
    setSelectedEvento(evento);
    setShowRejectionDialog(true);
  };

  const openDeleteDialog = (evento: EventoParaAprovacao) => {
    setEventoParaExcluir(evento);
    setShowDeleteDialog(true);
  };

  const handleDeleteEvento = async (evento: EventoParaAprovacao) => {
    try {
      const result = await deleteEvento(evento.id, evento.entidade_id);
      if (result.success) {
        toast.success(`Evento "${evento.nome}" excluído com sucesso!`);
        setShowDeleteDialog(false);
        setEventoParaExcluir(null);
      } else {
        toast.error('Erro ao excluir evento');
      }
    } catch (error) {
      toast.error('Erro ao excluir evento');
    }
  };

  // Funções auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'aprovado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejeitado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'aprovado':
        return <Check className="w-4 h-4" />;
      case 'rejeitado':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Verificações de acesso
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-insper-black">Acesso Negado</h2>
              <p className="text-insper-dark-gray mb-4">
                Você precisa ser super admin para acessar esta página.
              </p>
              <Button onClick={() => navigate('/')} className="bg-insper-red hover:bg-red-700 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-insper-dark-gray hover:bg-insper-light-gray">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-insper-black">Aprovação de Eventos</h1>
          <p className="text-insper-dark-gray">
            Gerencie a aprovação de eventos criados pelas organizações estudantis
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Total de Eventos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
                <div className="text-sm text-yellow-700">Pendentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.aprovados}</div>
                <div className="text-sm text-green-700">Aprovados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejeitados}</div>
                <div className="text-sm text-red-700">Rejeitados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.taxaAprovacao.toFixed(1)}%</div>
                <div className="text-sm text-purple-700">Taxa de Aprovação</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, entidade ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="rejeitado">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs para diferentes visualizações */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos ({filteredEventos.length})</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes ({stats.pendentes})</TabsTrigger>
            <TabsTrigger value="aprovados">Aprovados ({stats.aprovados})</TabsTrigger>
            <TabsTrigger value="rejeitados">Rejeitados ({stats.rejeitados})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <EventosList 
              eventos={filteredEventos}
              updatingId={updatingId}
              onAprovar={handleAprovarEvento}
              onRejeitar={openRejectionDialog}
              onDelete={openDeleteDialog}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="pendentes" className="mt-6">
            <EventosList 
              eventos={filteredEventos.filter(e => e.status_aprovacao === 'pendente')}
              updatingId={updatingId}
              onAprovar={handleAprovarEvento}
              onRejeitar={openRejectionDialog}
              onDelete={openDeleteDialog}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="aprovados" className="mt-6">
            <EventosList 
              eventos={filteredEventos.filter(e => e.status_aprovacao === 'aprovado')}
              updatingId={updatingId}
              onAprovar={handleAprovarEvento}
              onRejeitar={openRejectionDialog}
              onDelete={openDeleteDialog}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="rejeitados" className="mt-6">
            <EventosList 
              eventos={filteredEventos.filter(e => e.status_aprovacao === 'rejeitado')}
              updatingId={updatingId}
              onAprovar={handleAprovarEvento}
              onRejeitar={openRejectionDialog}
              onDelete={openDeleteDialog}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog para rejeição com comentário */}
        <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rejeitar Evento</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p>Tem certeza que deseja rejeitar o evento "{selectedEvento?.nome}"?</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejection-comment">Comentário (opcional)</Label>
                    <Textarea
                      id="rejection-comment"
                      placeholder="Explique o motivo da rejeição..."
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    O comentário será enviado junto com a notificação para a entidade.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowRejectionDialog(false);
                setRejectionComment('');
                setSelectedEvento(null);
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedEvento && handleRejeitarEvento(selectedEvento, rejectionComment)}
                className="bg-red-600 hover:bg-red-700"
              >
                Rejeitar Evento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para exclusão */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2">
                  <p className="text-red-600 font-semibold">
                    ⚠️ ATENÇÃO: Esta ação é irreversível!
                  </p>
                  <p>Tem certeza que deseja excluir permanentemente o evento "{eventoParaExcluir?.nome}"?</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Detalhes do evento:</strong><br/>
                    • Entidade: {eventoParaExcluir?.entidade_nome}<br/>
                    • Data: {eventoParaExcluir ? formatData(eventoParaExcluir.data_evento) : ''}<br/>
                    • Local: {eventoParaExcluir?.local || 'Não informado'}<br/>
                    • Capacidade: {eventoParaExcluir?.capacidade || 'Ilimitada'}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Consequências:</strong><br/>
                    • O evento será removido permanentemente da plataforma<br/>
                    • Todas as inscrições serão perdidas<br/>
                    • Esta ação não pode ser desfeita
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => eventoParaExcluir && handleDeleteEvento(eventoParaExcluir)}
                className="bg-red-700 hover:bg-red-800"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

// Componente para lista de eventos
interface EventosListProps {
  eventos: EventoParaAprovacao[];
  updatingId: string | null;
  onAprovar: (evento: EventoParaAprovacao) => void;
  onRejeitar: (evento: EventoParaAprovacao) => void;
  onDelete: (evento: EventoParaAprovacao) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const EventosList: React.FC<EventosListProps> = ({
  eventos,
  updatingId,
  onAprovar,
  onRejeitar,
  onDelete,
  getStatusColor,
  getStatusIcon
}) => {
  if (eventos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">
              Não há eventos para exibir com os filtros atuais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <Card key={evento.id} className="border-l-4 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold">{evento.nome}</h3>
                  <Badge className={getStatusColor(evento.status_aprovacao)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(evento.status_aprovacao)}
                      <span className="capitalize">{evento.status_aprovacao}</span>
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Entidade</p>
                    <p className="font-medium">{evento.entidade_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Evento</p>
                    <p className="text-sm">
                      {formatData(evento.data_evento)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{evento.local || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{evento.capacidade || 'Ilimitada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="text-sm">{evento.descricao || 'Sem descrição'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="text-sm">
                      {new Date(evento.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {evento.comentario_aprovacao && (
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-foreground mb-1">Comentário:</p>
                    <p className="text-sm text-muted-foreground">
                      {evento.comentario_aprovacao}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Ações */}
              <div className="flex items-center space-x-2 ml-4">
                {evento.status_aprovacao === 'pendente' && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={updatingId === evento.id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Aprovar Evento</AlertDialogTitle>
                          <AlertDialogDescription>
                            <div className="space-y-2">
                              <p>Tem certeza que deseja aprovar o evento "{evento.nome}"?</p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Detalhes do evento:</strong><br/>
                                • Entidade: {evento.entidade_nome}<br/>
                                • Data: {formatData(evento.data_evento)}<br/>
                                • Local: {evento.local || 'Não informado'}<br/>
                                • Capacidade: {evento.capacidade || 'Ilimitada'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                O evento ficará visível para todos os usuários da plataforma.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onAprovar(evento)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aprovar Evento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      disabled={updatingId === evento.id}
                      onClick={() => onRejeitar(evento)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      disabled={updatingId === evento.id || deleteLoading}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="space-y-2">
                          <p className="text-red-600 font-semibold">
                            ⚠️ ATENÇÃO: Esta ação é irreversível!
                          </p>
                          <p>Tem certeza que deseja excluir permanentemente o evento "{evento.nome}"?</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Detalhes do evento:</strong><br/>
                            • Entidade: {evento.entidade_nome}<br/>
                            • Data: {formatData(evento.data_evento)}<br/>
                            • Local: {evento.local || 'Não informado'}<br/>
                            • Capacidade: {evento.capacidade || 'Ilimitada'}<br/>
                            • Status: {evento.status_aprovacao}
                          </p>
                          <p className="text-sm text-red-600 mt-2">
                            <strong>Consequências:</strong><br/>
                            • O evento será removido permanentemente da plataforma<br/>
                            • Todas as inscrições serão perdidas<br/>
                            • Esta ação não pode ser desfeita
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(evento)}
                        className="bg-red-700 hover:bg-red-800"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AprovarEventosV2;
