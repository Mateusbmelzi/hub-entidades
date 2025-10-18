import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventosEntidade } from '@/hooks/useEventosEntidade';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles, AlertCircle } from 'lucide-react';

interface PreencherReservaComEventoProps {
  entidadeId: number;
  onAplicar: (dados: DadosEvento) => void;
}

export interface DadosEvento {
  titulo: string;
  descricao: string;
  dataReserva: string; // YYYY-MM-DD
  horarioInicio: string; // HH:MM
  horarioTermino: string; // HH:MM  
  quantidadePessoas: number;
  tipoEvento?: string; // Novo
  palestrantes?: any[]; // Novo
}

export function PreencherReservaComEvento({ entidadeId, onAplicar }: PreencherReservaComEventoProps) {
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string>('');
  const { eventos, loading } = useEventosEntidade(entidadeId, true);

  // Filtrar apenas eventos aprovados
  const eventosAprovados = eventos?.filter(e => e.status_aprovacao === 'aprovado') || [];

  const handleAplicarDados = () => {
    const eventoSelecionado = eventosAprovados.find(e => e.id === eventoSelecionadoId);
    
    if (!eventoSelecionado) return;

    // Como data_evento agora é null, vamos deixar campos vazios para serem preenchidos na reserva
    const dados: DadosEvento = {
      titulo: eventoSelecionado.nome,
      descricao: eventoSelecionado.descricao || '',
      dataReserva: '', // Reserva define
      horarioInicio: '', // Reserva define
      horarioTermino: '', // Reserva define
      quantidadePessoas: eventoSelecionado.capacidade || 0,
      tipoEvento: eventoSelecionado.tipo_evento,
      palestrantes: eventoSelecionado.palestrantes_convidados
    };

    onAplicar(dados);
    setEventoSelecionadoId('');
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
        <div className="h-20 bg-blue-100 rounded animate-pulse" />
      </div>
    );
  }

  if (eventosAprovados.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Preencher com dados de evento
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Você não tem eventos aprovados para preencher automaticamente. 
              Crie um evento primeiro ou aguarde a aprovação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">
          Preencher com dados de evento existente
        </h3>
      </div>
      
      <p className="text-sm text-blue-700 mb-4">
        Selecione um evento aprovado para preencher automaticamente os dados da reserva.
      </p>

      <div className="space-y-3">
        <div>
          <Label htmlFor="evento-select" className="text-blue-900">
            Evento
          </Label>
          <Select value={eventoSelecionadoId} onValueChange={setEventoSelecionadoId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione um evento..." />
            </SelectTrigger>
            <SelectContent>
              {eventosAprovados.map((evento) => (
                <SelectItem key={evento.id} value={evento.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{evento.nome}</span>
                    <span className="text-xs text-gray-500">
                      {evento.data_evento ? format(new Date(evento.data_evento), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Data a definir'}
                      {evento.capacidade && ` • ${evento.capacidade} pessoas`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAplicarDados}
          disabled={!eventoSelecionadoId}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Aplicar dados do evento
        </Button>

        <p className="text-xs text-blue-600">
          Os campos: título, descrição, data, horário e quantidade de pessoas serão preenchidos automaticamente.
        </p>
      </div>
    </div>
  );
}

