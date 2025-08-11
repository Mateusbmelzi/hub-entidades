
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
import { exportToCSV, formatDateForCSV } from '@/lib/csv-export';
import { toast } from 'sonner';

const EventoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { entidadeId, isAuthenticated } = useEntityAuth();
  const [showInscricaoDialog, setShowInscricaoDialog] = useState(false);
  const [showEntityLoginDialog, setShowEntityLoginDialog] = useState(false);

  const { data: evento, isLoading: eventoLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          entidades(id, nome, descricao_curta, contato)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
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
  const eventoAtivo = evento && evento.status === 'ativo' && isEventoAtivo(evento.data, evento.horario);
  
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Carregando evento...</p>
          <p className="text-gray-400 text-sm mt-2">Preparando os detalhes para você</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
          <p className="text-gray-600 mb-6">O evento que você está procurando não existe ou foi removido.</p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
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
      const [h = 0, min = 0] = horario.split(":");
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
      const [h = 0, min = 0] = horario.split(":");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
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
                
                <div className="flex flex-wrap items-center gap-6 text-red-100 mb-6">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {format(combineDataHorario(evento.data, evento.horario), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    {format(combineDataHorario(evento.data, evento.horario), "HH:mm", { locale: ptBR })}
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
                                    <Badge className={`${getStatusColor(evento.status, evento.data, evento.horario)} text-sm px-3 py-1`}>
                  {getStatusLabel(evento.status, evento.data, evento.horario)}
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
           </div>
         </div>
       </div>
    </div>
  );
};

export default EventoDetalhes;
