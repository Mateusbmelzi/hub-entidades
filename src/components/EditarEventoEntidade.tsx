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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { updateEvento, loading } = useUpdateEventoAsEntity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar mensagens de erro anteriores
    setErrorMessage(null);
    
    console.log('🔄 Submetendo formulário de edição de evento...');
    console.log('📝 Dados do formulário:', {
      nome,
      descricao,
      link_evento,
      local,
      capacidade,
      dataEvento
    });

    // Validações básicas
    if (!nome.trim()) {
      setErrorMessage('Nome é obrigatório');
      console.error('❌ Nome é obrigatório');
      return;
    }

    if (!dataEvento) {
      setErrorMessage('Data e hora são obrigatórios');
      console.error('❌ Data e hora são obrigatórios');
      return;
    }

    // Separar data e horário para compatibilidade com a tabela
    let dataStr: string | undefined;
    let horarioStr: string | undefined;

    try {
      if (dataEvento) {
        const d = new Date(dataEvento);
        if (isNaN(d.getTime())) {
          throw new Error('Data inválida fornecida');
        }
        
        // Verificar se a data não é no passado
        const agora = new Date();
        if (d < agora) {
          console.warn('⚠️ Data do evento está no passado');
        }
        
        dataStr = d.toISOString().slice(0, 10);   // YYYY-MM-DD
        horarioStr = d.toISOString().slice(11, 19); // HH:mm:ss
        console.log('📅 Data processada:', { dataStr, horarioStr });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Data inválida';
      setErrorMessage(`Erro ao processar data: ${errorMsg}`);
      console.error('❌ Erro ao processar data:', error);
      return;
    }

    const updateData = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      link_evento: link_evento.trim() || null,
      local: local.trim() || null,
      capacidade: capacidade ? parseInt(capacidade) : null,
      data: dataStr,
      horario: horarioStr,
    };

    console.log('📤 Dados para update:', updateData);
    console.log('🆔 IDs:', { eventoId: evento.id, entidadeId });

    try {
      const result = await updateEvento(evento.id, entidadeId, updateData);

      console.log('📥 Resultado do update:', result);

      if (result.success) {
        console.log('✅ Update realizado com sucesso, chamando onSuccess');
        onSuccess();
      } else {
        console.error('❌ Falha no update:', result.error);
        setErrorMessage(result.error || 'Erro desconhecido ao atualizar evento');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrorMessage(`Erro durante o update: ${errorMsg}`);
      console.error('❌ Erro durante o update:', error);
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

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}
