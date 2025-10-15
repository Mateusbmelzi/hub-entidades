import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAprovarEventos, EventoParaAprovacao } from '@/hooks/useAprovarEventos';
import { useDeleteEventoAsEntity } from '@/hooks/useDeleteEventoAsEntity';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TIPO_EVENTO_LABELS } from '@/types/evento';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye,
  Filter,
  RefreshCw,
  Building2,
  User,
  Mail,
  Phone
} from 'lucide-react';

export function DashboardAprovacaoEventos() {
  const { toast } = useToast();
  const { eventos, loading, aprovarEvento, refetch } = useAprovarEventos();
  const { deleteEvento, loading: deleteLoading } = useDeleteEventoAsEntity();
  
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoParaAprovacao | null>(null);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoParaAprovacao | null>(null);

  // Filtrar eventos
  const filteredEventos = eventos.filter(evento => {
    const matchesStatus = statusFilter === 'todos' || evento.status_aprovacao === statusFilter;
    const matchesSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.entidade_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.local?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Contadores
  const counts = {
    pendentes: eventos.filter(e => e.status_aprovacao === 'pendente').length,
    aprovados: eventos.filter(e => e.status_aprovacao === 'aprovado').length,
    rejeitados: eventos.filter(e => e.status_aprovacao === 'rejeitado').length,
    total: eventos.length
  };

  const handleAprovarEvento = async (evento: EventoParaAprovacao) => {
    setUpdatingId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'aprovado');
      if (result.success) {
        toast({
          title: 'Evento aprovado',
          description: `Evento "${evento.nome}" foi aprovado com sucesso!`,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao aprovar evento',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar evento',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejeitarEvento = async (evento: EventoParaAprovacao, comentario: string) => {
    setUpdatingId(evento.id);
    try {
      const result = await aprovarEvento(evento.id, 'rejeitado', comentario);
      if (result.success) {
        toast({
          title: 'Evento rejeitado',
          description: `Evento "${evento.nome}" foi rejeitado.`,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao rejeitar evento',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao rejeitar evento',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
      setShowRejectionDialog(false);
      setRejectionComment('');
    }
  };

  const handleDeleteEvento = async (evento: EventoParaAprovacao) => {
    try {
      const result = await deleteEvento(evento.id, evento.entidade_id);
      if (result.success) {
        toast({
          title: 'Evento excluído',
          description: `Evento "${evento.nome}" foi excluído com sucesso.`,
        });
        await refetch();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir evento',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir evento',
        variant: 'destructive'
      });
    } finally {
      setShowDeleteDialog(false);
      setEventoParaExcluir(null);
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

  const openDetailsDialog = (evento: EventoParaAprovacao) => {
    setSelectedEvento(evento);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-600 border-green-600">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aprovação de Eventos</h2>
          <p className="text-gray-600">Gerencie a aprovação de eventos criados pelas organizações estudantis</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{counts.pendentes}</p>
                <p className="text-sm text-gray-500">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{counts.aprovados}</p>
                <p className="text-sm text-gray-500">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{counts.rejeitados}</p>
                <p className="text-sm text-gray-500">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{counts.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar eventos</Label>
              <Input
                id="search"
                placeholder="Nome do evento, entidade ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Filtrar por status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
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
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      <div className="space-y-4">
        {filteredEventos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Não há eventos para aprovar no momento.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Informações principais */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {evento.nome}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{evento.entidade_nome}</span>
                        </div>
                        {getStatusBadge(evento.status_aprovacao)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {evento.data_evento && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(evento.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      
                      {evento.local && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{evento.local}</span>
                        </div>
                      )}
                      
                      {evento.capacidade && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{evento.capacidade} pessoas</span>
                        </div>
                      )}
                    </div>

                    {evento.descricao && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {evento.descricao}
                      </p>
                    )}

                    {evento.comentario_aprovacao && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Comentário:</p>
                        <p className="text-sm text-gray-700">{evento.comentario_aprovacao}</p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(evento)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>

                    {evento.status_aprovacao === 'pendente' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAprovarEvento(evento)}
                          disabled={updatingId === evento.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {updatingId === evento.id ? 'Aprovando...' : 'Aprovar'}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectionDialog(evento)}
                          disabled={updatingId === evento.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(evento)}
                      disabled={deleteLoading}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de rejeição */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar o evento "{selectedEvento?.nome}"? 
              Adicione um comentário explicando o motivo da rejeição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-comment">Comentário (opcional)</Label>
              <Textarea
                id="rejection-comment"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectionDialog(false);
              setRejectionComment('');
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

      {/* Dialog de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o evento "{eventoParaExcluir?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setEventoParaExcluir(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => eventoParaExcluir && handleDeleteEvento(eventoParaExcluir)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>
              Informações completas do evento "{selectedEvento?.nome}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvento && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome do Evento</Label>
                  <p className="text-gray-900 font-medium">{selectedEvento.nome}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Entidade</Label>
                  <p className="text-gray-900">{selectedEvento.entidade_nome}</p>
                </div>
                
                {/* Tipo de Evento */}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipo de Evento</Label>
                  <div className="mt-1">
                    {selectedEvento.tipo_evento ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {TIPO_EVENTO_LABELS[selectedEvento.tipo_evento as keyof typeof TIPO_EVENTO_LABELS] || selectedEvento.tipo_evento}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 italic">Não informado</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEvento.status_aprovacao)}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Capacidade</Label>
                  <p className="text-gray-900">{selectedEvento.capacidade || 'Não informado'} pessoas</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Necessidade de Espaço Físico</Label>
                  <div className="mt-1">
                    {selectedEvento.local === 'A definir (será definido pela reserva)' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Sim - Precisa de reserva
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Não - Evento online/externo
                      </Badge>
                    )}
                  </div>
                </div>
                
                {selectedEvento.data_evento && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data do Evento</Label>
                    <p className="text-gray-900">
                      {format(new Date(selectedEvento.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Local</Label>
                  <p className="text-gray-900">{selectedEvento.local || 'Não informado'}</p>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Descrição</Label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedEvento.descricao || 'Não informado'}
                </p>
              </div>

              {/* Áreas de Atuação */}
              {selectedEvento.area_atuacao && Array.isArray(selectedEvento.area_atuacao) && selectedEvento.area_atuacao.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Áreas de Atuação</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedEvento.area_atuacao.map((area: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Palestrantes/Convidados */}
              {selectedEvento.palestrantes_convidados && Array.isArray(selectedEvento.palestrantes_convidados) && selectedEvento.palestrantes_convidados.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Professores/Palestrantes Convidados</Label>
                  <div className="mt-2 space-y-3">
                    {selectedEvento.palestrantes_convidados.map((palestrante: any, index: number) => (
                      <div key={palestrante.id || index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{palestrante.nomeCompleto}</h4>
                            {palestrante.apresentacao && (
                              <p className="text-sm text-gray-600 mt-1">{palestrante.apresentacao}</p>
                            )}
                            {palestrante.comoAjudaraOrganizacao && (
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Como ajudará:</strong> {palestrante.comoAjudaraOrganizacao}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {palestrante.ehPessoaPublica && (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">Pessoa Pública</Badge>
                            )}
                            {palestrante.haApoioExterno && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Apoio Externo</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {selectedEvento.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Observações</Label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedEvento.observacoes}</p>
                </div>
              )}

              {/* Link do Evento */}
              {selectedEvento.link_evento && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Link do Evento</Label>
                  <a 
                    href={selectedEvento.link_evento} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all block mt-1"
                  >
                    {selectedEvento.link_evento}
                  </a>
                </div>
              )}

              {/* Comentário de aprovação */}
              {selectedEvento.comentario_aprovacao && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Comentário de Aprovação</Label>
                  <p className="text-gray-900 mt-1">{selectedEvento.comentario_aprovacao}</p>
                </div>
              )}

              {/* Informações de criação */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">Criado em</Label>
                <p className="text-gray-900">
                  {format(new Date(selectedEvento.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
