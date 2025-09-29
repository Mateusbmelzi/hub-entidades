import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin, Users } from 'lucide-react';
import { useSalas } from '@/hooks/useSalas';

interface SalaSelectorProps {
  tipo: 'sala' | 'auditorio';
  quantidadePessoas?: number;
  salaId?: number;
  onSalaChange: (salaId: number | undefined) => void;
  errors?: Record<string, string>;
  className?: string;
}

export const SalaSelector: React.FC<SalaSelectorProps> = ({
  tipo,
  quantidadePessoas,
  salaId,
  onSalaChange,
  errors = {},
  className = ''
}) => {
  const { salas, loading: salasLoading, getSalasDisponiveis } = useSalas();
  const [filtroPredio, setFiltroPredio] = useState<string>('all');
  const [filtroAndar, setFiltroAndar] = useState<string>('all');

  // Filtrar salas por tipo (sala ou auditório)
  const salasPorTipo = useMemo(() => {
    if (tipo === 'auditorio') {
      return salas.filter(sala => 
        sala.sala.toLowerCase().includes('auditório') || 
        sala.sala.toLowerCase().includes('auditorio')
      );
    }
    return salas.filter(sala => 
      !sala.sala.toLowerCase().includes('auditório') && 
      !sala.sala.toLowerCase().includes('auditorio')
    );
  }, [salas, tipo]);

  // Filtrar por capacidade se especificada
  const salasBase = useMemo(() => {
    if (quantidadePessoas) {
      return getSalasDisponiveis(quantidadePessoas, undefined, salasPorTipo);
    }
    return salasPorTipo;
  }, [quantidadePessoas, getSalasDisponiveis, salasPorTipo]);

  // Obter prédios únicos
  const prediosUnicos = useMemo(() => {
    return [...new Set(salasBase.map(sala => sala.predio))].sort();
  }, [salasBase]);

  // Obter andares únicos baseados no prédio selecionado
  const andaresUnicos = useMemo(() => {
    const salasFiltradas = filtroPredio && filtroPredio !== 'all'
      ? salasBase.filter(sala => sala.predio === filtroPredio)
      : salasBase;
    return [...new Set(salasFiltradas.map(sala => sala.andar))].sort();
  }, [salasBase, filtroPredio]);

  // Filtrar salas finais
  const salasFiltradas = useMemo(() => {
    return salasBase.filter(sala => {
      const predioMatch = !filtroPredio || filtroPredio === 'all' || sala.predio === filtroPredio;
      const andarMatch = !filtroAndar || filtroAndar === 'all' || sala.andar === filtroAndar;
      return predioMatch && andarMatch;
    });
  }, [salasBase, filtroPredio, filtroAndar]);

  // Resetar filtros quando quantidade de pessoas muda
  useEffect(() => {
    setFiltroPredio('all');
    setFiltroAndar('all');
  }, [quantidadePessoas]);

  // Resetar andar quando prédio muda
  useEffect(() => {
    setFiltroAndar('all');
  }, [filtroPredio]);

  // Resetar seleção quando filtros mudam
  useEffect(() => {
    if (salaId) {
      const salaSelecionada = salasFiltradas.find(sala => sala.id === salaId);
      if (!salaSelecionada) {
        onSalaChange(undefined);
      }
    }
  }, [filtroPredio, filtroAndar, salaId, salasFiltradas, onSalaChange]);

  const handleSalaChange = (value: string) => {
    if (value === '') {
      onSalaChange(undefined);
    } else {
      onSalaChange(parseInt(value));
    }
  };

  const salaSelecionada = salasFiltradas.find(sala => sala.id === salaId);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          Selecionar {tipo === 'auditorio' ? 'Auditório' : 'Sala'}
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="filtro-predio" className="text-xs text-muted-foreground">
            Prédio
          </Label>
          <Select value={filtroPredio} onValueChange={setFiltroPredio}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os prédios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os prédios</SelectItem>
              {prediosUnicos.map((predio) => (
                <SelectItem key={predio} value={predio}>
                  {predio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="filtro-andar" className="text-xs text-muted-foreground">
            Andar
          </Label>
          <Select value={filtroAndar} onValueChange={setFiltroAndar}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os andares" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os andares</SelectItem>
              {andaresUnicos.map((andar) => (
                <SelectItem key={andar} value={andar}>
                  {andar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seleção da Sala */}
      <div>
        <Label htmlFor="sala" className="text-sm font-medium">
          {tipo === 'auditorio' ? 'Auditório' : 'Sala'} *
        </Label>
        <Select
          value={salaId?.toString() || ''}
          onValueChange={handleSalaChange}
        >
          <SelectTrigger className={errors.sala_id ? 'border-red-500' : ''}>
            <SelectValue 
              placeholder={
                salasLoading 
                  ? 'Carregando...' 
                  : `Escolha um ${tipo === 'auditorio' ? 'auditório' : 'sala'} disponível...`
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {salasFiltradas.length === 0 ? (
              <SelectItem value="no-rooms" disabled>
                {salasLoading 
                  ? 'Carregando...' 
                  : 'Nenhuma sala disponível para os filtros selecionados'
                }
              </SelectItem>
            ) : (
              salasFiltradas.map((sala) => (
                <SelectItem key={sala.id} value={sala.id.toString()}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{sala.sala}</span>
                    <span className="text-muted-foreground">
                      - {sala.predio} ({sala.andar})
                    </span>
                    <span className="text-muted-foreground">
                      - <Users className="h-3 w-3 inline mr-1" />
                      {sala.capacidade}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {errors.sala_id && (
          <p className="text-sm text-red-500 mt-1">{errors.sala_id}</p>
        )}
      </div>

      {/* Informações da sala selecionada */}
      {salaSelecionada && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              {salaSelecionada.sala}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>
              <span className="font-medium">Prédio:</span> {salaSelecionada.predio}
            </div>
            <div>
              <span className="font-medium">Andar:</span> {salaSelecionada.andar}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Capacidade:</span> {salaSelecionada.capacidade} pessoas
            </div>
          </div>
        </div>
      )}

      {/* Contador de salas */}
      <p className="text-xs text-muted-foreground">
        {salasFiltradas.length} {tipo === 'auditorio' ? 'auditório(s)' : 'sala(s)'} encontrada(s)
        {quantidadePessoas && ` com capacidade ≥ ${quantidadePessoas}`}
      </p>
    </div>
  );
};
