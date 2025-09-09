import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTodasReservas } from '@/hooks/useReservas';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS, StatusReserva } from '@/types/reserva';
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
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ReservasHistoricasProps {
  onExport?: (reservas: ReservaDetalhada[]) => void;
}

const ReservaDetalhesModal: React.FC<{ reserva: ReservaDetalhada }> = ({ reserva }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {TIPO_RESERVA_LABELS[reserva.tipo_reserva]} - {reserva.nome_evento || 'Reserva'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Data da Reserva</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Horário</Label>
              <p className="text-sm text-muted-foreground">
                {reserva.horario_inicio} - {reserva.horario_termino}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Quantidade de Pessoas</Label>
              <p className="text-sm text-muted-foreground">{reserva.quantidade_pessoas}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={reserva.status === 'aprovada' ? 'default' : reserva.status === 'rejeitada' ? 'destructive' : 'secondary'}>
                {STATUS_LABELS[reserva.status]}
              </Badge>
            </div>
          </div>

          {/* Dados do Solicitante */}
          <div>
            <Label className="text-sm font-medium">Solicitante</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium">{reserva.nome_solicitante}</p>
                <p className="text-sm text-muted-foreground">{reserva.telefone_solicitante}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Entidade: {reserva.nome_entidade || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {/* Evento Relacionado */}
          {reserva.nome_evento && (
            <div>
              <Label className="text-sm font-medium">Evento Relacionado</Label>
              <p className="text-sm font-medium">{reserva.nome_evento}</p>
              {reserva.descricao_evento && (
                <p className="text-sm text-muted-foreground">{reserva.descricao_evento}</p>
              )}
            </div>
          )}

          {/* Detalhes Específicos */}
          <div className="space-y-4">
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

            {/* Comentário de Aprovação */}
            {reserva.comentario_aprovacao && (
              <div>
                <Label className="text-sm font-medium">Comentário de Aprovação</Label>
                <p className="text-sm text-muted-foreground">{reserva.comentario_aprovacao}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ReservasHistoricas: React.FC<ReservasHistoricasProps> = ({ onExport }) => {
  const [filters, setFilters] = useState<{
    status?: StatusReserva[];
    tipo_reserva?: string[];
    data_inicio?: string;
    data_fim?: string;
    nome_solicitante?: string;
  }>({});

  const { todasReservas, loading, error, refetch } = useTodasReservas(filters);

  // Filtrar reservas localmente para busca por nome
  const filteredReservas = useMemo(() => {
    if (!filters.nome_solicitante) return todasReservas;
    
    return todasReservas.filter(reserva => 
      reserva.nome_solicitante.toLowerCase().includes(filters.nome_solicitante!.toLowerCase())
    );
  }, [todasReservas, filters.nome_solicitante]);

  const handleStatusChange = (status: string) => {
    if (status === 'todos') {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        status: [status as StatusReserva] 
      }));
    }
  };

  const handleTipoChange = (tipo: string) => {
    if (tipo === 'todos') {
      setFilters(prev => ({ ...prev, tipo_reserva: undefined }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        tipo_reserva: [tipo] 
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const getStatusColor = (status: StatusReserva) => {
    switch (status) {
      case 'aprovada':
        return 'bg-green-100 text-green-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Reservas</h2>
          <p className="text-muted-foreground">
            {filteredReservas.length} reserva(s) encontrada(s)
          </p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button onClick={() => onExport(filteredReservas)} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status?.[0] || 'todos'} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filters.tipo_reserva?.[0] || 'todos'} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sala">Sala</SelectItem>
                  <SelectItem value="auditorio">Auditório</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filters.data_inicio || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, data_inicio: e.target.value || undefined }))}
              />
            </div>

            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filters.data_fim || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, data_fim: e.target.value || undefined }))}
              />
            </div>

            <div>
              <Label htmlFor="nome_solicitante">Solicitante</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome_solicitante"
                  placeholder="Buscar por nome..."
                  value={filters.nome_solicitante || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, nome_solicitante: e.target.value || undefined }))}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Reservas */}
      {filteredReservas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros para encontrar mais reservas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reserva.nome_evento || 'Reserva'}</p>
                        <p className="text-sm text-muted-foreground">
                          {reserva.quantidade_pessoas} pessoas
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reserva.nome_solicitante}</p>
                        <p className="text-sm text-muted-foreground">{reserva.telefone_solicitante}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TIPO_RESERVA_LABELS[reserva.tipo_reserva]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {reserva.horario_inicio} - {reserva.horario_termino}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reserva.status)}>
                        {STATUS_LABELS[reserva.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ReservaDetalhesModal reserva={reserva} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
