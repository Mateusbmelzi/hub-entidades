import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Building, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
import { ReservaDetailsModal } from './ReservaDetailsModal';

interface DashboardCalendarProps {
  reservas: ReservaDetalhada[];
  onReservaClick?: (reserva: ReservaDetalhada) => void;
  loading?: boolean;
  isAdmin?: boolean;
  onSalaAlterada?: () => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  reservas,
  onReservaClick,
  loading = false,
  isAdmin = false,
  onSalaAlterada
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedReserva, setSelectedReserva] = useState<ReservaDetalhada | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Gerar dias do mês
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();

  // Criar array de dias para o calendário
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Dias do mês anterior
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // Dias do próximo mês
    for (let day = 1; day <= (6 - lastDayOfMonth); day++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, day),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  }, [currentYear, currentMonth, firstDayOfMonth, lastDayOfMonth, daysInMonth]);

  // Filtrar reservas por data
  const getReservasForDate = (date: Date) => {
    return reservas.filter(reserva => {
      const reservaDate = new Date(reserva.data_reserva);
      return reservaDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleReservaClick = (reserva: ReservaDetalhada) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
    onReservaClick?.(reserva);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReserva(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovada': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitada': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <AlertCircle className="h-3 w-3" />;
      case 'aprovada': return <CheckCircle className="h-3 w-3" />;
      case 'rejeitada': return <XCircle className="h-3 w-3" />;
      case 'cancelada': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Estatísticas do mês atual
  const monthStats = useMemo(() => {
    const currentMonthReservas = reservas.filter(reserva => {
      const reservaDate = new Date(reserva.data_reserva);
      return reservaDate.getMonth() === currentMonth && reservaDate.getFullYear() === currentYear;
    });

    return {
      total: currentMonthReservas.length,
      pendentes: currentMonthReservas.filter(r => r.status === 'pendente').length,
      aprovadas: currentMonthReservas.filter(r => r.status === 'aprovada').length,
      rejeitadas: currentMonthReservas.filter(r => r.status === 'rejeitada').length,
      canceladas: currentMonthReservas.filter(r => r.status === 'cancelada').length
    };
  }, [reservas, currentMonth, currentYear]);

  // Estatísticas gerais (todas as reservas)
  const totalStats = useMemo(() => {
    return {
      total: reservas.length,
      pendentes: reservas.filter(r => r.status === 'pendente').length,
      aprovadas: reservas.filter(r => r.status === 'aprovada').length,
      rejeitadas: reservas.filter(r => r.status === 'rejeitada').length,
      canceladas: reservas.filter(r => r.status === 'cancelada').length
    };
  }, [reservas]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Eventos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: 'month' | 'week') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Estatísticas Gerais</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{totalStats.total}</div>
              <div className="text-xs text-blue-600">Total de Eventos</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">{totalStats.pendentes}</div>
              <div className="text-xs text-yellow-600">Pendentes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">{totalStats.aprovadas}</div>
              <div className="text-xs text-green-600">Aprovados</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-700">{totalStats.rejeitadas}</div>
              <div className="text-xs text-red-600">Rejeitados</div>
            </div>
          </div>
        </div>

        {/* Estatísticas do Mês Atual */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 mb-3">
            Estatísticas de {monthNames[currentMonth]} {currentYear}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-blue-700">{monthStats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-yellow-700">{monthStats.pendentes}</div>
              <div className="text-xs text-yellow-600">Pendentes</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-green-700">{monthStats.aprovadas}</div>
              <div className="text-xs text-green-600">Aprovadas</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg font-bold text-red-700">{monthStats.rejeitadas}</div>
              <div className="text-xs text-red-600">Rejeitadas</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'month' ? (
          <div className="space-y-4">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayReservas = getReservasForDate(day.date);
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[140px] p-2 border rounded-lg
                      ${day.isCurrentMonth ? 'bg-white' : 'bg-muted/30'}
                      ${day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                      ${isWeekend ? 'bg-muted/50' : ''}
                      hover:bg-muted/50 transition-colors
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`
                        text-sm font-medium
                        ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${day.isToday ? 'text-primary font-bold' : ''}
                      `}>
                        {day.date.getDate()}
                      </span>
                      {dayReservas.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayReservas.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayReservas.slice(0, 3).map((reserva, idx) => (
                        <div
                          key={idx}
                          className={`
                            text-xs p-2 rounded cursor-pointer border
                            ${getStatusColor(reserva.status)}
                            hover:opacity-80 transition-opacity
                          `}
                          onClick={() => handleReservaClick(reserva)}
                          title={`${reserva.nome_solicitante} - ${TIPO_RESERVA_LABELS[reserva.tipo_reserva]} - ${STATUS_LABELS[reserva.status as keyof typeof STATUS_LABELS]}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {getStatusIcon(reserva.status)}
                            <span className="font-medium">
                              {reserva.horario_inicio}
                            </span>
                            {reserva.tipo_reserva === 'sala' ? (
                              <Building className="h-3 w-3 ml-auto" />
                            ) : (
                              <MapPin className="h-3 w-3 ml-auto" />
                            )}
                          </div>
                          <div className="truncate font-medium">
                            {reserva.nome_evento || reserva.nome_solicitante}
                          </div>
                          <div className="truncate text-xs opacity-75">
                            {TIPO_RESERVA_LABELS[reserva.tipo_reserva]}
                          </div>
                        </div>
                      ))}
                      {dayReservas.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center p-1 bg-muted/50 rounded">
                          +{dayReservas.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visualização semanal */}
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visualização semanal em desenvolvimento</p>
              <p className="text-sm">Use a visualização mensal para ver todos os eventos</p>
            </div>
          </div>
        )}
        
        {/* Legenda */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Legenda de Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getStatusColor(status).split(' ')[0]}`} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
          
        </div>
      </CardContent>

      {/* Modal de Detalhes da Reserva */}
      <ReservaDetailsModal
        reserva={selectedReserva}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        showActions={false}
        isAdmin={isAdmin}
        onSalaAlterada={onSalaAlterada}
      />
    </Card>
  );
};
