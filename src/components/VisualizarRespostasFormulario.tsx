import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFormularioFase } from '@/hooks/useFormularioFase';
import { Loader2, FileText, Calendar, User } from 'lucide-react';
import { CAMPOS_BASICOS_LABELS, TIPOS_CAMPO_LABELS } from '@/types/template-formulario';
import type { CampoBasico } from '@/types/template-formulario';

interface VisualizarRespostasFormularioProps {
  inscricaoFaseId: string;
  open: boolean;
  onClose: () => void;
}

export function VisualizarRespostasFormulario({
  inscricaoFaseId,
  open,
  onClose,
}: VisualizarRespostasFormularioProps) {
  const { inscricaoFase, fase, template, respostas, loading } = useFormularioFase(inscricaoFaseId);

  if (!open) return null;

  const formatarResposta = (tipo: string, valor: any): string => {
    if (valor === null || valor === undefined || valor === '') {
      return '—';
    }

    switch (tipo) {
      case 'checkbox':
        return valor === true || valor === 'true' ? 'Sim' : 'Não';
      case 'date':
        try {
          return new Date(valor).toLocaleDateString('pt-BR');
        } catch {
          return valor.toString();
        }
      default:
        return valor.toString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Respostas do Formulário
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações da Fase */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fase</p>
                    <p className="text-base font-semibold text-gray-900">{fase?.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge
                      className={
                        inscricaoFase?.formulario_preenchido
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }
                    >
                      {inscricaoFase?.formulario_preenchido ? 'Preenchido' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                {inscricaoFase?.created_at && (
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Data de preenchimento:{' '}
                    {new Date(inscricaoFase.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {!template ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Esta fase não possui formulário configurado.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Campos Básicos */}
                {template.campos_basicos_visiveis.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-600" />
                      Informações Básicas
                    </h3>
                    <Card>
                      <CardContent className="pt-4 space-y-4">
                        {template.campos_basicos_visiveis.map((campo, index) => (
                          <div key={campo}>
                            {index > 0 && <Separator />}
                            <div className="py-2">
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                {CAMPOS_BASICOS_LABELS[campo as CampoBasico]}
                              </p>
                              <p className="text-base text-gray-900">
                                {respostas[campo] || '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Campos Personalizados */}
                {template.campos_personalizados.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Informações Adicionais
                    </h3>
                    <Card>
                      <CardContent className="pt-4 space-y-4">
                        {template.campos_personalizados.map((campo, index) => (
                          <div key={campo.id}>
                            {index > 0 && <Separator />}
                            <div className="py-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-600">
                                  {campo.label}
                                  {campo.obrigatorio && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {TIPOS_CAMPO_LABELS[campo.tipo]}
                                </Badge>
                              </div>
                              <p className="text-base text-gray-900 whitespace-pre-wrap">
                                {formatarResposta(campo.tipo, respostas[campo.id])}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

