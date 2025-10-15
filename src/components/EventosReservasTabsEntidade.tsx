import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VincularEventoReserva } from '@/components/VincularEventoReserva';
import { CriarEventoDeReserva } from '@/components/CriarEventoDeReserva';
import { getStatusBadgeEvento, getStatusBadgeReserva } from '@/lib/evento-reserva-status';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Link2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { combineDataHorario } from '@/lib/date-utils';

interface EventosReservasTabsEntidadeProps {
  eventos: any[];
  reservas: any[];
  entidadeId: number;
  isOwner: boolean;
  onRefetch: () => void;
  onEditEvent?: (evento: any) => void;
  onDeleteEvent?: (evento: any) => void;
  onConfigurarFormulario?: (evento: any) => void;
}

export function EventosReservasTabsEntidade({
  eventos,
  reservas,
  entidadeId,
  isOwner,
  onRefetch,
  onEditEvent,
  onDeleteEvent,
  onConfigurarFormulario
}: EventosReservasTabsEntidadeProps) {
  const [showVincularDialog, setShowVincularDialog] = useState(false);
  const [selectedEventoVincular, setSelectedEventoVincular] = useState<any>(null);
  const [selectedReservaVincular, setSelectedReservaVincular] = useState<any>(null);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);

  const handleVincularSuccess = () => {
    setShowVincularDialog(false);
    setSelectedEventoVincular(null);
    setSelectedReservaVincular(null);
    onRefetch();
  };

  return (
    <>
      <Tabs defaultValue="eventos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eventos">
            Eventos ({eventos.length})
          </TabsTrigger>
          <TabsTrigger value="reservas">
            Reservas ({reservas.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Eventos */}
        <TabsContent value="eventos" className="space-y-4 mt-4">
          {eventos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum evento criado ainda.</p>
              </CardContent>
            </Card>
          ) : (
            eventos.map((evento) => {
              const dataEvento = combineDataHorario(evento.data, evento.horario_inicio);
              const isPast = dataEvento < new Date();

              return (
                <Card key={evento.id} className={isPast ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{evento.nome}</h3>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {getStatusBadgeEvento(evento, reservas)}
                              {isPast && <Badge variant="outline">Evento passado</Badge>}
                            </div>
                          </div>

                          {/* Menu de ações */}
                          {isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onEditEvent && (
                                  <DropdownMenuItem onClick={() => onEditEvent(evento)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {onDeleteEvent && (
                                  <DropdownMenuItem 
                                    onClick={() => onDeleteEvent(evento)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                )}
                                {onConfigurarFormulario && evento.status_aprovacao === 'aprovado' && (
                                  <DropdownMenuItem onClick={() => onConfigurarFormulario(evento)}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    {evento.formulario_ativo ? 'Editar Formulário' : 'Configurar Formulário'}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          
                          {evento.horario_inicio && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{evento.horario_inicio}</span>
                            </div>
                          )}
                          
                          {evento.local && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{evento.local}</span>
                            </div>
                          )}
                          
                          {evento.capacidade && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{evento.capacidade} vagas</span>
                            </div>
                          )}
                        </div>

                        {/* Badge de status do formulário */}
                        <div className="flex items-center gap-2 mt-3">
                          {evento.formulario_ativo ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <FileText className="h-3 w-3 mr-1" />
                              Formulário Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              <FileText className="h-3 w-3 mr-1" />
                              Sem Formulário
                            </Badge>
                          )}
                        </div>

                        {evento.descricao && (
                          <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                            {evento.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {isOwner && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        {/* Botão de vincular se evento aprovado sem reserva */}
                        {evento.status_aprovacao === 'aprovado' && !evento.reserva_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEventoVincular(evento);
                              setSelectedReservaVincular(null);
                              setShowVincularDialog(true);
                            }}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Vincular a Reserva
                          </Button>
                        )}
                        
                        {/* Botão de gerenciar se evento tem reserva */}
                        {evento.reserva_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEventoVincular(evento);
                              setSelectedReservaVincular(null);
                              setShowVincularDialog(true);
                            }}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Gerenciar Vinculação
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Tab de Reservas */}
        <TabsContent value="reservas" className="space-y-4 mt-4">
          {reservas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma reserva criada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            reservas.map((reserva) => {
              const dataReserva = new Date(reserva.data_reserva);
              const isPast = dataReserva < new Date();

              return (
                <Card key={reserva.id} className={isPast ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {reserva.titulo_evento_capacitacao || reserva.sala_nome || 'Reserva'}
                        </h3>
                        
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {getStatusBadgeReserva(reserva)}
                          {isPast && <Badge variant="outline">Reserva passada</Badge>}
                          <Badge variant="outline">
                            {reserva.tipo_reserva === 'sala' ? 'Sala' : 'Auditório'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(dataReserva, 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{reserva.horario_inicio} - {reserva.horario_termino}</span>
                          </div>
                          
                          {reserva.sala_nome && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{reserva.sala_nome}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{reserva.quantidade_pessoas} pessoas</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {isOwner && reserva.status_reserva === 'aprovada' && !reserva.evento_id && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReservaVincular(reserva);
                            setSelectedEventoVincular(null);
                            setShowVincularDialog(true);
                          }}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Vincular a Evento
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedReserva(reserva);
                            setShowCreateEventDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Evento
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Vinculação */}
      <Dialog open={showVincularDialog} onOpenChange={setShowVincularDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEventoVincular ? 'Vincular Evento a Reserva' : 'Vincular Reserva a Evento'}
            </DialogTitle>
          </DialogHeader>
          <VincularEventoReserva
            evento={selectedEventoVincular}
            reserva={selectedReservaVincular}
            entidadeId={entidadeId}
            onSuccess={handleVincularSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Criar Evento de Reserva */}
      <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReserva && (
            <CriarEventoDeReserva
              reserva={selectedReserva}
              entidadeId={entidadeId}
              onSuccess={() => {
                setShowCreateEventDialog(false);
                setSelectedReserva(null);
                onRefetch();
              }}
              onCancel={() => {
                setShowCreateEventDialog(false);
                setSelectedReserva(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

