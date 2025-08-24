import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Calendar, Filter, Building, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStateContext } from '@/components/AuthStateProvider';
import { useAprovarEventos, EventoParaAprovacao } from '@/hooks/useAprovarEventos';
import { useDeleteEventoAsEntity } from '@/hooks/useDeleteEventoAsEntity';
import { toast } from 'sonner';
import { combineDataHorario, formatData, formatHorario } from '@/lib/date-utils';

const AprovarEventos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { type } = useAuthStateContext();
  const { eventos, loading, aprovarEvento } = useAprovarEventos();
  const { deleteEvento, loading: deleteLoading } = useDeleteEventoAsEntity();
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoParaAprovacao | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoParaAprovacao | null>(null);

  // Verificar se o usuário é super admin (múltiplas formas)
  const isSuperAdmin = 
    type === 'superAdmin' || 
    user?.user_metadata?.role === 'superAdmin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.email === 'admin@admin' ||
    localStorage.getItem('superAdmin') === 'true';

  console.log('🔍 AprovarEventos Debug:', {
    type,
    userEmail: user?.email,
    userRole: user?.user_metadata?.role,
    localStorage: localStorage.getItem('superAdmin'),
    isSuperAdmin
  });

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

  const filteredEventos = eventos.filter(e => {
    if (statusFilter === 'todos') return true;
    return e.status_aprovacao === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-insper-yellow/10 text-insper-yellow border-insper-yellow/20';
      case 'aprovado':
        return 'bg-insper-green/10 text-insper-green border-insper-green/20';
      case 'rejeitado':
        return 'bg-insper-error-red/10 text-insper-error-red border-insper-error-red/20';
      default:
        return 'bg-insper-light-gray text-insper-dark-gray border-insper-light-gray-1';
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
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-insper-dark-gray hover:bg-insper-light-gray">
            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar à Visão Geral
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-insper-black">Aprovar Eventos</h1>
          <p className="text-insper-dark-gray">
            Gerencie a aprovação de eventos criados pelas entidades
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
              </span>
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

        {filteredEventos.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'todos' 
                    ? 'Não há eventos para aprovar no momento.'
                    : `Não há eventos com status "${statusFilter}".`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEventos.map((evento) => (
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
                            {evento.data ? formatData(evento.data) : 'Data não informada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Horário</p>
                          <p className="text-sm">
                            {evento.horario ? formatHorario(evento.horario) : 'Horário não informado'}
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
                    
                    {evento.status_aprovacao === 'pendente' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={updatingId === evento.id}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar Evento
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
                                    • Data: {evento.data ? formatData(evento.data) : 'Data não informada'}<br/>
                                    • Horário: {evento.horario ? formatHorario(evento.horario) : 'Horário não informado'}<br/>
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
                                onClick={() => handleAprovarEvento(evento)}
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
                          onClick={() => openRejectionDialog(evento)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar Evento
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={updatingId === evento.id || deleteLoading}
                              className="bg-red-700 hover:bg-red-800"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir Evento
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
                                    • Data: {evento.data ? formatData(evento.data) : 'Data não informada'}<br/>
                                    • Horário: {evento.horario ? formatHorario(evento.horario) : 'Horário não informado'}<br/>
                                    • Local: {evento.local || 'Não informado'}<br/>
                                    • Capacidade: {evento.capacidade || 'Ilimitada'}
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
                                onClick={() => handleDeleteEvento(evento)}
                                className="bg-red-700 hover:bg-red-800"
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    
                    {evento.status_aprovacao !== 'pendente' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge 
                          variant={evento.status_aprovacao === 'aprovado' ? 'default' : 'secondary'}
                          className={evento.status_aprovacao === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {evento.status_aprovacao === 'aprovado' ? 'Evento Aprovado' : 'Evento Rejeitado'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {evento.status_aprovacao === 'aprovado' 
                            ? 'O evento está visível na plataforma.'
                            : 'O evento foi rejeitado.'
                          }
                        </p>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={deleteLoading}
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
                                    • Data: {evento.data ? formatData(evento.data) : 'Data não informada'}<br/>
                                    • Horário: {evento.horario ? formatHorario(evento.horario) : 'Horário não informado'}<br/>
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
                                onClick={() => handleDeleteEvento(evento)}
                                className="bg-red-700 hover:bg-red-800"
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default AprovarEventos; 