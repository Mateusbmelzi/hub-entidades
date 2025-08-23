import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Target } from 'lucide-react';
import { useUpdateEventoAsEntity } from '@/hooks/useUpdateEventoAsEntity';
import type { Evento } from '@/hooks/useEventosEntidade';
import { AREAS_ATUACAO } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { parseDateTime, validateDateTime, convertFromDateTimeLocal } from '@/lib/datetime-input-utils';

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
    // Converter a data do evento para formato brasileiro DD/MM/AAAA HH:MM
    const data = new Date(evento.data);
    const horario = evento.horario;
    if (horario) {
      const [horas, minutos] = horario.split(':');
      data.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    }
    
    const day = data.getDate().toString().padStart(2, '0');
    const month = (data.getMonth() + 1).toString().padStart(2, '0');
    const year = data.getFullYear().toString();
    const hour = data.getHours().toString().padStart(2, '0');
    const minute = data.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hour}:${minute}`;
  });
  const [capacidade, setCapacidade] = useState(evento.capacidade?.toString() || '');
  const [link_evento, setLinkevento] = useState(evento.link_evento || '');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(() => {
    // Inicializar com as áreas do evento ou da entidade
    if (evento.area_atuacao && Array.isArray(evento.area_atuacao)) {
      return evento.area_atuacao;
    }
    return [];
  });
  const [dateTimeError, setDateTimeError] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { updateEvento, loading } = useUpdateEventoAsEntity();

  // Carregar áreas de atuação da entidade se o evento não tiver áreas definidas
  useEffect(() => {
    const loadEntidadeAreas = async () => {
      if (selectedAreas.length > 0) return; // Já tem áreas definidas
      
      try {
        const { data, error } = await supabase
          .from('entidades')
          .select('area_atuacao')
          .eq('id', entidadeId)
          .single();
        
        if (error) throw error;
        
        // Presetar com as áreas da entidade
        if (data?.area_atuacao && Array.isArray(data.area_atuacao)) {
          setSelectedAreas(data.area_atuacao);
        }
      } catch (err) {
        console.error('Erro ao carregar áreas da entidade:', err);
      }
    };

    loadEntidadeAreas();
  }, [entidadeId, selectedAreas.length]);

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
    // Limpar erro quando usuário começar a digitar
    if (dateTimeError) {
      setDateTimeError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar mensagens de erro anteriores
    setErrorMessage(null);
    setDateTimeError('');
    
    console.log('🔄 Submetendo formulário de edição de evento...');
    console.log('📝 Dados do formulário:', {
      nome,
      descricao,
      link_evento,
      local,
      capacidade,
      dataEvento,
      selectedAreas
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

    // Validar data e hora usando nosso utilitário
    const dateValidation = validateDateTime(dataEvento);
    if (!dateValidation.isValid) {
      setDateTimeError(dateValidation.message || 'Data inválida');
      return;
    }

    // Converter para Date e extrair dados
    let dataStr: string | undefined;
    let horarioStr: string | undefined;

    try {
      const dateTime = parseDateTime(dataEvento);
      if (!dateTime) {
        throw new Error('Erro ao processar data e hora');
      }
      
      // Extrair data no formato YYYY-MM-DD
      dataStr = dateTime.toISOString().slice(0, 10);
      
      // Extrair horário no formato HH:mm:ss
      const horas = dateTime.getHours().toString().padStart(2, '0');
      const minutos = dateTime.getMinutes().toString().padStart(2, '0');
      const segundos = dateTime.getSeconds().toString().padStart(2, '0');
      horarioStr = `${horas}:${minutos}:${segundos}`;
      
      console.log('📅 Data processada:', { dataStr, horarioStr });
      console.log('📅 Data original:', dateTime.toISOString());
      console.log('📅 Data local:', dateTime.toLocaleString('pt-BR'));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Data inválida';
      setDateTimeError(errorMsg);
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
      area_atuacao: selectedAreas,
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
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
