import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

interface ConnectionFallbackProps {
  error?: string | null;
  onRetry?: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

export function ConnectionFallback({ 
  error, 
  onRetry, 
  children, 
  title = "Problema de Conectividade",
  description = "Estamos enfrentando problemas temporários de conectividade."
}: ConnectionFallbackProps) {
  if (!error) return <>{children}</>;

  const isInsufficientResources = error.includes('INSUFFICIENT_RESOURCES');
  const isNetworkError = error.includes('network') || error.includes('fetch');

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6">
      <Alert className="max-w-md">
        <div className="flex items-center space-x-2">
          {isInsufficientResources ? (
            <WifiOff className="h-4 w-4 text-orange-600" />
          ) : isNetworkError ? (
            <Wifi className="h-4 w-4 text-red-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className="mt-2">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isInsufficientResources 
                  ? 'O servidor está temporariamente sobrecarregado. Tente novamente em alguns instantes.'
                  : isNetworkError
                  ? 'Verifique sua conexão com a internet e tente novamente.'
                  : description
                }
              </p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
} 