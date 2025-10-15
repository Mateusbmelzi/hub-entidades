
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Mail, Phone, Badge as BadgeIcon, Sparkles, Target, Building2, Award, TrendingUp, Download, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { combineDataHorario, formatDataHorario, isEventoAtivo, getEventoStatus } from '@/lib/date-utils';
import { useAuth } from '@/hooks/useAuth';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import InscricaoEventoForm from '@/components/InscricaoEventoForm';
import EntityLoginForm from '@/components/EntityLoginForm';
import { FormularioInscricaoEvento } from '@/components/FormularioInscricaoEvento';
import { GerenciarInscritosEvento } from '@/components/GerenciarInscritosEvento';
import { exportToCSV, formatDateForCSV } from '@/lib/csv-export';
import { toast } from 'sonner';

const EventoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { entidadeId, isAuthenticated } = useEntityAuth();
  const [showInscricaoDialog, setShowInscricaoDialog] = useState(false);
  const [showEntityLoginDialog, setShowEntityLoginDialog] = useState(false);

  const { data: evento, isLoading: eventoLoading, error: eventoError } = useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      // Primeiro buscar o evento
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome, descricao_curta, contato)
        `)
        .eq('id', id)
        .single();
      
      if (eventoError) throw eventoError;
      
      // Buscar a reserva associada pelo nome do evento ou outros critérios
      let reservaData = null;
      let professoresConvidados = [];
      
      if (eventoData) {
        const { data: reserva, error: reservaError } = await supabase
          .from('reservas')
          .select(`
            id,
            motivo_reserva,
            tem_palestrante_externo,
            nome_palestrante_externo,
            apresentacao_palestrante_externo,
            eh_pessoa_publica
          `)
          .eq('status', 'aprovada')
          .ilike('titulo_evento_capacitacao', `%${eventoData.nome}%`)
          .single();
        
        if (!reservaError && reserva) {
          reservaData = reserva;
          
          // Buscar professores convidados da nova tabela
          try {
            const { data: professores, error: professoresError } = await (supabase as any)
              .from('professores_convidados')
              .select('*')
              .eq('reserva_id', (reserva as any).id)
              .order('created_at', { ascending: true });
            
            if (!professoresError && professores) {
              professoresConvidados = professores;
            }
          } catch (e) {
            console.log('Erro ao buscar professores convidados:', e);
          }
        }
      }
      
      return {
        ...eventoData,
        reservas: reservaData,
        professores_convidados: professoresConvidados
      };
    },
    enabled: !!id
  });

  const { data: participantes = [], isLoading: participantesLoading, refetch: refetchParticipantes } = useQuery({
    queryKey: ['participantes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participantes_evento')
        .select('*')
        .eq('evento_id', id)
        .order('data_inscricao', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Verificar se o usuário atual já está inscrito
  const usuarioInscrito = user && participantes.find(p => p.email === user.email);

  // Verificar se o evento está ativo e não passou da data
  const eventoAtivo = evento && evento.status === 'ativo' && isEventoAtivo(evento.data, evento.horario_inicio);
  
  // Verificar se o evento está lotado
  const eventoLotado = evento?.capacidade && participantes.length >= evento.capacidade;

  // Verificar se a entidade atual é a organizadora do evento
  const isEventOrganizer = isAuthenticated && evento?.entidades?.id === entidadeId;
 
  // Função para exportar participantes como CSV
  const handleExportCSV = () => {
    try {
      const filename = `participantes_evento_${evento?.nome?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
      
      const headers = {
        nome: 'Nome',
        email: 'Email',
        telefone: 'Telefone',
        status_participacao: 'Status',
        data_inscricao: 'Data de Inscrição'
      };

      const csvData = participantes.map(participante => ({
        nome: participante.nome_participante,
        email: participante.email || '',
        telefone: participante.telefone || '',
        status_participacao: participante.status_participacao,
        data_inscricao: formatDateForCSV(participante.data_inscricao)
      }));

      exportToCSV(csvData, filename, headers);
      toast.success(`CSV exportado com sucesso! ${participantes.length} participantes.`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  if (eventoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-6"></div>
          <p className="text-insper-dark-gray text-lg">Carregando evento...</p>
          <p className="text-insper-dark-gray/60 text-sm mt-2">Preparando os detalhes para você</p>
        </div>
      </div>
    );
  }

  if (eventoError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-insper-red" />
          </div>
          <h1 className="text-2xl font-bold text-insper-black mb-4">Erro ao carregar evento</h1>
          <p className="text-insper-dark-gray mb-6">
            {eventoError instanceof Error ? eventoError.message : 'Erro desconhecido'}
          </p>
          <Button asChild className="bg-insper-red hover:bg-red-700 text-white">
            <Link to="/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Eventos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-insper-red" />
          </div>
          <h1 className="text-2xl font-bold text-insper-black mb-4">Evento não encontrado</h1>
          <p className="text-insper-dark-gray mb-6">O evento que você está procurando não existe ou foi removido.</p>
          <Button asChild className="bg-insper-red hover:bg-red-700 text-white">
            <Link to="/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Eventos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string, data: string, horario?: string | null) => {
    const eventDate = (() => {
      const [y, m, d] = data.split("-");
      const [h = 0, min = 0] = horario ? horario.split(":") : [0, 0];
      return new Date(+y, +m - 1, +d, +h, +min);
    })();
    
    const now = new Date();
    
    if (status === 'cancelado') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'finalizado' || eventDate < now) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (eventDate < now) {
      status = 'finalizado';
    };

    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusLabel = (status: string, data: string, horario?: string | null) => {
    const eventDate = (() => {
      const [y, m, d] = data.split("-");
      const [h = 0, min = 0] = horario ? horario.split(":") : [0, 0];
      return new Date(+y, +m - 1, +d, +h, +min);
    })();
    const now = new Date();
    
    if (status === 'cancelado') return 'Cancelado';
    if (status === 'finalizado' || eventDate < now) return 'Finalizado';
    return 'Ativo';
  };

  const getParticipationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoEventoLabel = (motivoReserva: string) => {
    switch (motivoReserva) {
      case 'palestra_alunos_insper': return 'Palestra - Alunos Insper';
      case 'palestra_publico_externo': return 'Palestra - Público Externo';
      case 'capacitacao': return 'Capacitação';
      case 'reuniao': return 'Reunião';
      case 'processo_seletivo': return 'Processo Seletivo';
      case 'auditorio_palestra_alunos_insper': return 'Palestra - Alunos Insper';
      case 'auditorio_palestra_publico_externo': return 'Palestra - Público Externo';
      case 'auditorio_capacitacao': return 'Capacitação';
      case 'auditorio_reuniao': return 'Reunião';
      case 'auditorio_processo_seletivo': return 'Processo Seletivo';
      case 'auditorio_cerimonia_formatura': return 'Cerimônia de Formatura';
      case 'auditorio_defesa_tcc': return 'Defesa de TCC';
      case 'auditorio_apresentacao_trabalho': return 'Apresentação de Trabalho';
      case 'auditorio_simposio': return 'Simpósio';
      case 'auditorio_conferencia': return 'Conferência';
      case 'auditorio_workshop': return 'Workshop';
      case 'auditorio_seminario': return 'Seminário';
      case 'auditorio_outros': return 'Outros';
      default: return motivoReserva || 'Não especificado';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white">
      {/* Hero Header */}
      <div className="relative bg-insper-red text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-white hover:bg-white/20">
              <Link to="/eventos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Eventos
              </Link>
            </Button>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="mb-6">
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {evento.nome}
                </h1>
                
                {/* Tipo do Evento */}
                {evento.reservas && evento.reservas.motivo_reserva && (
                  <div className="mb-6">
                    <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 font-medium">
                      {getTipoEventoLabel(evento.reservas.motivo_reserva)}
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-6 text-red-100 mb-6">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {format(combineDataHorario(evento.data, evento.horario_inicio), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    {format(combineDataHorario(evento.data, evento.horario_inicio), "hh:mm a", { locale: ptBR })}
                  </div>
                  {evento.local && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      {evento.local}
                    </div>
                  )}
                </div>

                {evento.descricao && (
                  <p className="text-xl text-red-100 leading-relaxed max-w-3xl">
                    {evento.descricao}
                  </p>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="lg:w-96">
              <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">Informações do Evento</CardTitle>
                    <Badge
                      className={`${getStatusColor(evento.status, evento.data, evento.horario_inicio)} text-sm px-3 py-1`}
                    >
                      {getStatusLabel(evento.status, evento.data, evento.horario_inicio)}{" "}
                      {format(combineDataHorario(evento.data, evento.horario_inicio), "hh:mm a", { locale: ptBR })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {evento.capacidade && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-2 h-4 w-4" />
                        Capacidade
                      </div>
                      <span className="font-semibold text-gray-900">{evento.capacidade} pessoas</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="mr-2 h-4 w-4" />
                      Inscritos
                    </div>
                    <span className="font-semibold text-gray-900">{participantes.length} pessoas</span>
                  </div>

                  <div className="pt-4">
                    {usuarioInscrito ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                        ✓ Já inscrito
                      </Button>
                    ) : !eventoAtivo ? (
                      <Button className="w-full bg-gray-400" disabled>
                        {evento.status === 'cancelado' ? 'Evento cancelado' : 'Evento finalizado'}
                      </Button>
                    ) : eventoLotado ? (
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled>
                        Evento lotado
                      </Button>
                    ) : !user ? (
                      <Button className="w-full bg-white text-red-600 hover:bg-gray-50 border-2 border-white" asChild>
                        <Link to="/auth">
                          Faça login para se inscrever
                        </Link>
                      </Button>
                    ) : (
                      <Dialog open={showInscricaoDialog} onOpenChange={setShowInscricaoDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-white text-red-600 hover:bg-gray-50 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300">
                            Inscrever-se no Evento
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <InscricaoEventoForm 
                            eventoId={evento.id}
                            eventoNome={evento.nome}
                            link_evento={evento.link_evento} 
                            onSuccess={() => {
                              setShowInscricaoDialog(false);
                              refetchParticipantes();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

             {/* Content */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
         <div className={`grid gap-8 ${isAuthenticated ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
           {/* Participants Section - Visible only to authenticated entities */}
           {isAuthenticated && (
             <div className="lg:col-span-2 space-y-8">
               {isEventOrganizer ? (
                 <Card className="border-0 shadow-lg bg-white">
                   <CardHeader className="pb-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <TrendingUp className="w-5 h-5 text-red-600" />
                         <CardTitle className="text-2xl">Lista de Inscritos ({participantes.length})</CardTitle>
                       </div>
                       {isEventOrganizer && (
                         <Button 
                           onClick={handleExportCSV}
                           variant="outline"
                           size="sm"
                           className="border-red-200 text-red-600 hover:bg-red-50"
                         >
                           <Download className="w-4 h-4 mr-2" />
                           Exportar CSV
                         </Button>
                       )}
                     </div>
                   </CardHeader>
                   <CardContent>
                     {participantesLoading ? (
                       <div className="text-center py-12">
                         <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
                         <p className="text-gray-600">Carregando participantes...</p>
                       </div>
                     ) : participantes.length > 0 ? (
                       <div className="overflow-x-auto">
                         <Table>
                           <TableHeader>
                             <TableRow className="bg-gray-50">
                               <TableHead className="font-semibold text-gray-900">Nome</TableHead>
                               <TableHead className="font-semibold text-gray-900">Email</TableHead>
                               <TableHead className="font-semibold text-gray-900">Telefone</TableHead>
                               <TableHead className="font-semibold text-gray-900">Status</TableHead>
                               <TableHead className="font-semibold text-gray-900">Data de Inscrição</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {participantes.map((participante) => (
                               <TableRow key={participante.id} className="hover:bg-gray-50">
                                 <TableCell className="font-medium text-gray-900">
                                   {participante.nome_participante}
                                 </TableCell>
                                 <TableCell className="text-gray-600">{participante.email || '-'}</TableCell>
                                 <TableCell className="text-gray-600">{participante.telefone || '-'}</TableCell>
                                 <TableCell>
                                   <Badge className={`${getParticipationStatusColor(participante.status_participacao)} text-xs font-medium`}>
                                     {participante.status_participacao}
                                   </Badge>
                                 </TableCell>
                                 <TableCell className="text-gray-600">
                                   {format(new Date(participante.data_inscricao), "dd/MM/yyyy", { locale: ptBR })}
                                 </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                       </div>
                     ) : (
                       <div className="text-center py-12">
                         <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Users className="h-10 w-10 text-red-600" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 mb-3">
                           Nenhum participante ainda
                         </h3>
                         <p className="text-gray-600">
                           Aguardando as primeiras inscrições para este evento.
                         </p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               ) : (
                 // Seção para usuários não autenticados como entidade
                 <Card className="border-0 shadow-lg bg-white">
                   <CardHeader className="pb-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <TrendingUp className="w-5 h-5 text-red-600" />
                         <CardTitle className="text-2xl">Lista de Inscritos ({participantes.length})</CardTitle>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent>
                     <div className="text-center py-12">
                       <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                         <LogIn className="h-10 w-10 text-red-600" />
                       </div>
                       <h3 className="text-xl font-bold text-gray-900 mb-3">
                         Faça login como organizador
                       </h3>
                       <p className="text-gray-600 mb-6">
                         Para visualizar a lista completa de inscritos e exportar os dados, faça login como entidade responsável pelo evento.
                       </p>
                       <Dialog open={showEntityLoginDialog} onOpenChange={setShowEntityLoginDialog}>
                         <DialogTrigger asChild>
                           <Button className="bg-red-600 hover:bg-red-700">
                             <LogIn className="w-4 h-4 mr-2" />
                             Login como Organização Responsável
                           </Button>
                         </DialogTrigger>
                         <DialogContent>
                           <EntityLoginForm 
                             onSuccess={() => {
                               setShowEntityLoginDialog(false);
                             }}
                           />
                         </DialogContent>
                       </Dialog>
                     </div>
                   </CardContent>
                 </Card>
               )}
             </div>
           )}

           {/* Botão de Inscrição - Para usuários públicos */}
           {evento.formulario_ativo && !isAuthenticated && (
             <div className="lg:col-span-2">
               <Card className="border-0 shadow-lg bg-white">
                 <CardContent className="pt-6">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-xl font-semibold text-gray-900">Inscrições Abertas</h3>
                       <p className="text-sm text-gray-600">
                         {evento.total_inscritos}/{evento.limite_vagas || '∞'} vagas preenchidas
                       </p>
                     </div>
                     <Dialog open={showInscricaoDialog} onOpenChange={setShowInscricaoDialog}>
                       <DialogTrigger asChild>
                         <Button 
                           disabled={evento.limite_vagas && evento.total_inscritos >= evento.limite_vagas}
                           className="bg-red-600 hover:bg-red-700"
                         >
                           {evento.limite_vagas && evento.total_inscritos >= evento.limite_vagas 
                             ? 'Vagas Esgotadas' 
                             : 'Inscrever-se'
                           }
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                         <FormularioInscricaoEvento 
                           eventoId={evento.id} 
                           onSuccess={() => setShowInscricaoDialog(false)}
                           onCancel={() => setShowInscricaoDialog(false)}
                         />
                       </DialogContent>
                     </Dialog>
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}

           {/* Gerenciar Inscritos - Para proprietário da entidade */}
           {isAuthenticated && evento.formulario_ativo && (
             <div className="lg:col-span-2">
               <Card className="border-0 shadow-lg bg-white">
                 <CardHeader>
                   <CardTitle className="text-xl">Gerenciar Inscritos no Evento</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <GerenciarInscritosEvento eventoId={evento.id} />
                 </CardContent>
               </Card>
             </div>
           )}

           {/* Entity Information - Always visible, but layout changes based on authentication */}
           <div className={`space-y-8 ${!isAuthenticated ? 'lg:max-w-2xl lg:mx-auto' : ''}`}>
             {evento.entidades && (
               <Card className="border-0 shadow-lg bg-white">
                 <CardHeader className="pb-4">
                   <div className="flex items-center space-x-2">
                     <Building2 className="w-5 h-5 text-red-600" />
                     <CardTitle className="text-xl">Organização Responsável</CardTitle>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
                     <h3 className="font-bold text-lg mb-3 text-gray-900">
                       <Link 
                         to={`/entidades/${evento.entidades.id}`}
                         className="hover:text-red-600 transition-colors"
                       >
                         {evento.entidades.nome}
                       </Link>
                     </h3>
                     {evento.entidades.descricao_curta && (
                       <p className="text-sm text-gray-600 leading-relaxed mb-4">
                         {evento.entidades.descricao_curta}
                       </p>
                     )}
                     {evento.entidades.contato && (
                       <div className="flex items-center text-sm text-gray-600">
                         <Mail className="mr-2 h-4 w-4" />
                         {evento.entidades.contato}
                       </div>
                     )}
                   </div>
                   <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" asChild>
                     <Link to={`/entidades/${evento.entidades.id}`}>
                       Ver Perfil da Organização
                     </Link>
                   </Button>
                 </CardContent>
               </Card>
             )}

             {/* Palestrante Externo - Mostrar se houver palestrante externo (método antigo) */}
             {evento.reservas && evento.reservas.tem_palestrante_externo && evento.reservas.nome_palestrante_externo && (
               <Card className="border-0 shadow-lg bg-white">
                 <CardHeader className="pb-4">
                   <div className="flex items-center space-x-2">
                     <User className="w-5 h-5 text-red-600" />
                     <CardTitle className="text-xl">Palestrante Convidado</CardTitle>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                     <div className="flex items-start justify-between mb-3">
                       <h3 className="font-bold text-lg text-gray-900">
                         {evento.reservas.nome_palestrante_externo}
                       </h3>
                       {evento.reservas.eh_pessoa_publica && (
                         <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                           Pessoa Pública
                         </Badge>
                       )}
                     </div>
                     {evento.reservas.apresentacao_palestrante_externo && (
                       <p className="text-sm text-gray-600 leading-relaxed">
                         {evento.reservas.apresentacao_palestrante_externo}
                       </p>
                     )}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Professores Convidados - Nova seção para múltiplos professores */}
             {evento.professores_convidados && evento.professores_convidados.length > 0 && (
               <Card className="border-0 shadow-lg bg-white">
                 <CardHeader className="pb-4">
                   <div className="flex items-center space-x-2">
                     <User className="w-5 h-5 text-red-600" />
                     <CardTitle className="text-xl">
                       Professores/Palestrantes Convidados ({evento.professores_convidados.length})
                     </CardTitle>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {evento.professores_convidados.map((professor, index) => (
                     <div key={professor.id || index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                       <div className="flex items-start justify-between mb-3">
                         <h3 className="font-bold text-lg text-gray-900">
                           {professor.nome_completo || professor.nomeCompleto}
                         </h3>
                         <div className="flex gap-2">
                           {(professor.eh_pessoa_publica || professor.ehPessoaPublica) && (
                             <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                               Pessoa Pública
                             </Badge>
                           )}
                           {(professor.ha_apoio_externo || professor.haApoioExterno) && (
                             <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                               Apoio Externo
                             </Badge>
                           )}
                         </div>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed mb-3">
                         {professor.apresentacao || professor.apresentacao}
                       </p>
                       {(professor.ha_apoio_externo || professor.haApoioExterno) && (professor.como_ajudara_organizacao || professor.comoAjudaraOrganizacao) && (
                         <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                           <h4 className="font-semibold text-sm text-green-800 mb-1">Apoio da Empresa:</h4>
                           <p className="text-xs text-green-700">
                             {professor.como_ajudara_organizacao || professor.comoAjudaraOrganizacao}
                           </p>
                         </div>
                       )}
                     </div>
                   ))}
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </div>
    </div>
  );
};

export default EventoDetalhes;
