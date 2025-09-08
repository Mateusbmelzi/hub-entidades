import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReservasPendentes } from '@/hooks/useReservas';
import { useAprovarReservas } from '@/hooks/useAprovarReservas';
import { ReservasFilters, ReservasFilters as ReservasFiltersType } from '@/components/ReservasFilters';
import { ExportReservasButton } from '@/components/ExportReservasButton';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
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
  Wrench
} from 'lucide-react';

interface ReservaCardProps {
  reserva: ReservaDetalhada;
  onAprovar: (id: string, comentario?: string, local?: string) => void;
  onRejeitar: (id: string, comentario: string) => void;
  loading: boolean;
}

const ReservaCard: React.FC<ReservaCardProps> = ({ reserva, onAprovar, onRejeitar, loading }) => {
  const [comentario, setComentario] = useState('');
  const [local, setLocal] = useState(reserva.tipo_reserva === 'auditorio' ? 'Auditório Steffi e Max Perlaman' : '');
  const [showDetails, setShowDetails] = useState(false);

  const handleAprovar = () => {
    if (reserva.tipo_reserva === 'sala' && !local.trim()) {
      alert('Por favor, informe o nome da sala.');
      return;
    }
    onAprovar(reserva.reserva_id, comentario, local);
    setComentario('');
    setLocal(reserva.tipo_reserva === 'auditorio' ? 'Auditório Steffi e Max Perlaman' : '');
  };

  const handleRejeitar = () => {
    if (!comentario.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    onRejeitar(reserva.reserva_id, comentario);
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
            <span className="text-sm">{new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}</span>
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
            {showDetails ? 'Ocultar' : 'Ver'} Detalhes
          </Button>

          {showDetails && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
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
                </div>
              )}

              {/* Necessidade de Sala Plana */}
              {reserva.necessidade_sala_plana && (
                <div>
                  <Label className="text-sm font-medium">Necessidade de Sala Plana</Label>
                  <p className="text-sm text-muted-foreground">{reserva.motivo_sala_plana}</p>
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
          <div>
            <Label htmlFor={`local-${reserva.reserva_id}`}>
              Nome da {reserva.tipo_reserva === 'sala' ? 'Sala *' : 'Auditório'}
            </Label>
            <Input
              id={`local-${reserva.reserva_id}`}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder={`Ex: ${reserva.tipo_reserva === 'sala' ? 'Sala 101, Laboratório de Informática' : 'Auditório Steffi e Max Perlaman'}`}
              className="mb-3"
            />
          </div>
          
          <div>
            <Label htmlFor={`comentario-${reserva.reserva_id}`}>Comentário (opcional)</Label>
            <Textarea
              id={`comentario-${reserva.reserva_id}`}
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
  const { reservasPendentes, loading, error, refetch } = useReservasPendentes();
  const { aprovarReserva, rejeitarReserva, loading: actionLoading } = useAprovarReservas();
  const [filters, setFilters] = useState<ReservasFiltersType>({});

  // Filtrar reservas baseado nos filtros aplicados
  const filteredReservas = useMemo(() => {
    return reservasPendentes.filter(reserva => {
      // Filtro por status
      if (filters.status?.length && !filters.status.includes(reserva.status)) {
        return false;
      }

      // Filtro por tipo de reserva
      if (filters.tipo_reserva?.length && !filters.tipo_reserva.includes(reserva.tipo_reserva)) {
        return false;
      }

      // Filtro por data de início
      if (filters.data_inicio && new Date(reserva.data_reserva) < new Date(filters.data_inicio)) {
        return false;
      }

      // Filtro por data de fim
      if (filters.data_fim && new Date(reserva.data_reserva) > new Date(filters.data_fim)) {
        return false;
      }

      // Filtro por nome do solicitante
      if (filters.nome_solicitante && 
          !reserva.nome_solicitante.toLowerCase().includes(filters.nome_solicitante.toLowerCase())) {
        return false;
      }

      // Filtro por nome do evento
      if (filters.nome_evento && 
          reserva.nome_evento && 
          !reserva.nome_evento.toLowerCase().includes(filters.nome_evento.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [reservasPendentes, filters]);

  const handleFiltersChange = (newFilters: ReservasFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAprovar = async (reservaId: string, comentario?: string, local?: string) => {
    const success = await aprovarReserva(reservaId, comentario, local);
    if (success) {
      refetch();
    }
  };

  const handleRejeitar = async (reservaId: string, comentario: string) => {
    const success = await rejeitarReserva(reservaId, comentario);
    if (success) {
      refetch();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Aprovação de Reservas</h2>
          <p className="text-muted-foreground">
            {filteredReservas.length} de {reservasPendentes.length} reserva(s) aguardando aprovação
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Filtros */}
      <ReservasFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalCount={reservasPendentes.length}
        filteredCount={filteredReservas.length}
      />

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
          {filteredReservas.map((reserva) => (
            <ReservaCard
              key={reserva.reserva_id}
              reserva={reserva}
              onAprovar={handleAprovar}
              onRejeitar={handleRejeitar}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
