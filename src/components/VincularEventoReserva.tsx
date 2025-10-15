import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useEventosSemReserva } from '@/hooks/useEventosSemReserva';
import { useReservasSemEvento } from '@/hooks/useReservasSemEvento';
import { useVincularEventoReserva } from '@/hooks/useVincularEventoReserva';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link2, Unlink, Calendar, MapPin, Users, AlertCircle } from 'lucide-react';
import type { Reserva } from '@/types/reserva';

interface VincularEventoReservaProps {
  reserva?: Reserva;
  evento?: {
    id: string;
    nome: string;
    data_evento: string;
    capacidade?: number;
    reserva_id?: string | null;
  };
  entidadeId: number;
  onSuccess?: () => void;
}

export function VincularEventoReserva({ reserva, evento, entidadeId, onSuccess }: VincularEventoReservaProps) {
  const [selectedEventoId, setSelectedEventoId] = useState<string>('');
  const [selectedReservaId, setSelectedReservaId] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDesvincularDialog, setShowDesvincularDialog] = useState(false);

  const { eventos, loading: eventosLoading, refetch: refetchEventos } = useEventosSemReserva(entidadeId);
  const { reservas, loading: reservasLoading, refetch: refetchReservas } = useReservasSemEvento(entidadeId);
  const { vincularEventoReserva, desvincularEventoReserva, loading: vinculandoLoading } = useVincularEventoReserva();

  // Se vindo de reserva, mostrar eventos sem reserva
  const mostrarEventos = Boolean(reserva);
  // Se vindo de evento, mostrar reservas sem evento
  const mostrarReservas = Boolean(evento);

  const handleVincular = async () => {
    const eventoIdFinal = evento?.id || selectedEventoId;
    const reservaIdFinal = reserva?.id || selectedReservaId;

    if (!eventoIdFinal || !reservaIdFinal) {
      return;
    }

    const result = await vincularEventoReserva(eventoIdFinal, reservaIdFinal);
    
    if (result.success) {
      setShowConfirmDialog(false);
      setSelectedEventoId('');
      setSelectedReservaId('');
      refetchEventos();
      refetchReservas();
      onSuccess?.();
    }
  };

  const handleDesvincular = async () => {
    if (!evento?.id || !evento?.reserva_id) {
      return;
    }

    const result = await desvincularEventoReserva(evento.id, evento.reserva_id);
    
    if (result.success) {
      setShowDesvincularDialog(false);
      refetchEventos();
      refetchReservas();
      onSuccess?.();
    }
  };

  const validarVinculacao = () => {
    // Aqui você pode adicionar validações adicionais
    // Por exemplo: verificar compatibilidade de datas, capacidades, etc.
    setShowConfirmDialog(true);
  };

  // Se vindo de evento que já tem reserva, mostrar opção de desvincular
  if (evento && evento.reserva_id) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlink className="h-5 w-5" />
              Desvincular Reserva
            </CardTitle>
            <CardDescription>
              Este evento já está vinculado a uma reserva. Você pode desvinculá-lo para associar a outra reserva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDesvincularDialog(true)}
              disabled={vinculandoLoading}
            >
              <Unlink className="h-4 w-4 mr-2" />
              Desvincular Reserva Atual
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showDesvincularDialog} onOpenChange={setShowDesvincularDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desvincular reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desvincular a reserva deste evento? 
                A reserva ficará disponível para ser vinculada a outro evento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDesvincular}>
                Desvincular
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vincular {mostrarEventos ? 'Evento' : 'Reserva'}
          </CardTitle>
          <CardDescription>
            {mostrarEventos 
              ? 'Selecione um evento aprovado para vincular a esta reserva'
              : 'Selecione uma reserva aprovada para vincular a este evento'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mostrarEventos && (
            <div className="space-y-2">
              <Label htmlFor="evento-select">Selecionar Evento</Label>
              {eventosLoading ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              ) : eventos.length === 0 ? (
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Nenhum evento disponível
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Não há eventos aprovados sem reserva associada. 
                        Crie um evento ou aguarde a aprovação.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={selectedEventoId} onValueChange={setSelectedEventoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos.map((evt) => (
                      <SelectItem key={evt.id} value={evt.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{evt.nome}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(evt.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            {evt.capacidade && ` • ${evt.capacidade} pessoas`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {mostrarReservas && (
            <div className="space-y-2">
              <Label htmlFor="reserva-select">Selecionar Reserva</Label>
              {reservasLoading ? (
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              ) : reservas.length === 0 ? (
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Nenhuma reserva disponível
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Não há reservas aprovadas sem evento associado. 
                        Crie uma reserva ou aguarde a aprovação.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={selectedReservaId} onValueChange={setSelectedReservaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma reserva..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reservas.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {res.titulo_evento_capacitacao || res.sala_nome || 'Reserva'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(res.data_reserva), 'dd/MM/yyyy', { locale: ptBR })}
                            {' • '}
                            {res.horario_inicio} - {res.horario_termino}
                            {res.quantidade_pessoas && ` • ${res.quantidade_pessoas} pessoas`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button
            onClick={validarVinculacao}
            disabled={
              vinculandoLoading ||
              (mostrarEventos && !selectedEventoId) ||
              (mostrarReservas && !selectedReservaId)
            }
            className="w-full"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {vinculandoLoading ? 'Vinculando...' : 'Vincular'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar vinculação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja vincular este {mostrarEventos ? 'evento à reserva' : 'esta reserva ao evento'}?
              Após a vinculação, o evento aparecerá publicamente (se ambos estiverem aprovados).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleVincular}>
              Confirmar Vinculação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

