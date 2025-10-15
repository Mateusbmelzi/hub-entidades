import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReservasCalendar } from '@/components/ReservasCalendar';
import { useReservas } from '@/hooks/useReservas';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
import { Calendar, Clock, Users, Building, User, Phone, FileText } from 'lucide-react';

const CalendarioReservas: React.FC = () => {
  const { reservas, loading, error } = useReservas();
  const [selectedReserva, setSelectedReserva] = useState<ReservaDetalhada | null>(null);

  const handleReservaClick = (reserva: ReservaDetalhada) => {
    setSelectedReserva(reserva);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">Erro ao carregar reservas: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendário de Reservas
          </h1>
          <p className="text-gray-600">
            Visualize todas as reservas em formato de calendário
          </p>
        </div>

        <ReservasCalendar 
          reservas={reservas}
          onReservaClick={handleReservaClick}
        />

        {/* Modal de detalhes da reserva */}
        <Dialog open={!!selectedReserva} onOpenChange={() => setSelectedReserva(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Detalhes da Reserva
              </DialogTitle>
            </DialogHeader>
            
            {selectedReserva && (
              <div className="space-y-6">
                {/* Status e tipo */}
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedReserva.status)}>
                    {STATUS_LABELS[selectedReserva.status]}
                  </Badge>
                  <Badge variant="outline">
                    {TIPO_RESERVA_LABELS[selectedReserva.tipo_reserva]}
                  </Badge>
                </div>

                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(selectedReserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedReserva.horario_inicio} - {selectedReserva.horario_termino}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedReserva.quantidade_pessoas} pessoas
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReserva.nome_solicitante}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReserva.telefone_solicitante}</span>
                    </div>
                  </div>
                </div>

                {/* Evento relacionado */}
                {selectedReserva.nome_evento && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Evento Relacionado
                    </h4>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{selectedReserva.nome_evento}</p>
                      {selectedReserva.descricao_evento && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedReserva.descricao_evento}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Entidade */}
                {selectedReserva.nome_entidade && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Entidade</h4>
                    <p className="text-sm">{selectedReserva.nome_entidade}</p>
                  </div>
                )}

                {/* Palestrante externo */}
                {selectedReserva.tem_palestrante_externo && selectedReserva.nome_palestrante_externo && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Palestrante Externo</h4>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{selectedReserva.nome_palestrante_externo}</p>
                      {selectedReserva.apresentacao_palestrante_externo && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedReserva.apresentacao_palestrante_externo}
                        </p>
                      )}
                      {selectedReserva.eh_pessoa_publica && (
                        <Badge variant="secondary" className="mt-2">Pessoa Pública</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Equipamentos para auditório */}
                {selectedReserva.tipo_reserva === 'auditorio' && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Equipamentos Solicitados</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReserva.precisa_sistema_som && <Badge variant="outline">Sistema de Som</Badge>}
                      {selectedReserva.precisa_projetor && <Badge variant="outline">Projetor</Badge>}
                      {selectedReserva.precisa_iluminacao_especial && <Badge variant="outline">Iluminação Especial</Badge>}
                      {selectedReserva.precisa_montagem_palco && <Badge variant="outline">Montagem de Palco</Badge>}
                      {selectedReserva.precisa_gravacao && <Badge variant="outline">Gravação</Badge>}
                      {selectedReserva.precisa_alimentacao && <Badge variant="outline">Alimentação</Badge>}
                      {selectedReserva.precisa_seguranca && <Badge variant="outline">Segurança</Badge>}
                      {selectedReserva.precisa_controle_acesso && <Badge variant="outline">Controle de Acesso</Badge>}
                      {selectedReserva.precisa_limpeza_especial && <Badge variant="outline">Limpeza Especial</Badge>}
                      {selectedReserva.precisa_manutencao && <Badge variant="outline">Manutenção</Badge>}
                    </div>
                  </div>
                )}

                {/* Necessidade de sala plana */}
                {selectedReserva.necessidade_sala_plana && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Necessidade de Sala Plana</h4>
                    <p className="text-sm text-muted-foreground">{selectedReserva.motivo_sala_plana}</p>
                  </div>
                )}

                {/* Configuração da sala */}
                {selectedReserva.configuracao_sala && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Configuração da Sala</h4>
                    <p className="text-sm">{selectedReserva.configuracao_sala}</p>
                    {selectedReserva.motivo_configuracao_sala && (
                      <p className="text-sm text-muted-foreground">{selectedReserva.motivo_configuracao_sala}</p>
                    )}
                  </div>
                )}

                {/* Observações */}
                {selectedReserva.observacoes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Observações</h4>
                    <p className="text-sm text-muted-foreground">{selectedReserva.observacoes}</p>
                  </div>
                )}

                {/* Comentário de aprovação */}
                {selectedReserva.comentario_aprovacao && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Comentário da Administração</h4>
                    <p className="text-sm text-muted-foreground">{selectedReserva.comentario_aprovacao}</p>
                  </div>
                )}

                {/* Informações de criação */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>Criada em: {new Date(selectedReserva.created_at).toLocaleString('pt-BR')}</p>
                  {selectedReserva.data_aprovacao && (
                    <p>Aprovada em: {new Date(selectedReserva.data_aprovacao).toLocaleString('pt-BR')}</p>
                  )}
                  {selectedReserva.aprovador_email && (
                    <p>Aprovador: {selectedReserva.aprovador_email}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CalendarioReservas;
