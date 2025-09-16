import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { useSalas } from '@/hooks/useSalas';
import { useAlterarSalaReserva } from '@/hooks/useAlterarSalaReserva';
import { ReservaDetalhada } from '@/types/reserva';

interface AlterarSalaModalProps {
  reserva: ReservaDetalhada | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AlterarSalaModal: React.FC<AlterarSalaModalProps> = ({
  reserva,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [salaSelecionada, setSalaSelecionada] = useState<string>('');
  const [motivo, setMotivo] = useState('');
  const [filtroPredio, setFiltroPredio] = useState<string>('');
  const [filtroCapacidade, setFiltroCapacidade] = useState<string>('');
  const [busca, setBusca] = useState('');

  const { salas, loading: salasLoading, getSalasDisponiveis, getSalasPorPredio } = useSalas();
  const { alterarSalaReserva, loading: alterandoSala, error } = useAlterarSalaReserva();

  // Resetar estado quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setSalaSelecionada('');
      setMotivo('');
      setFiltroPredio('');
      setFiltroCapacidade('');
      setBusca('');
    }
  }, [isOpen]);

  // Filtrar salas disponíveis
  const salasDisponiveis = React.useMemo(() => {
    if (!reserva) return [];

    let salasFiltradas = getSalasDisponiveis(reserva.quantidade_pessoas, filtroPredio && filtroPredio !== 'all' ? filtroPredio : undefined);

    // Filtrar por capacidade mínima se especificado
    if (filtroCapacidade && filtroCapacidade !== 'all') {
      const capacidadeMinima = parseInt(filtroCapacidade);
      salasFiltradas = salasFiltradas.filter(sala => sala.capacidade >= capacidadeMinima);
    }

    // Filtrar por busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      salasFiltradas = salasFiltradas.filter(sala => 
        sala.sala.toLowerCase().includes(buscaLower) ||
        sala.predio.toLowerCase().includes(buscaLower) ||
        sala.andar.toLowerCase().includes(buscaLower)
      );
    }

    return salasFiltradas;
  }, [salas, reserva, filtroPredio, filtroCapacidade, busca, getSalasDisponiveis]);

  const predios = React.useMemo(() => {
    const salasPorPredio = getSalasPorPredio();
    return Object.keys(salasPorPredio).sort();
  }, [getSalasPorPredio]);

  const handleAlterarSala = async () => {
    if (!reserva || !salaSelecionada) return;

    console.log('🔄 Iniciando alteração de sala no modal:', {
      reservaId: reserva.id,
      novaSalaId: parseInt(salaSelecionada),
      motivo: motivo.trim() || undefined
    });

    const resultado = await alterarSalaReserva({
      reservaId: reserva.id,
      novaSalaId: parseInt(salaSelecionada),
      motivo: motivo.trim() || undefined
    });

    console.log('📊 Resultado da alteração:', resultado);

    if (resultado.success) {
      console.log('✅ Alteração bem-sucedida, fechando modal');
      
      // Mostrar notificação de sucesso
      alert(`✅ Sala alterada com sucesso!\n\nNova sala: ${resultado.novaSala.nome}\nPrédio: ${resultado.novaSala.predio}\nAndar: ${resultado.novaSala.andar}\nCapacidade: ${resultado.novaSala.capacidade} pessoas\n\nA reserva e o evento relacionado foram atualizados.`);
      
      onSuccess?.();
      onClose();
    } else {
      console.error('❌ Falha na alteração:', resultado.message);
      alert(`❌ Erro ao alterar sala: ${resultado.message}`);
    }
  };

  const salaAtual = reserva ? {
    nome: reserva.sala_nome || 'Não definida',
    predio: reserva.sala_predio || 'Não definido',
    andar: reserva.sala_andar || 'Não definido',
    capacidade: reserva.sala_capacidade || 0
  } : null;

  if (!reserva) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Alterar Sala da Reserva
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova sala para esta reserva. A sala deve ter capacidade suficiente e não ter conflitos de horário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Reserva */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Informações da Reserva</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Evento</div>
                <div className="text-sm text-gray-600">{reserva.nome_evento || 'Sem nome'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Data e Horário</div>
                <div className="text-sm text-gray-600">
                  {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')} - {reserva.horario_inicio} às {reserva.horario_termino}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Quantidade de Pessoas</div>
                <div className="text-sm text-gray-600">{reserva.quantidade_pessoas} pessoas</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Tipo</div>
                <div className="text-sm text-gray-600">
                  {reserva.tipo_reserva === 'sala' ? 'Sala' : 'Auditório'}
                </div>
              </div>
            </div>
          </div>

          {/* Sala Atual */}
          {salaAtual && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sala Atual
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-blue-800">Sala/Auditório</div>
                  <div className="text-sm text-blue-600">{salaAtual.nome}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Prédio</div>
                  <div className="text-sm text-blue-600">{salaAtual.predio}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Andar</div>
                  <div className="text-sm text-blue-600">{salaAtual.andar}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Capacidade</div>
                  <div className="text-sm text-blue-600">{salaAtual.capacidade} pessoas</div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="busca"
                    type="text"
                    placeholder="Nome da sala, prédio ou andar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="predio">Prédio</Label>
                <Select value={filtroPredio} onValueChange={setFiltroPredio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os prédios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os prédios</SelectItem>
                    {predios.map(predio => (
                      <SelectItem key={predio} value={predio}>{predio}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacidade">Capacidade Mínima</Label>
                <Select value={filtroCapacidade} onValueChange={setFiltroCapacidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer capacidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer capacidade</SelectItem>
                    <SelectItem value="10">10+ pessoas</SelectItem>
                    <SelectItem value="20">20+ pessoas</SelectItem>
                    <SelectItem value="50">50+ pessoas</SelectItem>
                    <SelectItem value="100">100+ pessoas</SelectItem>
                    <SelectItem value="200">200+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seleção de Nova Sala */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Selecionar Nova Sala</h3>
            {salasLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Carregando salas...</p>
              </div>
            ) : salasDisponiveis.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma sala disponível encontrada com os filtros aplicados.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {salasDisponiveis.map((sala) => (
                  <div
                    key={sala.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      salaSelecionada === sala.id.toString()
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSalaSelecionada(sala.id.toString())}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{sala.sala}</div>
                        <div className="text-sm text-gray-600">{sala.predio} - {sala.andar}º andar</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {sala.capacidade} pessoas
                          </Badge>
                          {sala.capacidade >= reserva.quantidade_pessoas && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Adequada
                            </Badge>
                          )}
                        </div>
                      </div>
                      {salaSelecionada === sala.id.toString() && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Motivo da Alteração */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Alteração (Opcional)</Label>
            <Textarea
              id="motivo"
              placeholder="Explique o motivo da alteração da sala..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={alterandoSala}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAlterarSala}
            disabled={!salaSelecionada || alterandoSala}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {alterandoSala ? 'Alterando...' : 'Alterar Sala'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
