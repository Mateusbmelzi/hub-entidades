import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Eye, Clock, User } from 'lucide-react';
import { DetalhesCandidatoPS } from './DetalhesCandidatoPS';
import type { InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';

interface CandidatoCardPSProps {
  candidato: InscricaoProcessoUsuario;
  onAprovar: () => void;
  onReprovar: () => void;
}

export function CandidatoCardPS({ candidato, onAprovar, onReprovar }: CandidatoCardPSProps) {
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'aprovar' | 'reprovar' | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reprovado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Check className="w-3 h-3" />;
      case 'reprovado':
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const calcularTempoNaFase = () => {
    if (!candidato.fase_atual) return 0;
    const dataInicio = new Date(candidato.created_at);
    const agora = new Date();
    return Math.floor((agora.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleAction = (type: 'aprovar' | 'reprovar') => {
    setActionType(type);
    setShowFeedbackDialog(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'aprovar') {
      onAprovar();
    } else if (actionType === 'reprovar') {
      onReprovar();
    }
    setShowFeedbackDialog(false);
    setFeedback('');
    setActionType(null);
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${
        candidato.status_fase === 'aprovado' ? 'border-l-green-500' :
        candidato.status_fase === 'reprovado' ? 'border-l-red-500' :
        'border-l-yellow-500'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getIniciais(candidato.nome_estudante)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm truncate">
                  {candidato.nome_estudante}
                </h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(candidato.status_fase || 'pendente')}`}
                >
                  {getStatusIcon(candidato.status_fase || 'pendente')}
                  <span className="ml-1 capitalize">
                    {candidato.status_fase || 'pendente'}
                  </span>
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="truncate">{candidato.curso_estudante}</p>
                <p>{candidato.semestre_estudante}º semestre</p>
                <p className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {calcularTempoNaFase()} dias na fase
                </p>
              </div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DetalhesCandidatoPS
                  candidato={candidato}
                  onClose={() => {}}
                  onAprovar={onAprovar}
                  onReprovar={onReprovar}
                />
              </DialogContent>
            </Dialog>
            
            {candidato.status_fase === 'pendente' && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleAction('aprovar')}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleAction('reprovar')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Feedback */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprovar' ? 'Aprovar Candidato' : 'Reprovar Candidato'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback (opcional)</Label>
              <Textarea
                id="feedback"
                placeholder="Adicione um comentário sobre a decisão..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAction}
                variant={actionType === 'aprovar' ? 'default' : 'destructive'}
              >
                {actionType === 'aprovar' ? 'Aprovar' : 'Reprovar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
