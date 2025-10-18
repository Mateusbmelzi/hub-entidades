import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventosEntidade } from '@/hooks/useEventosEntidade';
import { useNavigateToReservaForm } from '@/hooks/useNavigateToReservaForm';
import { DadosEvento } from '@/components/PreencherReservaComEvento';
import { Building, Presentation, ArrowLeft, Calendar } from 'lucide-react';

interface CriarReservaDialogProps {
  entidadeId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CriarReservaDialog({ entidadeId, isOpen, onClose }: CriarReservaDialogProps) {
  // Controle de etapas: 1 = tipo, 2 = usar evento?, 3 = selecionar evento
  const [etapa, setEtapa] = useState(1);
  
  // Tipo selecionado: 'sala' ou 'auditorio'
  const [tipoReserva, setTipoReserva] = useState<'sala' | 'auditorio' | null>(null);
  
  // Se vai usar evento ou não
  const [usarEvento, setUsarEvento] = useState<boolean | null>(null);
  
  // ID do evento selecionado
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string>('');

  // Hooks
  const { eventos, loading } = useEventosEntidade(entidadeId, true);
  const { navegarParaSala, navegarParaAuditorio } = useNavigateToReservaForm();

  // Filtrar apenas eventos aprovados
  const eventosAprovados = eventos?.filter(e => e.status_aprovacao === 'aprovado') || [];

  // Resetar dialog ao fechar
  const handleClose = () => {
    setEtapa(1);
    setTipoReserva(null);
    setUsarEvento(null);
    setEventoSelecionadoId('');
    onClose();
  };

  // Voltar para etapa anterior
  const handleVoltar = () => {
    if (etapa === 3) {
      setEtapa(2);
      setEventoSelecionadoId('');
    } else if (etapa === 2) {
      setEtapa(1);
      setUsarEvento(null);
    }
  };

  // Escolher tipo e avançar
  const handleEscolherTipo = (tipo: 'sala' | 'auditorio') => {
    setTipoReserva(tipo);
    setEtapa(2);
  };

  // Responder se vai usar evento
  const handleUsarEvento = (usar: boolean) => {
    setUsarEvento(usar);
    if (usar) {
      // Se vai usar, vai para etapa 3 (selecionar evento)
      setEtapa(3);
    } else {
      // Se não vai usar, redireciona direto para formulário vazio
      if (tipoReserva === 'sala') {
        navegarParaSala(entidadeId);
      } else {
        navegarParaAuditorio(entidadeId);
      }
      handleClose();
    }
  };

  // Continuar com evento selecionado
  const handleContinuar = () => {
    const eventoSelecionado = eventosAprovados.find(e => e.id === eventoSelecionadoId);
    
    if (!eventoSelecionado) return;

    // Montar dados do evento
    const dados: DadosEvento = {
      titulo: eventoSelecionado.nome,
      descricao: eventoSelecionado.descricao || '',
      dataReserva: '',
      horarioInicio: '',
      horarioTermino: '',
      quantidadePessoas: eventoSelecionado.capacidade || 0,
      tipoEvento: eventoSelecionado.tipo_evento,
      palestrantes: eventoSelecionado.palestrantes_convidados
    };

    // Redirecionar com dados
    if (tipoReserva === 'sala') {
      navegarParaSala(entidadeId, dados);
    } else {
      navegarParaAuditorio(entidadeId, dados);
    }
    
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Reserva</DialogTitle>
          <DialogDescription>
            {etapa === 1 && 'Escolha o tipo de reserva que deseja criar'}
            {etapa === 2 && 'Deseja usar dados de um evento existente?'}
            {etapa === 3 && 'Selecione o evento para preencher automaticamente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ETAPA 1: Escolher Tipo */}
          {etapa === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3"
                onClick={() => handleEscolherTipo('sala')}
              >
                <Building className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Reservar Sala</div>
                  <div className="text-xs text-gray-500">
                    Para reuniões e workshops
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col gap-3"
                onClick={() => handleEscolherTipo('auditorio')}
              >
                <Presentation className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Reservar Auditório</div>
                  <div className="text-xs text-gray-500">
                    Para eventos maiores
                  </div>
                </div>
              </Button>
            </div>
          )}

          {/* ETAPA 2: Usar Evento? */}
          {etapa === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  Você já tem um evento aprovado? Podemos preencher automaticamente 
                  os dados da reserva usando as informações do evento.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleUsarEvento(true)}
                  disabled={loading || eventosAprovados.length === 0}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Sim, usar evento</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleUsarEvento(false)}
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>Não, criar do zero</span>
                  </div>
                </Button>
              </div>

              {eventosAprovados.length === 0 && (
                <p className="text-sm text-amber-600 text-center">
                  Você não tem eventos aprovados disponíveis.
                </p>
              )}

              <Button
                variant="ghost"
                onClick={handleVoltar}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}

          {/* ETAPA 3: Selecionar Evento */}
          {etapa === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="evento-select">Evento</Label>
                <Select value={eventoSelecionadoId} onValueChange={setEventoSelecionadoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eventosAprovados.map((evento) => (
                      <SelectItem key={evento.id} value={evento.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{evento.nome}</span>
                          <span className="text-xs text-gray-500">
                            {evento.capacidade && `${evento.capacidade} pessoas`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleVoltar}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                <Button
                  onClick={handleContinuar}
                  disabled={!eventoSelecionadoId}
                  className="flex-1"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
