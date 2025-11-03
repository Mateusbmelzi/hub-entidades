import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import { useCandidatosReservas } from '@/hooks/useCandidatosReservas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CandidatoItem {
  inscricaoId: string; // id de inscricoes_processo_seletivo
  inscricaoFaseId: string; // id de inscricoes_fases_ps (fase atual)
  nome: string;
  email?: string;
  statusFase?: string;
}

interface ReservaItem {
  id: string;
  data: string;
  inicio: string;
  fim: string;
  sala?: string;
  predio?: string;
  andar?: string;
  capacidade?: number;
}

interface Props {
  faseId: string;
  isOpen: boolean;
  onClose: () => void;
  candidatos: CandidatoItem[]; // candidatos na fase atual
  reservas: ReservaItem[]; // reservas vinculadas à fase
}

export const AtribuirCandidatosReserva: React.FC<Props> = ({ faseId, isOpen, onClose, candidatos, reservas }) => {
  const { atribuirCandidatosReserva, loading } = useCandidatosReservas();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [reservaSelecionada, setReservaSelecionada] = useState<string>('');

  const candidatosDisponiveis = useMemo(() => candidatos || [], [candidatos]);
  const reservaSelecionadaObj = useMemo(() => reservas.find(r => r.id === reservaSelecionada), [reservas, reservaSelecionada]);

  const toggleCandidato = (inscricaoFaseId: string) => {
    setSelecionados(prev => prev.includes(inscricaoFaseId) ? prev.filter(id => id !== inscricaoFaseId) : [...prev, inscricaoFaseId]);
  };

  const handleAtribuir = async () => {
    if (!reservaSelecionada || selecionados.length === 0) return;
    const result = await atribuirCandidatosReserva(reservaSelecionada, selecionados);
    if (result.success) {
      setSelecionados([]);
      onClose();
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Atribuir candidatos à reserva</DialogTitle>
          <DialogDescription>Selecione os candidatos desta fase e escolha uma das reservas vinculadas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Selecione a Reserva</div>
            <Select value={reservaSelecionada} onValueChange={setReservaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a reserva" />
              </SelectTrigger>
              <SelectContent>
                {reservas.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatarData(r.data)}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{r.inicio}-{r.fim}</span>
                      {r.sala && (
                        <>
                          <MapPin className="h-3 w-3 ml-2" />
                          <span className="font-medium">{r.sala}</span>
                        </>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações da Reserva Selecionada */}
          {reservaSelecionadaObj && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Sala</div>
                      <div className="text-lg font-bold text-blue-700">
                        {reservaSelecionadaObj.sala || 'Sala não informada'}
                        {reservaSelecionadaObj.predio && ` - ${reservaSelecionadaObj.predio}`}
                        {reservaSelecionadaObj.andar && ` - ${reservaSelecionadaObj.andar}`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        Data
                      </div>
                      <div className="text-sm font-medium">{formatarData(reservaSelecionadaObj.data)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        Horário
                      </div>
                      <div className="text-sm font-medium">{reservaSelecionadaObj.inicio} - {reservaSelecionadaObj.fim}</div>
                    </div>
                  </div>
                  {reservaSelecionadaObj.capacidade && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Capacidade: <span className="font-medium">{reservaSelecionadaObj.capacidade} pessoas</span>
                      </span>
                      {selecionados.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {selecionados.length} candidato(s) selecionado(s)
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Candidatos ({candidatosDisponiveis.length})</div>
            <div className="border rounded p-2 max-h-72 overflow-auto space-y-2">
              {candidatosDisponiveis.map(c => (
                <label key={c.inscricaoFaseId} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selecionados.includes(c.inscricaoFaseId)} onCheckedChange={() => toggleCandidato(c.inscricaoFaseId)} />
                  <span className="font-medium">{c.nome}</span>
                  {c.email && <span className="text-muted-foreground">• {c.email}</span>}
                  {c.statusFase && <span className="ml-auto text-xs text-muted-foreground">{c.statusFase}</span>}
                </label>
              ))}
              {candidatosDisponiveis.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhum candidato disponível nesta fase.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleAtribuir} disabled={loading || !reservaSelecionada || selecionados.length === 0}>
              Atribuir {selecionados.length > 0 ? `${selecionados.length} candidato(s)` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


