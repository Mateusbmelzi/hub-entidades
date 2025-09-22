import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useEventosEntidade } from '@/hooks/useEventosEntidade';
import { EntityCalendar } from '@/components/EntityCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CalendarPlus } from 'lucide-react';

export default function CalendarioEntidade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const entidadeId = id ? parseInt(id, 10) : undefined;
  const { isAdmin, isEntityLeader, entityLeaderships } = useUserRole();

  const isOwner = useMemo(() => {
    if (!entidadeId) return false;
    if (isAdmin) return true;
    if (isEntityLeader) {
      return entityLeaderships.some((el) => el.entidade_id === entidadeId);
    }
    return false;
  }, [entidadeId, isAdmin, isEntityLeader, entityLeaderships]);

  console.log('🔍 Permissões CalendarioEntidade:', {
    entidadeId,
    isAdmin,
    isEntityLeader,
    entityLeaderships,
    isOwner
  });

  const { eventos, loading, error } = useEventosEntidade(entidadeId, isOwner);

  console.log('🔍 CalendarioEntidade Debug:', {
    entidadeId,
    isOwner,
    eventosCount: eventos?.length || 0,
    loading,
    error,
    firstEvent: eventos?.[0]
  });

  const calendarEvents = useMemo(() => {
    const mapped = (eventos || []).map((e: any) => ({
      id: e.id,
      nome: e.nome,
      data: e.data, // já é YYYY-MM-DD na tabela
      horario_inicio: e.horario_inicio ?? null,
      horario_termino: e.horario_termino ?? null,
      status_aprovacao: e.status_aprovacao ?? null,
    }));
    console.log('📅 Calendar events mapped:', mapped);
    return mapped;
  }, [eventos]);

  useEffect(() => {
    if (!entidadeId) {
      navigate('/entidades');
    }
  }, [entidadeId, navigate]);

  if (!entidadeId) return null;

  return (
    <div className="min-h-screen bg-background p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calendário da organização estudantil</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/entidades/${entidadeId}`)}>
              Voltar
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Erro ao carregar eventos
              </CardTitle>
              <CardDescription>
                {error}
                <br />
                <small className="text-xs text-muted-foreground mt-2 block">
                  Verifique o console do navegador para mais detalhes.
                </small>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <EntityCalendar
          eventos={calendarEvents}
          title={isOwner ? 'Meu calendário de eventos' : 'Calendário de eventos'}
        />

        {loading && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Carregando eventos…</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


