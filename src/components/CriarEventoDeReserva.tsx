import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Users, Target } from 'lucide-react';
import { useCreateEventoAsEntity } from '@/hooks/useCreateEventoAsEntity';
import { supabase } from '@/integrations/supabase/client';
import { AREAS_ATUACAO } from '@/lib/constants';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { parseDateTime, validateDateTime } from '@/lib/datetime-input-utils';
import type { Reserva } from '@/types/reserva';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ConfigurarFormularioInscricao } from '@/components/ConfigurarFormularioInscricao';

interface CriarEventoDeReservaProps {
  reserva: Reserva;
  entidadeId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CriarEventoDeReserva({ reserva, entidadeId, onSuccess, onCancel }: CriarEventoDeReservaProps) {
  const { toast } = useToast();
  
  // Preencher automaticamente com dados da reserva
  const [nome, setNome] = useState(reserva.titulo_evento_capacitacao || '');
  const [descricao, setDescricao] = useState(
    reserva.descricao_pautas_evento_capacitacao || 
    reserva.descricao_programacao_evento || 
    ''
  );
  const [local, setLocal] = useState(
    (() => {
      if (reserva.sala_nome) {
        const predio = reserva.sala_predio ? ` - Prédio ${reserva.sala_predio}` : '';
        const andar = reserva.sala_andar ? ` - Andar ${reserva.sala_andar}` : '';
        return `${reserva.sala_nome}${predio}${andar}`;
      }
      return reserva.tipo_reserva === 'auditorio' ? 'Auditório' : 'Local a definir';
    })()
  );
  
  // Formatar data e hora inicial: DD/MM/AAAA HH:MM
  const formatarDataHoraInicial = () => {
    const [ano, mes, dia] = reserva.data_reserva.split('-');
    // Remover segundos do horário se existirem
    const horario = reserva.horario_inicio.includes(':') 
      ? reserva.horario_inicio.substring(0, 5) // HH:MM
      : reserva.horario_inicio;
    return `${dia}/${mes}/${ano} ${horario}`;
  };
  
  const [dataEvento, setDataEvento] = useState(formatarDataHoraInicial());
  const [capacidade, setCapacidade] = useState(
    reserva.quantidade_pessoas?.toString() || 
    reserva.sala_capacidade?.toString() || 
    ''
  );
  const [link_evento, setLinkEvento] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [dateTimeError, setDateTimeError] = useState('');
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null);
  const [showFormularioConfig, setShowFormularioConfig] = useState(false);
  const [eventoId, setEventoId] = useState<string | null>(null);
  const { createEvento, loading } = useCreateEventoAsEntity();

  // Atualizar campos quando a reserva mudar
  React.useEffect(() => {
    if (reserva) {
      setNome(reserva.titulo_evento_capacitacao || '');
      setDescricao(
        reserva.descricao_pautas_evento_capacitacao || 
        reserva.descricao_programacao_evento || 
        ''
      );
      
      // Preencher local com dados da reserva
      if (reserva.sala_nome) {
        const predio = reserva.sala_predio ? ` - Prédio ${reserva.sala_predio}` : '';
        const andar = reserva.sala_andar ? ` - Andar ${reserva.sala_andar}` : '';
        setLocal(`${reserva.sala_nome}${predio}${andar}`);
      } else {
        setLocal(reserva.tipo_reserva === 'auditorio' ? 'Auditório' : 'Local a definir');
      }
      
      setDataEvento(formatarDataHoraInicial());
      setCapacidade(
        reserva.quantidade_pessoas?.toString() || 
        reserva.sala_capacidade?.toString() || 
        ''
      );
    }
  }, [reserva]);

