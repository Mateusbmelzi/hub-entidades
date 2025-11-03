import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, GraduationCap, Calendar, Eye, Check, X, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { InscricaoProcessoUsuario } from '@/types/acompanhamento-processo';

interface EstudanteFaseCardProps {
  candidato: InscricaoProcessoUsuario;
  onAprovar: (id: string) => void;
  onReprovar: (id: string) => void;
  onVerDetalhes: (id: string) => void;
}

export function EstudanteFaseCard({
  candidato,
  onAprovar,
  onReprovar,
  onVerDetalhes
}: EstudanteFaseCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'default'; // verde
      case 'reprovado':
        return 'destructive'; // vermelho
      default:
        return 'secondary'; // amarelo/cinza
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'reprovado':
        return 'Reprovado';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const areaInteresse = candidato.respostas_formulario?.area_interesse || 
                        candidato.respostas_formulario?.['area-interesse'] ||
                        'Não especificada';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(candidato.nome_estudante)}
            </AvatarFallback>
          </Avatar>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 truncate">
                  {candidato.nome_estudante}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant={getStatusBadgeVariant(candidato.status_fase || 'pendente')}>
                    {getStatusLabel(candidato.status_fase || 'pendente')}
                  </Badge>
                    {candidato.reserva_atribuida && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <MapPin className="h-3 w-3 mr-1" /> Atribuído
                      </Badge>
                    )}
                  {areaInteresse && areaInteresse !== 'Não especificada' && (
                    <Badge variant="outline" className="text-xs">
                      {areaInteresse}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do estudante */}
            <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
              <div className="flex items-center">
                <Mail className="h-3.5 w-3.5 mr-2" />
                <span className="truncate">{candidato.email_estudante}</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="h-3.5 w-3.5 mr-2" />
                <span>
                  {candidato.curso_estudante} - {candidato.semestre_estudante}º semestre
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <span>
                  Inscrito em {format(new Date(candidato.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              {candidato.reserva_atribuida && (
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-2" />
                  <span>
                    {candidato.reserva_atribuida.data_reserva} • {candidato.reserva_atribuida.horario_inicio}-{candidato.reserva_atribuida.horario_termino}
                    {candidato.reserva_atribuida.sala_nome && ` • ${candidato.reserva_atribuida.sala_nome}`}
                  </span>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerDetalhes(candidato.id)}
                className="text-xs"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Ver Detalhes
              </Button>
              
              {candidato.status_fase === 'pendente' && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onAprovar(candidato.id)}
                    className="text-xs bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReprovar(candidato.id)}
                    className="text-xs"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reprovar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

