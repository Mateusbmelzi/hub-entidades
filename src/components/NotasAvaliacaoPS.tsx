import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Plus, Star, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { NotaAvaliacao } from '@/types/acompanhamento-processo';

interface NotasAvaliacaoPSProps {
  candidatoId: string;
  onAdicionarNota?: (nota: number, comentario?: string) => void;
}

export function NotasAvaliacaoPS({ candidatoId, onAdicionarNota }: NotasAvaliacaoPSProps) {
  const [notas, setNotas] = useState<NotaAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [novaNota, setNovaNota] = useState('');
  const [novoComentario, setNovoComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotas();
  }, [candidatoId]);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notas_avaliacao_ps')
        .select(`
          *,
          avaliador:profiles(nome, email)
        `)
        .eq('candidato_id', candidatoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarNota = async () => {
    if (!novaNota || isNaN(Number(novaNota))) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('notas_avaliacao_ps')
        .insert({
          candidato_id: candidatoId,
          avaliador_id: (await supabase.auth.getUser()).data.user?.id,
          nota: Number(novaNota),
          comentario: novoComentario || null
        });

      if (error) throw error;

      // Chamar callback se fornecido
      if (onAdicionarNota) {
        onAdicionarNota(Number(novaNota), novoComentario);
      }

      // Limpar formulário e fechar dialog
      setNovaNota('');
      setNovoComentario('');
      setShowAddDialog(false);
      
      // Recarregar notas
      await fetchNotas();
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
      setError('Erro ao adicionar nota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoverNota = async (notaId: string) => {
    try {
      const { error } = await supabase
        .from('notas_avaliacao_ps')
        .delete()
        .eq('id', notaId);

      if (error) throw error;
      await fetchNotas();
    } catch (err) {
      console.error('Erro ao remover nota:', err);
      setError('Erro ao remover nota');
    }
  };

  const calcularMedia = () => {
    if (notas.length === 0) return 0;
    const soma = notas.reduce((acc, nota) => acc + nota.nota, 0);
    return soma / notas.length;
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 8) return 'text-green-600 bg-green-100';
    if (nota >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getNotaIcon = (nota: number) => {
    if (nota >= 8) return <Star className="w-4 h-4 text-green-600" />;
    if (nota >= 6) return <Star className="w-4 h-4 text-yellow-600" />;
    return <Star className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Notas e Avaliações</span>
        </h4>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nota</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nota">Nota (0-10)</Label>
                <Input
                  id="nota"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Ex: 8.5"
                />
              </div>
              
              <div>
                <Label htmlFor="comentario">Comentário (opcional)</Label>
                <Textarea
                  id="comentario"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Adicione um comentário sobre a avaliação..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAdicionarNota}
                  disabled={submitting || !novaNota}
                >
                  {submitting ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo das Notas */}
      {notas.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notas.length}
                </div>
                <div className="text-blue-700 text-sm">Total de Notas</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getNotaColor(calcularMedia())}`}>
                  {calcularMedia().toFixed(1)}
                </div>
                <div className="text-blue-700 text-sm">Média Geral</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...notas.map(n => n.nota))}
                </div>
                <div className="text-blue-700 text-sm">Maior Nota</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Notas */}
      <div className="space-y-3">
        {notas.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Nenhuma nota registrada</p>
          </div>
        ) : (
          notas.map((nota) => (
            <Card key={nota.id} className="hover:shadow-sm transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getNotaColor(nota.nota)}`}>
                      {getNotaIcon(nota.nota)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl font-bold">{nota.nota}</span>
                        <Badge variant="outline" className={getNotaColor(nota.nota)}>
                          {nota.nota >= 8 ? 'Excelente' : 
                           nota.nota >= 6 ? 'Bom' : 'Precisa Melhorar'}
                        </Badge>
                      </div>
                      
                      {nota.comentario && (
                        <p className="text-sm text-gray-700 mb-2">{nota.comentario}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{nota.avaliador?.nome || 'Avaliador'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(nota.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoverNota(nota.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
