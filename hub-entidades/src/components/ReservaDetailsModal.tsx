import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Users, 
  Building, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building2,
  FileText,
  Settings,
  Edit
} from 'lucide-react';
import { ReservaDetalhada, STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
import { AlterarSalaModal } from './AlterarSalaModal';

interface ReservaDetailsModalProps {
  reserva: ReservaDetalhada | null;
  isOpen: boolean;
  onClose: () => void;
  onAprovar?: (reservaId: string) => void;
  onRejeitar?: (reservaId: string) => void;
  showActions?: boolean;
  loading?: boolean;
  isAdmin?: boolean;
  onSalaAlterada?: () => void;
}

export const ReservaDetailsModal: React.FC<ReservaDetailsModalProps> = ({
  reserva,
  isOpen,
  onClose,
  onAprovar,
  onRejeitar,
  showActions = false,
  loading = false,
  isAdmin = false,
  onSalaAlterada
}) => {
  const [isAlterarSalaModalOpen, setIsAlterarSalaModalOpen] = useState(false);
  if (!reserva) return null;

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
      case 'pendente': return <AlertCircle className="h-4 w-4" />;
      case 'aprovada': return <CheckCircle className="h-4 w-4" />;
      case 'rejeitada': return <XCircle className="h-4 w-4" />;
      case 'cancelada': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove segundos se houver
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {reserva.tipo_reserva === 'sala' ? (
              <Building className="h-5 w-5 text-indigo-500" />
            ) : (
              <MapPin className="h-5 w-5 text-purple-500" />
            )}
            {reserva.nome_evento || `Reserva de ${TIPO_RESERVA_LABELS[reserva.tipo_reserva]}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(reserva.status)} border`}>
                {getStatusIcon(reserva.status)}
                <span className="ml-1">{STATUS_LABELS[reserva.status as keyof typeof STATUS_LABELS]}</span>
              </Badge>
              <Badge variant="outline">
                {TIPO_RESERVA_LABELS[reserva.tipo_reserva]}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              ID: {reserva.id}
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-800">Data do Evento</div>
                <div className="text-sm text-blue-600">{formatDate(reserva.data_reserva)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">Horário</div>
                <div className="text-sm text-green-600">
                  {formatTime(reserva.horario_inicio)} - {formatTime(reserva.horario_termino)}
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Solicitante */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Nome</div>
                  <div className="text-sm text-gray-600">{reserva.nome_solicitante}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Telefone</div>
                  <div className="text-sm text-gray-600">{reserva.telefone_solicitante}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Evento */}
          {reserva.nome_evento && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Evento
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-1">Nome do Evento</div>
                <div className="text-sm text-gray-600">{reserva.nome_evento}</div>
              </div>
              {reserva.descricao_evento && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-800 mb-1">Descrição</div>
                  <div className="text-sm text-gray-600">{reserva.descricao_evento}</div>
                </div>
              )}
            </div>
          )}

          {/* Informações da Sala/Auditório */}
          {(reserva.sala_nome || reserva.sala_predio) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Local
                </h3>
                {isAdmin && reserva.status === 'aprovada' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAlterarSalaModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Alterar Sala
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reserva.sala_nome && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Sala/Auditório</div>
                    <div className="text-sm text-purple-600">{reserva.sala_nome}</div>
                  </div>
                )}
                {reserva.sala_predio && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Prédio</div>
                    <div className="text-sm text-purple-600">{reserva.sala_predio}</div>
                  </div>
                )}
                {reserva.sala_andar && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Andar</div>
                    <div className="text-sm text-purple-600">{reserva.sala_andar}</div>
                  </div>
                )}
                {reserva.sala_capacidade && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Capacidade</div>
                    <div className="text-sm text-purple-600">{reserva.sala_capacidade} pessoas</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Capacidade e Público */}
          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
            <Users className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="text-sm font-medium text-indigo-800">Quantidade de Pessoas</div>
              <div className="text-sm text-indigo-600">{reserva.quantidade_pessoas} pessoas</div>
            </div>
          </div>

          {/* Observações */}
          {reserva.observacoes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Observações
              </h3>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-700">{reserva.observacoes}</div>
              </div>
            </div>
          )}

          {/* Comentário de Aprovação */}
          {reserva.comentario_aprovacao && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Comentário de Aprovação
              </h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700">{reserva.comentario_aprovacao}</div>
                {reserva.data_aprovacao && (
                  <div className="text-xs text-gray-500 mt-2">
                    Aprovado em: {new Date(reserva.data_aprovacao).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          {showActions && reserva.status === 'pendente' && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => onRejeitar?.(reserva.id)}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
              <Button
                onClick={() => onAprovar?.(reserva.id)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Modal de Alterar Sala */}
      <AlterarSalaModal
        reserva={reserva}
        isOpen={isAlterarSalaModalOpen}
        onClose={() => setIsAlterarSalaModalOpen(false)}
        onSuccess={() => {
          onSalaAlterada?.();
          setIsAlterarSalaModalOpen(false);
        }}
      />
    </Dialog>
  );
};
