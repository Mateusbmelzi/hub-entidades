import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Download, Users, CheckCircle, Clock, XCircle, MoreVertical, Eye, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInscritosEvento, InscritoEvento } from '@/hooks/useInscritosEvento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GerenciarInscritosEventoProps {
  eventoId: string;
}

export function GerenciarInscritosEvento({ eventoId }: GerenciarInscritosEventoProps) {
  const [selectedInscrito, setSelectedInscrito] = useState<InscritoEvento | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    inscritos,
    stats,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    updateStatusInscrito,
    removeInscrito,
    exportToCSV
  } = useInscritosEvento(eventoId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        );
      case 'lista_espera':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Lista de Espera
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const handleStatusChange = async (inscritoId: string, novoStatus: 'confirmado' | 'cancelado' | 'lista_espera') => {
    await updateStatusInscrito(inscritoId, novoStatus);
  };

  const handleRemoveInscrito = async (inscritoId: string) => {
    await removeInscrito(inscritoId);
  };

  const showInscritoDetails = (inscrito: InscritoEvento) => {
    setSelectedInscrito(inscrito);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Lista de Espera</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lista_espera}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Inscritos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, email ou curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="filter">Filtrar por Status</Label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="confirmados">Confirmados</SelectItem>
                  <SelectItem value="lista_espera">Lista de Espera</SelectItem>
                  <SelectItem value="cancelados">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Inscritos */}
          {inscritos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filter !== 'todos' 
                  ? 'Nenhum inscrito encontrado com os filtros aplicados.'
                  : 'Nenhuma inscrição realizada ainda.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscritos.map((inscrito) => (
                    <TableRow key={inscrito.id}>
                      <TableCell className="font-medium">
                        {inscrito.numero_inscricao}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inscrito.nome_completo}</p>
                          {inscrito.semestre && (
                            <p className="text-sm text-gray-500">
                              {inscrito.curso} - {inscrito.semestre}º semestre
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{inscrito.email}</TableCell>
                      <TableCell>{inscrito.curso || '-'}</TableCell>
                      <TableCell>{getStatusBadge(inscrito.status)}</TableCell>
                      <TableCell>
                        {format(new Date(inscrito.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => showInscritoDetails(inscrito)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            
                            {inscrito.status !== 'confirmado' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(inscrito.id, 'confirmado')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            
                            {inscrito.status !== 'lista_espera' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(inscrito.id, 'lista_espera')}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Lista de Espera
                              </DropdownMenuItem>
                            )}
                            
                            {inscrito.status !== 'cancelado' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(inscrito.id, 'cancelado')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remover
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover a inscrição de "{inscrito.nome_completo}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveInscrito(inscrito.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedInscrito && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Inscrição</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                  <p className="text-lg">{selectedInscrito.nome_completo}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-lg">{selectedInscrito.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Curso</Label>
                  <p className="text-lg">{selectedInscrito.curso || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Semestre</Label>
                  <p className="text-lg">{selectedInscrito.semestre || 'Não informado'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInscrito.status)}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Inscrição</Label>
                  <p className="text-lg">
                    {format(new Date(selectedInscrito.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Campos Personalizados */}
              {selectedInscrito.campos_adicionais && Object.keys(selectedInscrito.campos_adicionais).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Informações Adicionais</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedInscrito.campos_adicionais).map(([campo, valor]) => (
                      <div key={campo} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{campo}:</span>
                        <span className="text-gray-900">
                          {typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : String(valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
