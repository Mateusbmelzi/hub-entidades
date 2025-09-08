import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, X, Search } from 'lucide-react';
import { StatusReserva, TipoReserva, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';

export interface ReservasFilters {
  status?: StatusReserva[];
  tipo_reserva?: TipoReserva[];
  data_inicio?: string;
  data_fim?: string;
  nome_solicitante?: string;
  nome_evento?: string;
}

interface ReservasFiltersProps {
  filters: ReservasFilters;
  onFiltersChange: (filters: ReservasFilters) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const ReservasFilters: React.FC<ReservasFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof ReservasFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleStatus = (status: StatusReserva) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    updateFilter('status', newStatus.length > 0 ? newStatus : undefined);
  };

  const toggleTipoReserva = (tipo: TipoReserva) => {
    const currentTipo = filters.tipo_reserva || [];
    const newTipo = currentTipo.includes(tipo)
      ? currentTipo.filter(t => t !== tipo)
      : [...currentTipo, tipo];
    updateFilter('tipo_reserva', newTipo.length > 0 ? newTipo : undefined);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status?.length ||
      filters.tipo_reserva?.length ||
      filters.data_inicio ||
      filters.data_fim ||
      filters.nome_solicitante ||
      filters.nome_evento
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.tipo_reserva?.length) count += filters.tipo_reserva.length;
    if (filters.data_inicio) count += 1;
    if (filters.data_fim) count += 1;
    if (filters.nome_solicitante) count += 1;
    if (filters.nome_evento) count += 1;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredCount} de {totalCount} reservas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Filtros de Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status as StatusReserva) || false}
                    onCheckedChange={() => toggleStatus(status as StatusReserva)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros de Tipo de Reserva */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Reserva</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TIPO_RESERVA_LABELS).map(([tipo, label]) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${tipo}`}
                    checked={filters.tipo_reserva?.includes(tipo as TipoReserva) || false}
                    onCheckedChange={() => toggleTipoReserva(tipo as TipoReserva)}
                  />
                  <Label
                    htmlFor={`tipo-${tipo}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio" className="text-sm font-medium">
                Data de Início
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data_inicio"
                  type="date"
                  value={filters.data_inicio || ''}
                  onChange={(e) => updateFilter('data_inicio', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim" className="text-sm font-medium">
                Data de Fim
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data_fim"
                  type="date"
                  value={filters.data_fim || ''}
                  onChange={(e) => updateFilter('data_fim', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Texto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_solicitante" className="text-sm font-medium">
                Nome do Solicitante
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome_solicitante"
                  placeholder="Buscar por nome..."
                  value={filters.nome_solicitante || ''}
                  onChange={(e) => updateFilter('nome_solicitante', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nome_evento" className="text-sm font-medium">
                Nome do Evento
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome_evento"
                  placeholder="Buscar por evento..."
                  value={filters.nome_evento || ''}
                  onChange={(e) => updateFilter('nome_evento', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filtros Ativos */}
          {hasActiveFilters() && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos</Label>
              <div className="flex flex-wrap gap-2">
                {filters.status?.map(status => (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => toggleStatus(status)}
                  >
                    Status: {STATUS_LABELS[status]}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {filters.tipo_reserva?.map(tipo => (
                  <Badge
                    key={tipo}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => toggleTipoReserva(tipo)}
                  >
                    Tipo: {TIPO_RESERVA_LABELS[tipo]}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {filters.data_inicio && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => updateFilter('data_inicio', undefined)}
                  >
                    De: {new Date(filters.data_inicio).toLocaleDateString('pt-BR')}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {filters.data_fim && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => updateFilter('data_fim', undefined)}
                  >
                    Até: {new Date(filters.data_fim).toLocaleDateString('pt-BR')}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {filters.nome_solicitante && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => updateFilter('nome_solicitante', undefined)}
                  >
                    Solicitante: {filters.nome_solicitante}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {filters.nome_evento && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => updateFilter('nome_evento', undefined)}
                  >
                    Evento: {filters.nome_evento}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
