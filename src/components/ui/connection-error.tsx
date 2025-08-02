import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

interface ConnectionErrorProps {
  error?: string | null;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function ConnectionError({ error, onRetry, children }: ConnectionErrorProps) {
  if (!error) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="mt-2">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {error.includes('INSUFFICIENT_RESOURCES') 
                ? 'O servidor está temporariamente sobrecarregado. Tente novamente em alguns instantes.'
                : 'Houve um problema de conectividade. Verifique sua conexão e tente novamente.'
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
      </Alert>
    </div>
  );
} 