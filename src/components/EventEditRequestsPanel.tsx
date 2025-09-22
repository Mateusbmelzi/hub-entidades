import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventEditApprovals } from '@/hooks/useEventEditApprovals';
import { Check, X, Calendar, MapPin, Users, Clock, ExternalLink, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatDateTime = (data: string, horario?: string | null) => {
  try {
    const date = new Date(data);
    const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
    return horario ? `${formattedDate} às ${horario}` : formattedDate;
  } catch {
    return data;
  }
};

const formatAreas = (areas?: string[]) => {
  if (!areas || !Array.isArray(areas)) return 'Não informado';
  return areas.join(', ');
};

const EventEditRequestCard = ({ request, onApprove }: { request: any; onApprove: (id: string, approve: boolean) => void }) => {
  const evento = request.eventos;
  const changes = request.changes;
  
  if (!evento) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'PENDENTE';
      case 'aprovada': return 'APROVADA';
      case 'rejeitada': return 'REJEITADA';
      default: return status.toUpperCase();
    }
  };

  const hasChanged = (field: string) => {
    if (field === 'area_atuacao') {
      const original = evento[field] || [];
      const changed = changes[field] || [];
      return JSON.stringify(original.sort()) !== JSON.stringify(changed.sort());
    }
    return changes[field] !== undefined && changes[field] !== evento[field];
  };

  const getChangeValue = (field: string) => {
    return changes[field] !== undefined ? changes[field] : evento[field];
  };

  // Obter apenas os campos que realmente mudaram
  const getChangedFields = () => {
    return Object.keys(changes).filter(field => hasChanged(field));
  };

  const changedFields = getChangedFields();

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{evento.nome}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Organização: {request.entidades?.nome || 'Não informado'}
            </p>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Indicador de alterações */}
        {changedFields.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">⚠️ Nenhuma alteração detectada</p>
            <p className="text-yellow-700 text-sm mt-1">Esta solicitação não contém mudanças nos dados do evento.</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 font-medium">
                {changedFields.length} alteração{changedFields.length > 1 ? 'ões' : ''} proposta{changedFields.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Dados originais vs alterações - apenas se houver mudanças */}
        {changedFields.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados originais */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                DADOS ORIGINAIS
              </h4>
              <div className="space-y-3">
                {changedFields.includes('data') || changedFields.includes('horario_inicio') ? (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data e Hora</p>
                      <p className="text-sm">{formatDateTime(evento.data, evento.horario_inicio)}</p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('local') ? (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Local</p>
                      <p className="text-sm">{evento.local || 'Não informado'}</p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('capacidade') ? (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Capacidade</p>
                      <p className="text-sm">{evento.capacidade || 'Não informado'}</p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('area_atuacao') ? (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Target className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Áreas de Atuação</p>
                      <p className="text-sm">{formatAreas(evento.area_atuacao)}</p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('descricao') ? (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium">Descrição</p>
                    <p className="text-sm text-muted-foreground">{evento.descricao || 'Não informado'}</p>
                  </div>
                ) : null}
                
                {changedFields.includes('link_evento') ? (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border">
                    <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Link do Evento</p>
                      {evento.link_evento ? (
                        <a href={evento.link_evento} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {evento.link_evento}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não informado</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Alterações propostas */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                ALTERAÇÕES PROPOSTAS
              </h4>
              <div className="space-y-3">
                {changedFields.includes('data') || changedFields.includes('horario_inicio') ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Data e Hora</p>
                      <p className="text-sm text-blue-700 font-medium">
                        {formatDateTime(getChangeValue('data'), getChangeValue('horario_inicio'))}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('local') ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Local</p>
                      <p className="text-sm text-blue-700 font-medium">
                        {getChangeValue('local') || 'Não informado'}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('capacidade') ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Capacidade</p>
                      <p className="text-sm text-blue-700 font-medium">
                        {getChangeValue('capacidade') || 'Não informado'}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('area_atuacao') ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Target className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Áreas de Atuação</p>
                      <p className="text-sm text-blue-700 font-medium">
                        {formatAreas(getChangeValue('area_atuacao'))}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {changedFields.includes('descricao') ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Descrição</p>
                    <p className="text-sm text-blue-700 font-medium">
                      {getChangeValue('descricao') || 'Não informado'}
                    </p>
                  </div>
                ) : null}
                
                {changedFields.includes('link_evento') ? (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <ExternalLink className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Link do Evento</p>
                      {getChangeValue('link_evento') ? (
                        <a href={getChangeValue('link_evento')} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                          {getChangeValue('link_evento')}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não informado</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Resumo das alterações - apenas se houver mudanças */}
        {changedFields.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-sm text-blue-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Resumo das Alterações
            </h5>
            <div className="text-sm text-blue-700">
              <ul className="space-y-2">
                {changedFields.map((field) => {
                  const fieldLabels: { [key: string]: string } = {
                    nome: 'Nome',
                    descricao: 'Descrição',
                    local: 'Local',
                    data: 'Data',
                    horario_inicio: 'Horário de início',
                    horario_termino: 'Horário de término',
                    capacidade: 'Capacidade',
                    link_evento: 'Link do evento',
                    area_atuacao: 'Áreas de atuação'
                  };
                  
                  const originalValue = evento[field];
                  const displayValue = field === 'area_atuacao' ? formatAreas(changes[field] as string[]) : changes[field];
                  const displayOriginal = field === 'area_atuacao' ? formatAreas(originalValue) : originalValue;
                  
                  return (
                    <li key={field} className="flex items-start gap-2 p-2 bg-white rounded border">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="font-medium text-blue-800">{fieldLabels[field] || field}:</span>
                        <div className="mt-1 text-xs">
                          <div className="text-gray-600">
                            <span className="font-medium">De:</span> {displayOriginal || 'Não informado'}
                          </div>
                          <div className="text-blue-700 font-medium">
                            <span className="font-medium">Para:</span> {displayValue || 'Não informado'}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Comentário de aprovação */}
        {request.comentario_aprovacao && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-sm text-gray-800 mb-1">Comentário do Administrador</h5>
            <p className="text-sm text-gray-700">{request.comentario_aprovacao}</p>
          </div>
        )}

        {/* Ações */}
        {request.status === 'pendente' && (
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              size="sm" 
              onClick={() => onApprove(request.id, true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" /> Aprovar Alterações
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onApprove(request.id, false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" /> Rejeitar
            </Button>
          </div>
        )}

        {/* Status final */}
        {request.status !== 'pendente' && (
          <div className={`pt-4 border-t ${request.status === 'aprovada' ? 'border-green-200' : 'border-red-200'}`}>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              request.status === 'aprovada' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {request.status === 'aprovada' ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  request.status === 'aprovada' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {request.status === 'aprovada' ? 'Solicitação Aprovada' : 'Solicitação Rejeitada'}
                </p>
                <p className={`text-sm ${
                  request.status === 'aprovada' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {request.status === 'aprovada' 
                    ? 'As alterações foram aplicadas ao evento.' 
                    : 'Esta solicitação foi rejeitada.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EventEditRequestsPanel = () => {
  const { requests, loading, error, approveRequest } = useEventEditApprovals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de edição de eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <div className="text-sm text-muted-foreground">Carregando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !requests.length && (
          <div className="text-sm text-muted-foreground">Sem solicitações no momento.</div>
        )}
        {requests.map(request => (
          <EventEditRequestCard key={request.id} request={request} onApprove={approveRequest} />
        ))}
      </CardContent>
    </Card>
  );
};

export default EventEditRequestsPanel;


