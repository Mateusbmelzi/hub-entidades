import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, X } from 'lucide-react';
import { useReservasEntidade } from '@/hooks/useReservasEntidade';
import { useFaseReservas } from '@/hooks/useFaseReservas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReservaVinculada } from '@/types/processo-seletivo';

interface VincularReservasFaseProps {
  faseId: string;
  entidadeId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VincularReservasFase({
  faseId,
  entidadeId,
  isOpen,
  onClose,
  onSuccess,
}: VincularReservasFaseProps) {
  const { reservas, loading: loadingReservas, refetch } = useReservasEntidade(entidadeId);
  const { getReservasFase, vincularReservas, desvincularReserva, loading } = useFaseReservas();

  const [reservasSelecionadas, setReservasSelecionadas] = useState<string[]>([]);
  const [reservasVinculadas, setReservasVinculadas] = useState<ReservaVinculada[]>([]);

  useEffect(() => {
    if (isOpen && faseId) {
      loadReservasVinculadas();
    }
  }, [isOpen, faseId]);

  useEffect(() => {
    if (isOpen) {
      setReservasSelecionadas([]);
      refetch();
    }
  }, [isOpen]);

  const loadReservasVinculadas = async () => {
    const reservas = await getReservasFase(faseId);
    setReservasVinculadas(reservas);
  };

  const handleToggleReserva = (reservaId: string) => {
    setReservasSelecionadas(prev => {
      if (prev.includes(reservaId)) {
        return prev.filter(id => id !== reservaId);
      }
      return [...prev, reservaId];
    });
  };

  const handleVincular = async () => {
    if (reservasSelecionadas.length === 0) return;

    const result = await vincularReservas(faseId, reservasSelecionadas);
    if (result.success) {
      setReservasSelecionadas([]);
      await loadReservasVinculadas();
      onSuccess?.();
    }
  };

  const handleDesvincular = async (reservaId: string) => {
    const result = await desvincularReserva(faseId, reservaId);
    if (result.success) {
      await loadReservasVinculadas();
      onSuccess?.();
    }
  };

  const reservasVinculadasIds = reservasVinculadas.map(r => r.id);
  const reservasDisponiveis = reservas.filter(r => !reservasVinculadasIds.includes(r.id));

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Reservas da Fase</DialogTitle>
          <DialogDescription>
            Selecione reservas aprovadas para vincular a esta fase presencial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reservas já vinculadas */}
          {reservasVinculadas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Reservas Vinculadas</h3>
              <div className="space-y-2">
                {reservasVinculadas.map(reserva => (
                  <Card key={reserva.id} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatarData(reserva.data_reserva)}</span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>{reserva.horario_inicio} - {reserva.horario_termino}</span>
                          </div>
                          {reserva.sala_nome && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {reserva.sala_nome}
                                {reserva.sala_predio && ` - ${reserva.sala_predio}`}
                                {reserva.sala_andar && ` - ${reserva.sala_andar}`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{reserva.quantidade_pessoas} pessoas</span>
                            {reserva.sala_capacidade && (
                              <span className="text-xs">(Capacidade: {reserva.sala_capacidade})</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDesvincular(reserva.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Lista de reservas disponíveis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Reservas Disponíveis ({reservasDisponiveis.length})
              </h3>
              {reservasSelecionadas.length > 0 && (
                <Button onClick={handleVincular} disabled={loading}>
                  Vincular {reservasSelecionadas.length} Reserva(s)
                </Button>
              )}
            </div>

            {loadingReservas ? (
              <div className="text-center py-8 text-muted-foreground">Carregando reservas...</div>
            ) : reservasDisponiveis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma reserva disponível. Crie e aprove uma reserva primeiro.
              </div>
            ) : (
              <div className="space-y-2">
                {reservasDisponiveis.map(reserva => (
                  <Card key={reserva.id} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={reservasSelecionadas.includes(reserva.id)}
                          onCheckedChange={() => handleToggleReserva(reserva.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatarData(reserva.data_reserva)}</span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>{reserva.horario_inicio} - {reserva.horario_termino}</span>
                          </div>
                          {reserva.sala_nome && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {reserva.sala_nome}
                                {reserva.sala_predio && ` - ${reserva.sala_predio}`}
                                {reserva.sala_andar && ` - ${reserva.sala_andar}`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{reserva.quantidade_pessoas} pessoas</span>
                            {reserva.sala_capacidade && (
                              <span className="text-xs">(Capacidade: {reserva.sala_capacidade})</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aprovada
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

