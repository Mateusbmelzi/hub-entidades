import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export interface EntidadeCalendarEvent {
  id: string;
  nome: string;
  data: string; // YYYY-MM-DD
  horario_inicio?: string | null; // e.g. "18:00"
  horario_termino?: string | null;  // e.g. "20:00"
  status_aprovacao?: string | null; // aprovado | pendente | rejeitado
}

interface EntityCalendarProps {
  eventos: EntidadeCalendarEvent[];
  title?: string;
}

export const EntityCalendar: React.FC<EntityCalendarProps> = ({ eventos, title = 'Calendário da Entidade' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EntidadeCalendarEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<{ local?: string | null; capacidade?: number | null; inscritos?: number }>({});

  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !selectedEvent) return;
      try {
        setDetailsLoading(true);
        // Buscar detalhes do evento
        const { data: evento, error: eventoError } = await supabase
          .from('eventos')
          .select('local, capacidade')
          .eq('id', selectedEvent.id)
          .single();
        if (eventoError) throw eventoError;

        // Contar inscritos
        const { count, error: countError } = await supabase
          .from('participantes_evento')
          .select('id', { count: 'exact', head: true })
          .eq('evento_id', selectedEvent.id);
        if (countError) throw countError;

        setEventDetails({ local: evento?.local || null, capacidade: evento?.capacidade || null, inscritos: count || 0 });
      } catch (e) {
        setEventDetails({});
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [open, selectedEvent]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();

  const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({ date, isCurrentMonth: true, isToday });
    }

    for (let day = 1; day <= 6 - lastDayOfMonth; day++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, day),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, firstDayOfMonth, lastDayOfMonth, daysInMonth]);

  const getEventsForDate = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return (eventos || []).filter((ev) => ev.data === key);
  };

  const goPrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
    }
  };

  const goNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
    }
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const statusVariant = (status?: string | null) => {
    if (status === 'aprovado') return 'default' as const;
    if (status === 'pendente') return 'secondary' as const;
    if (status === 'rejeitado') return 'destructive' as const;
    return 'outline' as const;
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] text-center font-medium capitalize">{monthLabel}</div>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="hidden md:flex gap-1 ml-2">
            <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('month')}>Mês</Button>
            <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>Semana</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDate(day.date);
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                return (
                  <div
                    key={idx}
                    className={`min-h-[140px] p-2 border rounded-lg ${day.isCurrentMonth ? 'bg-white' : 'bg-muted/30'} ${day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''} ${isWeekend ? 'bg-muted/50' : ''} hover:bg-muted/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'} ${day.isToday ? 'text-primary font-bold' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>
                      )}
                    </div>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => { setSelectedEvent(ev); setOpen(true); }}
                          className="w-full text-left p-2 rounded border hover:bg-muted cursor-pointer"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {ev.horario_inicio || '--:--'}
                              {ev.horario_termino ? ` - ${ev.horario_termino}` : ''}
                            </span>
                            {ev.status_aprovacao && (
                              <Badge variant={statusVariant(ev.status_aprovacao)} className="ml-auto text-[10px]">
                                {ev.status_aprovacao}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium leading-snug line-clamp-2">{ev.nome}</div>
                        </button>
                      ))}
                      {dayEvents.length === 0 && <div className="text-xs text-muted-foreground">Sem eventos</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Visão semanal em breve</div>
        )}
      </CardContent>
    </Card>

    {/* Modal de detalhes do evento */}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {selectedEvent?.nome || 'Evento'}
          </DialogTitle>
        </DialogHeader>

        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(selectedEvent.data + 'T00:00:00').toLocaleDateString('pt-BR')} • {selectedEvent.horario_inicio || '--:--'}{selectedEvent.horario_termino ? ` - ${selectedEvent.horario_termino}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{detailsLoading ? 'Carregando local…' : (eventDetails.local || 'Local não informado')}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Inscritos: {detailsLoading ? '—' : (eventDetails.inscritos ?? 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Capacidade: {detailsLoading ? '—' : (eventDetails.capacidade ?? '—')}</span>
              </div>
            </div>
            {selectedEvent.status_aprovacao && (
              <div>
                <Badge variant={statusVariant(selectedEvent.status_aprovacao)}>{selectedEvent.status_aprovacao}</Badge>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          <Button onClick={() => { if (selectedEvent) navigate(`/eventos/${selectedEvent.id}`); }}>Ver detalhes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EntityCalendar;


