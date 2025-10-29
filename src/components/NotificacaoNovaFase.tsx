import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import { FormularioFaseProcesso } from './FormularioFaseProcesso';
import type { FasePendente } from '@/hooks/useFasesPendentes';

interface NotificacaoNovaFaseProps {
  fasePendente: FasePendente;
  onComplete?: () => void;
  onDismiss?: (id: string) => void;
}

export function NotificacaoNovaFase({ fasePendente, onComplete, onDismiss }: NotificacaoNovaFaseProps) {
  const [showFormulario, setShowFormulario] = useState(false);

  const handleSuccess = () => {
    setShowFormulario(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(fasePendente.inscricaoFaseId);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Você foi aprovado para a próxima fase!
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {fasePendente.entidadeNome}
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{fasePendente.fase.nome}</p>
              {fasePendente.fase.descricao && (
                <p className="text-sm text-gray-600 mt-1">{fasePendente.fase.descricao}</p>
              )}
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Formulário Pendente
            </Badge>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setShowFormulario(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Preencher Formulário
            </Button>
          </div>

          {fasePendente.fase.data_inicio && fasePendente.fase.data_fim && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>
                Período: {new Date(fasePendente.fase.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                {new Date(fasePendente.fase.data_fim).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal com formulário */}
      <Dialog open={showFormulario} onOpenChange={setShowFormulario}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Formulário - {fasePendente.fase.nome}</DialogTitle>
          </DialogHeader>
          <FormularioFaseProcesso
            inscricaoFaseId={fasePendente.inscricaoFaseId}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

