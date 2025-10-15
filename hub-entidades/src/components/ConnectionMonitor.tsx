import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useConnectionMonitor, checkConnectionManually } from '@/lib/supabase-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ConnectionMonitorProps {
  enabled?: boolean;
}

export const ConnectionMonitor: React.FC<ConnectionMonitorProps> = ({ enabled = true }) => {
  const { isConnected, lastCheck } = useConnectionMonitor();
  const [showWarning, setShowWarning] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Se o monitor estiver desabilitado, não renderizar nada
  if (!enabled) {
    return null;
  }

  useEffect(() => {
    if (!isConnected && !showWarning) {
      setShowWarning(true);
      // Notificação mais discreta
      toast.warning('Problemas de conectividade detectados.', {
        duration: 5000,
        action: {
          label: 'Verificar',
          onClick: () => handleRetry()
        }
      });
    } else if (isConnected && showWarning) {
      setShowWarning(false);
      toast.success('Conexão restaurada!');
    }
  }, [isConnected, showWarning]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Forçar uma nova verificação de conectividade sem recarregar a página
      const isConnected = await checkConnectionManually();
      
      if (isConnected) {
        toast.success('Conexão restaurada!');
        setShowWarning(false);
      } else {
        toast.error('Ainda há problemas de conectividade. Tente novamente em alguns segundos.');
      }
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error);
      toast.error('Erro ao verificar conectividade. Tente novamente.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isConnected) {
    return null; // Não mostrar nada quando conectado
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <WifiOff className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-amber-800">
                Problemas de conexão
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-5 w-5 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Última verificação: {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 