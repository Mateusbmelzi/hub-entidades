import { useNavigate } from 'react-router-dom';
import { DadosEvento } from '@/components/PreencherReservaComEvento';

export const useNavigateToReservaForm = () => {
  const navigate = useNavigate();
  
  return {
    navegarParaSala: (entidadeId: number, dadosEvento?: DadosEvento) => {
      navigate(`/entidades/${entidadeId}/reservar/sala`, { 
        state: { dadosEvento } 
      });
    },
    navegarParaAuditorio: (entidadeId: number, dadosEvento?: DadosEvento) => {
      navigate(`/entidades/${entidadeId}/reservar/auditorio`, { 
        state: { dadosEvento } 
      });
    }
  };
};