  // Carregar áreas de atuação da entidade
  React.useEffect(() => {
    const loadEntidadeAreas = async () => {
      try {
        const { data, error } = await supabase
          .from('entidades')
          .select('area_atuacao')
          .eq('id', entidadeId)
          .single();
        
        if (error) throw error;
        
        if (data?.area_atuacao && Array.isArray(data.area_atuacao)) {
          setSelectedAreas(data.area_atuacao);
        }
      } catch (err) {
        console.error('Erro ao carregar áreas da entidade:', err);
      }
    };

    loadEntidadeAreas();
  }, [entidadeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do evento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!descricao.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "A descrição do evento é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (!local.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O local do evento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validar data e hora
    if (!dataEvento.trim()) {
      setDateTimeError('Data e hora são obrigatórias');
      return;
    }

    const dateValidation = validateDateTime(dataEvento);
    if (!dateValidation.isValid) {
      setDateTimeError(dateValidation.message || 'Data inválida');
      return;
    }
    
    const dateTime = parseDateTime(dataEvento);
    if (!dateTime) {
      setDateTimeError('Erro ao processar data e hora');
      return;
    }

    const eventData = {
      nome,
      descricao,
      local,
      data_evento: dateTime.toISOString(),
      capacidade: capacidade ? parseInt(capacidade) : undefined,
      link_evento,
      area_atuacao: selectedAreas
    };

    try {
      const result = await createEvento(entidadeId, eventData);

      if (result.success && result.eventoId) {
        // Vincular a reserva ao evento criado
        const { error: updateError } = await supabase
          .from('reservas')
          .update({ evento_id: result.eventoId })
          .eq('id', reserva.id);

        if (updateError) {
          console.error('Erro ao vincular reserva ao evento:', updateError);
          toast({
            title: "Evento criado com aviso",
            description: "O evento foi criado, mas houve um erro ao vinculá-lo à reserva.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "✅ Evento criado com sucesso!",
            description: "O evento foi criado e vinculado à sua reserva.",
          });
        }
        
        // Abrir configuração do formulário de inscrição
        setEventoId(result.eventoId);
        setShowFormularioConfig(true);
      } else if (result.nameExists) {
        setPendingEventData(eventData);
        setShowNameWarning(true);
      } else {
        toast({
          title: "Erro ao criar evento",
          description: result.error || "Ocorreu um erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao criar evento:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o evento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleForceCreate = async () => {
    if (!pendingEventData) return;
    
    const result = await createEvento(entidadeId, pendingEventData, true);
    
    if (result.success && result.eventoId) {
      // Vincular a reserva ao evento criado
      const { error: updateError } = await supabase
        .from('reservas')
        .update({ evento_id: result.eventoId })
        .eq('id', reserva.id);

      if (updateError) {
        console.error('Erro ao vincular reserva ao evento:', updateError);
      }
      
      setShowNameWarning(false);
      setPendingEventData(null);
      toast({
        title: "✅ Evento criado com sucesso!",
        description: "O evento foi criado e vinculado à sua reserva.",
      });
      onSuccess?.();
    }
  };

  const addAreaAtuacao = (area: string) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const removeAreaAtuacao = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter(area => area !== areaToRemove));
  };

  const handleDateTimeChange = (value: string) => {
    setDataEvento(value);
    if (dateTimeError) {
      setDateTimeError('');
    }
  };

  return (
    <>
      <AlertDialog open={showNameWarning} onOpenChange={setShowNameWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Evento com nome duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um evento com o nome "{pendingEventData?.nome}" nesta entidade. 
              Deseja criar mesmo assim um segundo evento com o mesmo nome?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowNameWarning(false);
              setPendingEventData(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceCreate}>
              Criar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Criar Evento a partir da Reserva
          </DialogTitle>
          <DialogDescription>
            Os dados da reserva foram preenchidos automaticamente. Você pode editá-los conforme necessário.
          </DialogDescription>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ O evento será criado com status "pendente" e precisará ser aprovado pelo admin antes de aparecer publicamente na plataforma.
            </p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações da Reserva */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações da Reserva
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Tipo:</strong> {reserva.tipo_reserva === 'sala' ? 'Sala' : 'Auditório'}</p>
              <p><strong>Data:</strong> {format(new Date(reserva.data_reserva), 'dd/MM/yyyy')}</p>
              <p><strong>Horário:</strong> {reserva.horario_inicio} - {reserva.horario_termino}</p>
              <p><strong>Pessoas:</strong> {reserva.quantidade_pessoas}</p>
              {reserva.sala_nome && <p><strong>Sala:</strong> {reserva.sala_nome}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
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
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o evento, objetivos e o que os participantes podem esperar..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local" className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Local *
              </Label>
              <Input
                id="local"
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Auditório A, Online"
                required
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

          <DateTimeInput
            id="data-evento"
            label="Data e Hora do Evento"
            value={dataEvento}
            onChange={handleDateTimeChange}
            required
            error={dateTimeError}
            placeholder="Ex: 25/12/2024 14:30"
          />

          <div className="space-y-2">
            <Label htmlFor="link_evento">Link do Evento (opcional)</Label>
            <Input
              id="link_evento"
              type="url"
              value={link_evento}
              onChange={(e) => setLinkEvento(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area-atuacao" className="flex items-center">
              <Target className="mr-1 h-4 w-4" />
              Áreas de Atuação
            </Label>
            
            {/* Áreas disponíveis como checkboxes */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {AREAS_ATUACAO.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`area-${area}`}
                    checked={selectedAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addAreaAtuacao(area);
                      } else {
                        removeAreaAtuacao(area);
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor={`area-${area}`} className="text-sm text-gray-700">
                    {area}
                  </label>
                </div>
              ))}
            </div>

            {/* Áreas selecionadas como badges */}
            {selectedAreas.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Áreas selecionadas ({selectedAreas.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAreas.map((area) => (
                    <div
                      key={area}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeAreaAtuacao(area)}
                        className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                        title="Remover área"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Configuração do Formulário de Inscrição */}
      {showFormularioConfig && eventoId && (
        <div className="mt-8 pt-6 border-t">
          <ConfigurarFormularioInscricao
            eventoId={eventoId}
            entidadeId={entidadeId}
            capacidadeSala={capacidade ? parseInt(capacidade) : undefined}
            onSave={() => {
              setShowFormularioConfig(false);
              onSuccess?.();
            }}
          />
        </div>
      )}
    </>
  );
}

