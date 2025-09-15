import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReservasUsuario } from '@/hooks/useReservas';
import { useAprovarReservas } from '@/hooks/useAprovarReservas';
import { useAuth } from '@/hooks/useAuth';
import { STATUS_LABELS, TIPO_RESERVA_LABELS } from '@/types/reserva';
import { SalaInfo } from '@/components/SalaInfo';
import { 
  Calendar, 
  Clock, 
  Users, 
  Building, 
  Eye,
  XCircle
} from 'lucide-react';

export const MinhasReservas: React.FC = () => {
  const { user } = useAuth();
  const { reservasUsuario, loading, error, refetch } = useReservasUsuario(user?.id || '');
  const { cancelarReserva } = useAprovarReservas();

  const handleCancelar = async (reservaId: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      const success = await cancelarReserva(reservaId, 'Cancelada pelo usuário');
      if (success) {
        refetch();
      }
    }
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar reservas: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Minhas Reservas</h2>
          <p className="text-muted-foreground">
            {reservasUsuario.length} reserva(s) encontrada(s)
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          Atualizar
        </Button>
      </div>

      {reservasUsuario.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground text-center">
              Você ainda não fez nenhuma reserva. Que tal fazer uma agora?
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservasUsuario.map((reserva) => (
            <Card key={reserva.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {TIPO_RESERVA_LABELS[reserva.tipo_reserva]}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Criada em: {new Date(reserva.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(reserva.status)}>
                    {STATUS_LABELS[reserva.status]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
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
                    <p className="text-sm font-medium">Solicitante</p>
                    <p className="text-sm text-muted-foreground">{reserva.nome_solicitante}</p>
                    <p className="text-sm text-muted-foreground">{reserva.telefone_solicitante}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {reserva.status === 'aprovada' && reserva.data_aprovacao && (
                        <>Aprovada em {new Date(reserva.data_aprovacao).toLocaleDateString('pt-BR')}</>
                      )}
                      {reserva.status === 'rejeitada' && reserva.data_aprovacao && (
                        <>Rejeitada em {new Date(reserva.data_aprovacao).toLocaleDateString('pt-BR')}</>
                      )}
                      {reserva.status === 'pendente' && 'Aguardando aprovação'}
                      {reserva.status === 'cancelada' && 'Cancelada'}
                    </p>
                  </div>
                </div>

                {reserva.comentario_aprovacao && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Comentário da Administração</p>
                    <p className="text-sm text-muted-foreground">{reserva.comentario_aprovacao}</p>
                  </div>
                )}

                {/* Informações da Sala (se aprovada) */}
                {reserva.status === 'aprovada' && (reserva.sala_id || reserva.sala_nome) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Sala Alocada</p>
                    <SalaInfo
                      evento={{
                        sala_id: reserva.sala_id,
                        sala_nome: reserva.sala_nome,
                        sala_predio: reserva.sala_predio,
                        sala_andar: reserva.sala_andar,
                        sala_capacidade: reserva.sala_capacidade
                      }}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Detalhes específicos */}
                <div className="space-y-3">
                  {/* Motivo da Reserva */}
                  {reserva.motivo_reserva && (
                    <div>
                      <p className="text-sm font-medium">Motivo da Reserva</p>
                      <p className="text-sm text-muted-foreground">{reserva.motivo_reserva}</p>
                    </div>
                  )}

                  {/* Título do Evento de Capacitação */}
                  {reserva.titulo_evento_capacitacao && (
                    <div>
                      <p className="text-sm font-medium">Título do Evento de Capacitação</p>
                      <p className="text-sm text-muted-foreground">{reserva.titulo_evento_capacitacao}</p>
                    </div>
                  )}

                  {/* Descrição das Pautas do Evento */}
                  {reserva.descricao_pautas_evento_capacitacao && (
                    <div>
                      <p className="text-sm font-medium">Descrição das Pautas do Evento</p>
                      <p className="text-sm text-muted-foreground">{reserva.descricao_pautas_evento_capacitacao}</p>
                    </div>
                  )}

                  {/* Descrição da Programação do Evento */}
                  {reserva.descricao_programacao_evento && (
                    <div>
                      <p className="text-sm font-medium">Descrição da Programação do Evento</p>
                      <p className="text-sm text-muted-foreground">{reserva.descricao_programacao_evento}</p>
                    </div>
                  )}

                  {/* Palestrante Externo */}
                  {reserva.tem_palestrante_externo && (
                    <div>
                      <p className="text-sm font-medium">Palestrante Externo</p>
                      <p className="text-sm text-muted-foreground">{reserva.nome_palestrante_externo}</p>
                      {reserva.apresentacao_palestrante_externo && (
                        <p className="text-sm text-muted-foreground">{reserva.apresentacao_palestrante_externo}</p>
                      )}
                      {reserva.eh_pessoa_publica && (
                        <Badge variant="secondary" className="mt-1">Pessoa Pública</Badge>
                      )}
                    </div>
                  )}

                  {/* Apoio Externo */}
                  {reserva.ha_apoio_externo && (
                    <div>
                      <p className="text-sm font-medium">Apoio Externo</p>
                      <p className="text-sm text-muted-foreground">Nome da Empresa: {reserva.nome_empresa_parceira}</p>
                      <p className="text-sm text-muted-foreground">Como ajudará: {reserva.como_ajudara_organizacao}</p>
                    </div>
                  )}

                  {/* Necessidade de Sala Plana */}
                  {reserva.necessidade_sala_plana && (
                    <div>
                      <p className="text-sm font-medium">Necessidade de Sala Plana</p>
                      <p className="text-sm text-muted-foreground">{reserva.motivo_sala_plana}</p>
                    </div>
                  )}

                  {/* Equipamentos para Auditório */}
                  {reserva.tipo_reserva === 'auditorio' && (
                    <div>
                      <p className="text-sm font-medium">Equipamentos Solicitados</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reserva.precisa_sistema_som && <Badge variant="outline">Som</Badge>}
                        {reserva.precisa_projetor && <Badge variant="outline">Projetor</Badge>}
                        {reserva.precisa_iluminacao_especial && <Badge variant="outline">Iluminação</Badge>}
                        {reserva.precisa_montagem_palco && <Badge variant="outline">Palco</Badge>}
                        {reserva.precisa_gravacao && <Badge variant="outline">Gravação</Badge>}
                        {reserva.precisa_alimentacao && <Badge variant="outline">Alimentação</Badge>}
                        {reserva.precisa_seguranca && <Badge variant="outline">Segurança</Badge>}
                        {reserva.precisa_controle_acesso && <Badge variant="outline">Controle Acesso</Badge>}
                        {reserva.precisa_limpeza_especial && <Badge variant="outline">Limpeza</Badge>}
                        {reserva.precisa_manutencao && <Badge variant="outline">Manutenção</Badge>}
                      </div>
                      
                      {/* Detalhes específicos dos equipamentos */}
                      {reserva.motivo_gravacao && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Motivo da Gravação</p>
                          <p className="text-sm text-muted-foreground">{reserva.motivo_gravacao}</p>
                        </div>
                      )}
                      
                      {reserva.equipamentos_adicionais && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Equipamentos Adicionais</p>
                          <p className="text-sm text-muted-foreground">{reserva.equipamentos_adicionais}</p>
                        </div>
                      )}
                      
                      {reserva.precisa_suporte_tecnico && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Suporte Técnico</p>
                          <p className="text-sm text-muted-foreground">{reserva.detalhes_suporte_tecnico}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Configuração da Sala */}
                  {reserva.configuracao_sala && (
                    <div>
                      <p className="text-sm font-medium">Configuração da Sala</p>
                      <p className="text-sm text-muted-foreground">{reserva.configuracao_sala}</p>
                      {reserva.motivo_configuracao_sala && (
                        <p className="text-sm text-muted-foreground">Motivo: {reserva.motivo_configuracao_sala}</p>
                      )}
                    </div>
                  )}

                  {/* Alimentação */}
                  {reserva.precisa_alimentacao && (
                    <div>
                      <p className="text-sm font-medium">Alimentação</p>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_alimentacao}</p>
                      {reserva.custo_estimado_alimentacao && (
                        <p className="text-sm text-muted-foreground">Custo estimado: R$ {reserva.custo_estimado_alimentacao}</p>
                      )}
                    </div>
                  )}

                  {/* Segurança */}
                  {reserva.precisa_seguranca && (
                    <div>
                      <p className="text-sm font-medium">Segurança</p>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_seguranca}</p>
                    </div>
                  )}

                  {/* Controle de Acesso */}
                  {reserva.precisa_controle_acesso && (
                    <div>
                      <p className="text-sm font-medium">Controle de Acesso</p>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_controle_acesso}</p>
                    </div>
                  )}

                  {/* Limpeza Especial */}
                  {reserva.precisa_limpeza_especial && (
                    <div>
                      <p className="text-sm font-medium">Limpeza Especial</p>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_limpeza_especial}</p>
                    </div>
                  )}

                  {/* Manutenção */}
                  {reserva.precisa_manutencao && (
                    <div>
                      <p className="text-sm font-medium">Manutenção</p>
                      <p className="text-sm text-muted-foreground">{reserva.detalhes_manutencao}</p>
                    </div>
                  )}

                  {/* Observações */}
                  {reserva.observacoes && (
                    <div>
                      <p className="text-sm font-medium">Observações</p>
                      <p className="text-sm text-muted-foreground">{reserva.observacoes}</p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  
                  {(reserva.status === 'pendente' || reserva.status === 'aprovada') && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelar(reserva.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
