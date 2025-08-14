import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useUpdateEventoAsEntity } from '@/hooks/useUpdateEventoAsEntity';
import type { Evento } from '@/hooks/useEventosEntidade';

interface EditarEventoEntidadeProps {
  evento: Evento;
  entidadeId: number;
  onSuccess: () => void;
}

export default function EditarEventoEntidade({ evento, entidadeId, onSuccess }: EditarEventoEntidadeProps) {
  const [nome, setNome] = useState(evento.nome);
  const [descricao, setDescricao] = useState(evento.descricao || '');
  const [local, setLocal] = useState(evento.local || '');
  const [dataEvento, setDataEvento] = useState(() => {
    const data = new Date(evento.data);
    const horario = evento.horario;
    if (horario) {
      const [horas, minutos] = horario.split(':');
      data.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    }
    return data.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [capacidade, setCapacidade] = useState(evento.capacidade?.toString() || '');
  const [link_evento, setLinkevento] = useState(evento.link_evento || '');

  const { updateEvento, loading } = useUpdateEventoAsEntity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Separar data e horário para compatibilidade com a tabela
    let dataStr: string | undefined;
    let horarioStr: string | undefined;

    if (dataEvento) {
      const d = new Date(dataEvento);
      if (!isNaN(d.getTime())) {
        dataStr = d.toISOString().slice(0, 10);   // YYYY-MM-DD
        horarioStr = d.toISOString().slice(11, 19); // HH:mm:ss
      }
    }

    const result = await updateEvento(evento.id, entidadeId, {
      nome,
      descricao,
      link_evento,
      local,
      capacidade: capacidade ? parseInt(capacidade) : undefined,
      data: dataStr,
      horario: horarioStr,
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Editar Evento
        </DialogTitle>
        <DialogDescription>
          Edite as informações do evento "{evento.nome}"
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Evento</Label>
          <Input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Workshop de React"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o evento, objetivos e o que os participantes podem esperar..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_evento">Link do evento</Label>
          <Textarea
            id="link_evento"
            value={link_evento}
            onChange={(e) => setLinkevento(e.target.value)}
            placeholder="Link para inscrição oficial do evento"
            rows={1}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="local" className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              Local
            </Label>
            <Input
              id="local"
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Auditório A, Online"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade" className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              Capacidade (opcional)
            </Label>
            <Input
              id="capacidade"
              type="number"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              placeholder="Ex: 50"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-evento">Data e Hora do Evento</Label>
          <Input
            id="data-evento"
            type="datetime-local"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}
