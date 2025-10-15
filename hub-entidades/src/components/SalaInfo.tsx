import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users } from 'lucide-react';

interface SalaInfoProps {
  salaId?: number;
  salaNome?: string;
  salaPredio?: string;
  salaAndar?: string;
  capacidade?: number;
  className?: string;
  // Para compatibilidade com eventos
  evento?: {
    sala_id?: number | null;
    sala_nome?: string | null;
    sala_predio?: string | null;
    sala_andar?: string | null;
    sala_capacidade?: number | null;
  };
}

export const SalaInfo: React.FC<SalaInfoProps> = ({
  salaId,
  salaNome,
  salaPredio,
  salaAndar,
  capacidade,
  className = '',
  evento
}) => {
  // Usar dados do evento se disponíveis, senão usar props diretas
  const finalSalaId = evento?.sala_id || salaId;
  const finalSalaNome = evento?.sala_nome || salaNome;
  const finalSalaPredio = evento?.sala_predio || salaPredio;
  const finalSalaAndar = evento?.sala_andar || salaAndar;
  const finalCapacidade = evento?.sala_capacidade || capacidade;

  if (!finalSalaId || !finalSalaNome) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{finalSalaNome}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{finalSalaPredio}</span>
          {finalSalaAndar && (
            <>
              <span>•</span>
              <span>{finalSalaAndar}</span>
            </>
          )}
          {finalCapacidade && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{finalCapacidade} pessoas</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaInfo;
