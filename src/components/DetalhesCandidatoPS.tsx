import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, User, Mail, GraduationCap, Calendar, Clock, FileText, MessageSquare } from 'lucide-react';
import { TimelineFasesPS } from './TimelineFasesPS';
import { RespostasFormularioPS } from './RespostasFormularioPS';
import { NotasAvaliacaoPS } from './NotasAvaliacaoPS';
import type { InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';

interface DetalhesCandidatoPSProps {
  candidato: InscricaoProcessoUsuario;
  onClose: () => void;
  onAprovar: () => void;
  onReprovar: () => void;
  onAdicionarNota?: (nota: number, comentario?: string) => void;
}

export function DetalhesCandidatoPS({ 
  candidato, 
  onClose, 
  onAprovar, 
  onReprovar,
  onAdicionarNota 
}: DetalhesCandidatoPSProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
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
        return <Check className="w-4 h-4" />;
      case 'reprovado':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getIniciais(candidato.nome_estudante)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span>{candidato.nome_estudante}</span>
              <Badge 
                variant="outline" 
                className={getStatusColor(candidato.status_fase || 'pendente')}
              >
                {getStatusIcon(candidato.status_fase || 'pendente')}
                <span className="ml-1 capitalize">
                  {candidato.status_fase || 'pendente'}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {candidato.curso_estudante} - {candidato.semestre_estudante}º semestre
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
              <p className="font-semibold">{candidato.nome_estudante}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p>{candidato.email_estudante}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Curso</Label>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <p>{candidato.curso_estudante}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Semestre</Label>
              <p>{candidato.semestre_estudante}º semestre</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Data de Inscrição</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p>{new Date(candidato.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Tempo na Fase Atual</Label>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p>{calcularTempoNaFase()} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fase Atual */}
        {candidato.fase_atual && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Fase Atual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{candidato.fase_atual.nome}</h4>
                  {candidato.fase_atual.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {candidato.fase_atual.descricao}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(candidato.status_fase || 'pendente')}
                >
                  {getStatusIcon(candidato.status_fase || 'pendente')}
                  <span className="ml-1 capitalize">
                    {candidato.status_fase || 'pendente'}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline de Fases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Histórico de Fases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineFasesPS candidatoId={candidato.id} />
          </CardContent>
        </Card>

        {/* Respostas do Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Respostas do Formulário</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RespostasFormularioPS respostas={candidato.respostas_formulario} />
          </CardContent>
        </Card>

        {/* Notas e Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Notas e Avaliações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotasAvaliacaoPS 
              candidatoId={candidato.id}
              onAdicionarNota={onAdicionarNota}
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DialogFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        
        {candidato.status_fase === 'pendente' && (
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              onClick={() => handleAction('reprovar')}
            >
              <X className="w-4 h-4 mr-2" />
              Reprovar
            </Button>
            <Button onClick={() => handleAction('aprovar')}>
              <Check className="w-4 h-4 mr-2" />
              Aprovar e Avançar
            </Button>
          </div>
        )}
      </DialogFooter>

      {/* Dialog de Feedback */}
      {showFeedbackDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'aprovar' ? 'Aprovar Candidato' : 'Reprovar Candidato'}
            </h3>
            
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
          </div>
        </div>
      )}
    </DialogContent>
  );
}
