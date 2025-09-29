import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReservasPendentes } from '@/hooks/useReservas';
import { useEntidadesLista } from '@/hooks/useEntidadesLista';
import { useAprovarReservas } from '@/hooks/useAprovarReservas';
import { useSalas } from '@/hooks/useSalas';
import { ExportReservasButton } from '@/components/ExportReservasButton';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Eye,
  Building,
  FileText,
  Mic,
  Video,
  Lightbulb,
  Settings,
  Camera,
  Utensils,
  Shield,
  Key,
  Sparkles,
  Wrench,
  CheckSquare,
  Square,
  Check,
  Filter
} from 'lucide-react';

interface ReservaCardProps {
  reserva: ReservaDetalhada;
  onAprovar: (id: string, comentario?: string, local?: string, salaId?: number) => void;
  onRejeitar: (id: string, comentario: string) => void;
  loading: boolean;
  salasDisponiveis: any[];
  salaAuditorio?: any;
}

const ReservaCard: React.FC<ReservaCardProps> = ({ reserva, onAprovar, onRejeitar, loading, salasDisponiveis, salaAuditorio }) => {
  const [comentario, setComentario] = useState('');
  const [local, setLocal] = useState(reserva.tipo_reserva === 'auditorio' ? 'Auditório Steffi e Max Perlaman' : '');
  const [salaSelecionada, setSalaSelecionada] = useState<number | undefined>(reserva.sala_id || undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [filtroPredio, setFiltroPredio] = useState<string>('');
  const [filtroAndar, setFiltroAndar] = useState<string>('');

  // Debug log para verificar o estado
  console.log('🔍 ReservaCard renderizado para reserva:', reserva.id, 'showDetails:', showDetails);

  // Filtrar salas baseado nos filtros
  const salasFiltradas = salasDisponiveis.filter(sala => {
    const predioMatch = !filtroPredio || filtroPredio === 'todos' || sala.predio === filtroPredio;
    const andarMatch = !filtroAndar || filtroAndar === 'todos' || sala.andar === filtroAndar;
    return predioMatch && andarMatch;
  });

  // Obter lista única de prédios e andares
  const prediosUnicos = [...new Set(salasDisponiveis.map(sala => sala.predio))].sort();
  const andaresUnicos = [...new Set(salasDisponiveis.map(sala => sala.andar))].sort();

  // Atualizar sala selecionada quando a reserva mudar
  useEffect(() => {
    setSalaSelecionada(reserva.sala_id || undefined);
  }, [reserva.sala_id]);

  // Resetar sala selecionada quando filtros mudarem (apenas se não há sala pré-selecionada)
  useEffect(() => {
    if (!reserva.sala_id) {
    setSalaSelecionada(undefined);
    }
  }, [filtroPredio, filtroAndar, reserva.sala_id]);

  const handleAprovar = () => {
    if (reserva.tipo_reserva === 'sala' && !salaSelecionada && !reserva.sala_id) {
      alert('Por favor, selecione uma sala.');
      return;
    }
    
    // Para auditório, usar a sala do auditório automaticamente
    // Para sala, usar a sala selecionada pelo admin ou a sala escolhida pela entidade
    const salaId = reserva.tipo_reserva === 'auditorio' 
      ? salaAuditorio?.id 
      : (salaSelecionada || reserva.sala_id);
    
    const localFinal = reserva.tipo_reserva === 'auditorio' ? 
      `${salaAuditorio?.sala} - ${salaAuditorio?.predio} (${salaAuditorio?.andar})` : 
      local;
    
    onAprovar(reserva.id, comentario, localFinal, salaId);
    setComentario('');
    setLocal(reserva.tipo_reserva === 'auditorio' ? 'Auditório Steffi e Max Perlaman' : '');
    setSalaSelecionada(undefined);
  };

  const handleRejeitar = () => {
    if (!comentario.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    onRejeitar(reserva.id, comentario);
    setComentario('');
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {TIPO_RESERVA_LABELS[reserva.tipo_reserva]}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Solicitado por: {reserva.nome_solicitante}
            </p>
          </div>
          <Badge variant="outline">{STATUS_LABELS[reserva.status]}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{reserva.horario_inicio} - {reserva.horario_termino}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{reserva.quantidade_pessoas} pessoas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium">Solicitante</Label>
            <p className="text-sm text-muted-foreground">{reserva.nome_solicitante}</p>
            <p className="text-sm text-muted-foreground">{reserva.telefone_solicitante}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Entidade</Label>
            <p className="text-sm text-muted-foreground">{reserva.nome_entidade || 'Não informado'}</p>
          </div>
        </div>

        {reserva.nome_evento && (
          <div className="mb-4">
            <Label className="text-sm font-medium">Evento Relacionado</Label>
            <p className="text-sm font-medium">{reserva.nome_evento}</p>
            {reserva.descricao_evento && (
              <p className="text-sm text-muted-foreground">{reserva.descricao_evento}</p>
            )}
          </div>
        )}

        {/* Detalhes específicos do tipo de reserva */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="mb-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? 'Ocultar' : 'Ver'} Detalhes Completos
          </Button>

          {showDetails && (
            <div className="space-y-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              
              {/* Motivo da Reserva */}
              {reserva.motivo_reserva && (
                <div>
                  <Label className="text-sm font-medium">Motivo da Reserva</Label>
                  <p className="text-sm text-muted-foreground">{reserva.motivo_reserva}</p>
                </div>
              )}

              {/* Título do Evento de Capacitação */}
              {reserva.titulo_evento_capacitacao && (
                <div>
                  <Label className="text-sm font-medium">Título do Evento de Capacitação</Label>
                  <p className="text-sm text-muted-foreground">{reserva.titulo_evento_capacitacao}</p>
                </div>
              )}

              {/* Descrição das Pautas do Evento */}
              {reserva.descricao_pautas_evento_capacitacao && (
                <div>
                  <Label className="text-sm font-medium">Descrição das Pautas do Evento</Label>
                  <p className="text-sm text-muted-foreground">{reserva.descricao_pautas_evento_capacitacao}</p>
                </div>
              )}

              {/* Descrição da Programação do Evento */}
              {reserva.descricao_programacao_evento && (
                <div>
                  <Label className="text-sm font-medium">Descrição da Programação do Evento</Label>
                  <p className="text-sm text-muted-foreground">{reserva.descricao_programacao_evento}</p>
                </div>
              )}

              {/* Palestrante Externo */}
              {reserva.tem_palestrante_externo && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Palestrante Externo
                  </Label>
                  <p className="text-sm">{reserva.nome_palestrante_externo}</p>
                  {reserva.apresentacao_palestrante_externo && (
                    <p className="text-sm text-muted-foreground">{reserva.apresentacao_palestrante_externo}</p>
                  )}
                  {reserva.eh_pessoa_publica && (
                    <Badge variant="secondary" className="mt-1">Pessoa Pública</Badge>
                  )}
                </div>
              )}

              {/* Apoio Externo */}
              {reserva.ha_apoio_externo && (
                <div>
                  <Label className="text-sm font-medium">Apoio Externo</Label>
                  <p className="text-sm text-muted-foreground">Nome da Empresa: {reserva.nome_empresa_parceira}</p>
                  <p className="text-sm text-muted-foreground">Como ajudará: {reserva.como_ajudara_organizacao}</p>
                </div>
              )}

              {/* Necessidade de Sala Plana */}
              {reserva.necessidade_sala_plana && (
                <div>
                  <Label className="text-sm font-medium">Necessidade de Sala Plana</Label>
                  <p className="text-sm text-muted-foreground">{reserva.motivo_sala_plana}</p>
                </div>
              )}

              {/* Equipamentos para Auditório */}
              {reserva.tipo_reserva === 'auditorio' && (
                <div>
                  <Label className="text-sm font-medium">Equipamentos Solicitados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reserva.precisa_sistema_som && <Badge variant="outline"><Mic className="h-3 w-3 mr-1" />Som</Badge>}
                    {reserva.precisa_projetor && <Badge variant="outline"><Video className="h-3 w-3 mr-1" />Projetor</Badge>}
                    {reserva.precisa_iluminacao_especial && <Badge variant="outline"><Lightbulb className="h-3 w-3 mr-1" />Iluminação</Badge>}
                    {reserva.precisa_montagem_palco && <Badge variant="outline"><Settings className="h-3 w-3 mr-1" />Palco</Badge>}
                    {reserva.precisa_gravacao && <Badge variant="outline"><Camera className="h-3 w-3 mr-1" />Gravação</Badge>}
                    {reserva.precisa_alimentacao && <Badge variant="outline"><Utensils className="h-3 w-3 mr-1" />Alimentação</Badge>}
                    {reserva.precisa_seguranca && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Segurança</Badge>}
                    {reserva.precisa_controle_acesso && <Badge variant="outline"><Key className="h-3 w-3 mr-1" />Controle Acesso</Badge>}
                    {reserva.precisa_limpeza_especial && <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" />Limpeza</Badge>}
                    {reserva.precisa_manutencao && <Badge variant="outline"><Wrench className="h-3 w-3 mr-1" />Manutenção</Badge>}
                  </div>
                  
                  {/* Detalhes específicos dos equipamentos */}
                  {reserva.motivo_gravacao && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Motivo da Gravação</Label>
                      <p className="text-sm text-muted-foreground">{reserva.motivo_gravacao}</p>
                    </div>
                  )}
                  
                  {reserva.equipamentos_adicionais && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Equipamentos Adicionais</Label>
                      <p className="text-sm text-muted-foreground">{reserva.equipamentos_adicionais}</p>
                    </div>
                  )}
                  
                  {reserva.precisa_suporte_tecnico && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Suporte Técnico</Label>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_suporte_tecnico}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Configuração da Sala */}
              {reserva.configuracao_sala && (
                <div>
                  <Label className="text-sm font-medium">Configuração da Sala</Label>
                  <p className="text-sm text-muted-foreground">{reserva.configuracao_sala}</p>
                  {reserva.motivo_configuracao_sala && (
                    <p className="text-sm text-muted-foreground">Motivo: {reserva.motivo_configuracao_sala}</p>
                  )}
                </div>
              )}

              {/* Alimentação */}
              {reserva.precisa_alimentacao && (
                <div>
                  <Label className="text-sm font-medium">Alimentação</Label>
                  <p className="text-sm text-muted-foreground">{reserva.detalhes_alimentacao}</p>
                  {reserva.custo_estimado_alimentacao && (
                    <p className="text-sm text-muted-foreground">Custo estimado: R$ {reserva.custo_estimado_alimentacao}</p>
                  )}
                </div>
              )}

              {/* Segurança */}
              {reserva.precisa_seguranca && (
                <div>
                  <Label className="text-sm font-medium">Segurança</Label>
                  <p className="text-sm text-muted-foreground">{reserva.detalhes_seguranca}</p>
                </div>
              )}

              {/* Controle de Acesso */}
              {reserva.precisa_controle_acesso && (
                <div>
                  <Label className="text-sm font-medium">Controle de Acesso</Label>
                  <p className="text-sm text-muted-foreground">{reserva.detalhes_controle_acesso}</p>
                </div>
              )}

              {/* Limpeza Especial */}
              {reserva.precisa_limpeza_especial && (
                <div>
                  <Label className="text-sm font-medium">Limpeza Especial</Label>
                  <p className="text-sm text-muted-foreground">{reserva.detalhes_limpeza_especial}</p>
                </div>
              )}

              {/* Manutenção */}
              {reserva.precisa_manutencao && (
                <div>
                  <Label className="text-sm font-medium">Manutenção</Label>
                  <p className="text-sm text-muted-foreground">{reserva.detalhes_manutencao}</p>
                </div>
              )}

              {/* Observações */}
              {reserva.observacoes && (
                <div>
                  <Label className="text-sm font-medium">Observações</Label>
                  <p className="text-sm text-muted-foreground">{reserva.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações de aprovação */}
        <div className="space-y-3">
          {reserva.tipo_reserva === 'sala' ? (
            <div>
              {/* Sala selecionada pela entidade */}
              {reserva.sala_id && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-green-900">✓ Sala Pré-selecionada pela Entidade</Label>
                  <p className="text-sm text-green-700 mt-1">
                    A sala escolhida pela entidade já está selecionada abaixo. Você pode alterar se necessário.
                  </p>
                </div>
              )}
              
              <Label htmlFor={`sala-${reserva.id}`}>
                {reserva.sala_id ? 'Alterar Sala (opcional)' : 'Selecionar Sala *'}
              </Label>
              
              {/* Filtros para salas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor={`predio-${reserva.id}`} className="text-xs text-muted-foreground">
                    Filtrar por Prédio
                  </Label>
                  <Select
                    value={filtroPredio}
                    onValueChange={setFiltroPredio}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os prédios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os prédios</SelectItem>
                      {prediosUnicos.map((predio) => (
                        <SelectItem key={predio} value={predio}>
                          {predio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`andar-${reserva.id}`} className="text-xs text-muted-foreground">
                    Filtrar por Andar
                  </Label>
                  <Select
                    value={filtroAndar}
                    onValueChange={setFiltroAndar}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os andares" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os andares</SelectItem>
                      {andaresUnicos.map((andar) => (
                        <SelectItem key={andar} value={andar}>
                          {andar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seleção de sala */}
              <Select
                value={salaSelecionada?.toString() || ''}
                onValueChange={(value) => setSalaSelecionada(parseInt(value))}
              >
                <SelectTrigger className="mb-3">
                  <SelectValue placeholder="Escolha uma sala disponível..." />
                </SelectTrigger>
                <SelectContent>
                  {salasFiltradas.map((sala) => (
                    <SelectItem key={sala.id} value={sala.id.toString()}>
                      {sala.sala} - {sala.predio} ({sala.andar}) - {sala.capacidade} pessoas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Informações sobre filtros */}
              <div className="text-xs text-muted-foreground mb-3">
                {salasFiltradas.length > 0 ? (
                  <span>
                    Mostrando {salasFiltradas.length} de {salasDisponiveis.length} salas disponíveis
                    {filtroPredio && ` no ${filtroPredio}`}
                    {filtroAndar && ` no ${filtroAndar}`}
                  </span>
                ) : salasDisponiveis.length === 0 ? (
                  <span>Nenhuma sala disponível com capacidade para {reserva.quantidade_pessoas} pessoas.</span>
                ) : (
                  <span>Nenhuma sala encontrada com os filtros aplicados. Tente ajustar os filtros.</span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium">Sala do Auditório</Label>
              {salaAuditorio ? (
                <div className="p-3 bg-gray-50 rounded-md border mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{salaAuditorio.sala}</p>
                      <p className="text-sm text-muted-foreground">
                        {salaAuditorio.predio} ({salaAuditorio.andar}) - {salaAuditorio.capacidade} pessoas
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 rounded-md border mb-3">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Sala do auditório não encontrada. Verifique se existe uma sala com "Auditório" e "Steffi" no nome.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div>
            <Label htmlFor={`comentario-${reserva.id}`}>Comentário (opcional)</Label>
            <Textarea
              id={`comentario-${reserva.id}`}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Adicione um comentário sobre a aprovação..."
              rows={2}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAprovar}
              disabled={loading}
              className="flex-1"
              variant="default"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            <Button
              onClick={handleRejeitar}
              disabled={loading}
              className="flex-1"
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardAprovacaoReservas: React.FC = () => {
  const [filtroEntidade, setFiltroEntidade] = useState<number | undefined>(undefined);
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [reservasSelecionadas, setReservasSelecionadas] = useState<Set<string>>(new Set());
  const [modoSelecao, setModoSelecao] = useState(false);
  const [comentarioLote, setComentarioLote] = useState('');
  const [localLote, setLocalLote] = useState('');
  const [salaLote, setSalaLote] = useState<number | undefined>(undefined);
  
  const { reservasPendentes, loading, error, refetch } = useReservasPendentes(filtroEntidade);
  const { entidades, loading: entidadesLoading } = useEntidadesLista();
  const { aprovarReserva, rejeitarReserva, loading: actionLoading } = useAprovarReservas();
  const { salas, getSalasDisponiveis, getSalaAuditorio, loading: salasLoading, error: salasError } = useSalas();

  // Debug logs
  console.log('🔍 DashboardAprovacaoReservas - Estado das salas:', {
    salas: salas.length,
    loading: salasLoading,
    error: salasError
  });

  // Funções para gerenciar seleção múltipla
  const toggleSelecaoReserva = (reservaId: string) => {
    setReservasSelecionadas(prev => {
      const novo = new Set(prev);
      if (novo.has(reservaId)) {
        novo.delete(reservaId);
      } else {
        novo.add(reservaId);
      }
      return novo;
    });
  };

  const selecionarTodas = () => {
    setReservasSelecionadas(new Set(filteredReservas.map(r => r.id)));
  };

  const deselecionarTodas = () => {
    setReservasSelecionadas(new Set());
  };

  const toggleModoSelecao = () => {
    setModoSelecao(!modoSelecao);
    if (modoSelecao) {
      setReservasSelecionadas(new Set());
    }
  };

  // Funções para ações em lote
  const handleAprovarLote = async () => {
    if (reservasSelecionadas.size === 0) return;

    const reservasParaAprovar = filteredReservas.filter(r => reservasSelecionadas.has(r.id));
    
    for (const reserva of reservasParaAprovar) {
      try {
        await aprovarReserva(
          reserva.id,
          comentarioLote || undefined,
          localLote || undefined,
          salaLote || reserva.sala_id || undefined
        );
      } catch (error) {
        console.error(`Erro ao aprovar reserva ${reserva.id}:`, error);
      }
    }

    setReservasSelecionadas(new Set());
    setComentarioLote('');
    setLocalLote('');
    setSalaLote(undefined);
    refetch();
  };

  const handleRejeitarLote = async () => {
    if (reservasSelecionadas.size === 0) return;

    const reservasParaRejeitar = filteredReservas.filter(r => reservasSelecionadas.has(r.id));
    
    for (const reserva of reservasParaRejeitar) {
      try {
        await rejeitarReserva(reserva.id, comentarioLote);
      } catch (error) {
        console.error(`Erro ao rejeitar reserva ${reserva.id}:`, error);
      }
    }

    setReservasSelecionadas(new Set());
    setComentarioLote('');
    refetch();
  };

  // Filtrar reservas baseado nos filtros aplicados
  const filteredReservas = useMemo(() => {
    return reservasPendentes.filter(reserva => {
      // Filtro por nome do solicitante
      if (filtroSolicitante && 
          !reserva.nome_solicitante.toLowerCase().includes(filtroSolicitante.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [reservasPendentes, filtroSolicitante]);


  const verificarConflitoReserva = async (reservaId: string, salaIdSelecionada?: number) => {
    try {
      // Buscar a reserva que está sendo aprovada
      const { data: reservaAtual, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservaId)
        .single();

      if (reservaError) {
        console.error('Erro ao buscar reserva:', reservaError);
        return { temConflito: false, conflitos: [] };
      }

      // Para auditório: verificar conflitos apenas com outras reservas de auditório
      // Para salas: verificar conflitos apenas com reservas na mesma sala específica
      let query = supabase
        .from('reservas')
        .select('*')
        .eq('status', 'aprovada')
        .eq('tipo_reserva', reservaAtual.tipo_reserva)
        .eq('data_reserva', reservaAtual.data_reserva)
        .neq('id', reservaId); // Excluir a própria reserva

      // Se for reserva de sala e uma sala foi selecionada, filtrar por essa sala
      if (reservaAtual.tipo_reserva === 'sala' && salaIdSelecionada) {
        query = query.eq('sala_id', salaIdSelecionada);
      }

      const { data: reservasConflitantes, error: conflitoError } = await query;

      if (conflitoError) {
        console.error('Erro ao verificar conflitos:', conflitoError);
        return { temConflito: false, conflitos: [] };
      }

      // Verificar se há sobreposição de horários
      const conflitos = reservasConflitantes.filter(reserva => {
        const inicioAtual = new Date(`${reservaAtual.data_reserva}T${reservaAtual.horario_inicio}`);
        const fimAtual = new Date(`${reservaAtual.data_reserva}T${reservaAtual.horario_termino}`);
        const inicioExistente = new Date(`${reserva.data_reserva}T${reserva.horario_inicio}`);
        const fimExistente = new Date(`${reserva.data_reserva}T${reserva.horario_termino}`);

        // Verificar se há sobreposição de horários
        return (inicioAtual < fimExistente && fimAtual > inicioExistente);
      });

      return {
        temConflito: conflitos.length > 0,
        conflitos: conflitos
      };
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
      return { temConflito: false, conflitos: [] };
    }
  };

  const handleAprovar = async (reservaId: string, comentario?: string, local?: string, salaId?: number) => {
    try {
      // Verificar conflitos antes de aprovar
      const { temConflito, conflitos } = await verificarConflitoReserva(reservaId, salaId);
      
      if (temConflito) {
        const conflitosInfo = conflitos.map(c => 
          `• ${c.nome_solicitante} - ${c.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala'} (${c.horario_inicio} - ${c.horario_termino})`
        ).join('\n');
        
        const confirmacao = window.confirm(
          `⚠️ CONFLITO DETECTADO!\n\n` +
          `Já existe uma reserva aprovada no mesmo horário e local:\n\n` +
          `${conflitosInfo}\n\n` +
          `Deseja mesmo aprovar esta reserva? Isso pode causar conflitos de agendamento.`
        );
        
        if (!confirmacao) {
          return; // Cancelar aprovação
        }
      }

      const success = await aprovarReserva(reservaId, comentario, local, salaId);
      if (success) {
        refetch();
      }
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
    }
  };

  const handleRejeitar = async (reservaId: string, comentario: string) => {
    const success = await rejeitarReserva(reservaId, comentario);
    if (success) {
      refetch();
    }
  };

  // Função para verificar e corrigir reservas aprovadas sem eventos
  const verificarReservasAprovadasSemEventos = async () => {
    try {
      console.log('🔍 Verificando reservas aprovadas sem eventos...');
      
      const { data: reservasAprovadas, error } = await supabase
        .from('reservas')
        .select('id, nome_solicitante, evento_id')
        .eq('status', 'aprovada')
        .is('evento_id', null);

      if (error) {
        console.error('❌ Erro ao buscar reservas aprovadas:', error);
        return;
      }

      if (reservasAprovadas && reservasAprovadas.length > 0) {
        console.log(`⚠️ Encontradas ${reservasAprovadas.length} reservas aprovadas sem eventos:`, reservasAprovadas);
        
        // Reverter essas reservas para pendente
        for (const reserva of reservasAprovadas) {
          console.log(`🔄 Revertendo reserva ${reserva.id} (${reserva.nome_solicitante})...`);
          
          const { error: updateError } = await supabase
            .from('reservas')
            .update({
              status: 'pendente',
              comentario_aprovacao: null,
              data_aprovacao: null,
              aprovador_email: null
            })
            .eq('id', reserva.id);
          
          if (updateError) {
            console.error(`❌ Erro ao reverter reserva ${reserva.id}:`, updateError);
          } else {
            console.log(`✅ Reserva ${reserva.id} revertida para pendente`);
          }
        }
        
        // Recarregar dados
        refetch();
      } else {
        console.log('✅ Todas as reservas aprovadas têm eventos associados');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar reservas aprovadas:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (salasError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar salas: {salasError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Aprovação de Reservas</h2>
          <p className="text-muted-foreground">
            {filteredReservas.length} de {reservasPendentes.length} reserva(s) aguardando aprovação
            {filtroEntidade && ` (filtrado por entidade)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={verificarReservasAprovadasSemEventos} 
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Corrigir Reservas
          </Button>
          <Button 
            onClick={toggleModoSelecao} 
            variant={modoSelecao ? "default" : "outline"}
            size="sm"
          >
            {modoSelecao ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
            {modoSelecao ? 'Sair da Seleção' : 'Seleção Múltipla'}
          </Button>
          <ExportReservasButton 
            reservas={filteredReservas}
            variant="outline"
            size="sm"
          />
          <Button onClick={refetch} variant="outline">
            Atualizar
          </Button>
        </div>
      </div>


      {/* Controles de seleção múltipla */}
      {modoSelecao && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {reservasSelecionadas.size} de {filteredReservas.length} reserva(s) selecionada(s)
                </span>
                <div className="flex gap-2">
                  <Button 
                    onClick={selecionarTodas} 
                    variant="outline" 
                    size="sm"
                    disabled={reservasSelecionadas.size === filteredReservas.length}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Selecionar Todas
                  </Button>
                  <Button 
                    onClick={deselecionarTodas} 
                    variant="outline" 
                    size="sm"
                    disabled={reservasSelecionadas.size === 0}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Deselecionar Todas
                  </Button>
                </div>
              </div>
            </div>

            {reservasSelecionadas.size > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="comentario-lote">Comentário (opcional)</Label>
                    <Textarea
                      id="comentario-lote"
                      placeholder="Comentário para todas as reservas..."
                      value={comentarioLote}
                      onChange={(e) => setComentarioLote(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="local-lote">Local (opcional)</Label>
                    <Input
                      id="local-lote"
                      placeholder="Local para todas as reservas..."
                      value={localLote}
                      onChange={(e) => setLocalLote(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sala-lote">Sala (opcional)</Label>
                    <Select 
                      value={salaLote?.toString() || ''} 
                      onValueChange={(value) => setSalaLote(value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma sala..." />
                      </SelectTrigger>
                      <SelectContent>
                        {salas.map((sala) => (
                          <SelectItem key={sala.id} value={sala.id.toString()}>
                            {sala.sala} - {sala.predio} ({sala.andar}) - {sala.capacidade} pessoas
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAprovarLote} 
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Selecionadas ({reservasSelecionadas.size})
                  </Button>
                  <Button 
                    onClick={handleRejeitarLote} 
                    variant="destructive"
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar Selecionadas ({reservasSelecionadas.size})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredReservas.length} de {reservasPendentes.length} reserva(s)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filtro-entidade">Filtrar por Entidade</Label>
              <Select 
                value={filtroEntidade?.toString() || 'todas'} 
                onValueChange={(value) => setFiltroEntidade(value === 'todas' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as entidades</SelectItem>
                  {entidades.map((entidade) => (
                    <SelectItem key={entidade.id} value={entidade.id.toString()}>
                      {entidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtro-solicitante">Filtrar por Solicitante</Label>
              <Input
                id="filtro-solicitante"
                placeholder="Nome do solicitante..."
                value={filtroSolicitante}
                onChange={(e) => setFiltroSolicitante(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredReservas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {reservasPendentes.length === 0 ? 'Nenhuma reserva pendente' : 'Nenhuma reserva encontrada'}
            </h3>
            <p className="text-muted-foreground text-center">
              {reservasPendentes.length === 0 
                ? 'Todas as reservas foram processadas. Verifique novamente mais tarde.'
                : 'Tente ajustar os filtros para encontrar mais reservas.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
        {filteredReservas.map((reserva) => {
          const salasDisponiveis = reserva.tipo_reserva === 'sala' 
            ? getSalasDisponiveis(reserva.quantidade_pessoas)
            : [];
          const salaAuditorio = reserva.tipo_reserva === 'auditorio' 
            ? getSalaAuditorio()
            : undefined;
          
          return (
            <div key={reserva.id} className="relative">
              {modoSelecao && (
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={reservasSelecionadas.has(reserva.id)}
                    onCheckedChange={() => toggleSelecaoReserva(reserva.id)}
                    className="h-5 w-5"
                  />
                </div>
              )}
              <div className={modoSelecao ? "ml-8" : ""}>
            <ReservaCard
              reserva={reserva}
              onAprovar={handleAprovar}
              onRejeitar={handleRejeitar}
              loading={actionLoading}
              salasDisponiveis={salasDisponiveis}
              salaAuditorio={salaAuditorio}
            />
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
