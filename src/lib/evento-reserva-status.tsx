import { Badge } from '@/components/ui/badge';

export function getStatusBadgeEvento(evento: any, reservasEntidade?: any[]) {
  if (evento.status_aprovacao === 'rejeitado') {
    return <Badge className="bg-red-600 text-white">Rejeitado</Badge>;
  }
  
  if (evento.status_aprovacao === 'pendente') {
    return <Badge className="bg-gray-600 text-white">Aguardando Aprovação</Badge>;
  }
  
  // Aprovado - verificar reserva
  if (!evento.reserva_id) {
    return <Badge className="bg-yellow-600 text-white">Aguardando Reserva</Badge>;
  }
  
  // Tem reserva - verificar status da reserva
  const reserva = reservasEntidade?.find((r: any) => r.id === evento.reserva_id);
  if (reserva?.status_reserva === 'aprovada') {
    return <Badge className="bg-green-600 text-white">Evento Ativo</Badge>;
  }
  
  if (reserva?.status_reserva === 'pendente') {
    return <Badge className="bg-orange-600 text-white">Reserva Pendente</Badge>;
  }
  
  return <Badge className="bg-gray-400 text-white">Status Desconhecido</Badge>;
}

export function getStatusBadgeReserva(reserva: any) {
  if (reserva.status_reserva === 'rejeitada') {
    return <Badge className="bg-red-600 text-white">Rejeitada</Badge>;
  }
  
  if (reserva.status_reserva === 'cancelada') {
    return <Badge className="bg-gray-600 text-white">Cancelada</Badge>;
  }
  
  if (reserva.status_reserva === 'pendente') {
    return <Badge className="bg-yellow-600 text-white">Aguardando Aprovação</Badge>;
  }
  
  // Aprovada - verificar evento
  if (!reserva.evento_id) {
    return <Badge className="bg-blue-600 text-white">Disponível</Badge>;
  }
  
  return <Badge className="bg-green-600 text-white">Reserva Ativa</Badge>;
}

export function eventoNecessitaReserva(evento: any, reservasEntidade?: any[]): {
  precisaVincular: boolean;
  mensagem: string;
} {
  // Se já tem reserva, não precisa vincular
  if (evento.reserva_id) {
    const reserva = reservasEntidade?.find((r: any) => r.id === evento.reserva_id);
    if (reserva?.status_reserva === 'aprovada') {
      return {
        precisaVincular: false,
        mensagem: 'Evento vinculado a reserva aprovada'
      };
    }
    return {
      precisaVincular: false,
      mensagem: 'Evento vinculado a reserva pendente'
    };
  }

  // Evento aprovado sem reserva
  if (evento.status_aprovacao === 'aprovado') {
    return {
      precisaVincular: true,
      mensagem: 'Vincule a uma reserva aprovada para publicar o evento'
    };
  }

  return {
    precisaVincular: false,
    mensagem: 'Aguardando aprovação do evento'
  };
}

export function reservaPodeSerVinculada(reserva: any): boolean {
  return reserva.status_reserva === 'aprovada' && !reserva.evento_id;
}

