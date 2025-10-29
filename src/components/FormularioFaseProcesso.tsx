import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormularioFase } from '@/hooks/useFormularioFase';
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CampoBasico } from '@/types/template-formulario';
import { CAMPOS_BASICOS_LABELS } from '@/types/template-formulario';

interface FormularioFaseProcessoProps {
  inscricaoFaseId: string;
  onSuccess?: () => void;
}

export function FormularioFaseProcesso({ inscricaoFaseId, onSuccess }: FormularioFaseProcessoProps) {
  const {
    inscricaoFase,
    fase,
    template,
    respostas: respostasSalvas,
    loading,
    saving,
    salvarRespostas,
  } = useFormularioFase(inscricaoFaseId);

  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (respostasSalvas) {
      setRespostas(respostasSalvas);
    }
  }, [respostasSalvas]);

  const handleCampoChange = (campoId: string, valor: any) => {
    setRespostas({ ...respostas, [campoId]: valor });
    // Limpar erro ao modificar campo
    if (erros[campoId]) {
      setErros({ ...erros, [campoId]: '' });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!template) return true;

    // Validar campos básicos obrigatórios
    template.campos_basicos_visiveis.forEach((campo) => {
      if (!respostas[campo] || respostas[campo].toString().trim() === '') {
        novosErros[campo] = 'Este campo é obrigatório';
      }
    });

    // Validar campos personalizados obrigatórios
    template.campos_personalizados.forEach((campo) => {
      if (campo.obrigatorio) {
        const valor = respostas[campo.id];
        if (valor === undefined || valor === null || valor.toString().trim() === '') {
          novosErros[campo.id] = 'Este campo é obrigatório';
        }
      }
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const result = await salvarRespostas(respostas, true); // true = marcar como preenchido
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!template) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta fase não possui formulário configurado.
        </AlertDescription>
      </Alert>
    );
  }

  if (inscricaoFase?.formulario_preenchido) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Você já preencheu o formulário desta fase! A entidade está avaliando suas respostas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {fase?.nome || 'Formulário da Fase'}
        </CardTitle>
        <CardDescription>
          {fase?.descricao || 'Preencha todos os campos obrigatórios para continuar no processo seletivo'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Básicos */}
          {template.campos_basicos_visiveis.map((campoBasico) => (
            <div key={campoBasico} className="space-y-2">
              <Label htmlFor={campoBasico}>
                {CAMPOS_BASICOS_LABELS[campoBasico as CampoBasico]} <span className="text-red-500">*</span>
              </Label>
              <Input
                id={campoBasico}
                value={respostas[campoBasico] || ''}
                onChange={(e) => handleCampoChange(campoBasico, e.target.value)}
                placeholder={`Digite seu ${CAMPOS_BASICOS_LABELS[campoBasico as CampoBasico].toLowerCase()}`}
                className={erros[campoBasico] ? 'border-red-500' : ''}
              />
              {erros[campoBasico] && (
                <p className="text-sm text-red-500">{erros[campoBasico]}</p>
              )}
            </div>
          ))}

          {/* Campos Personalizados */}
          {template.campos_personalizados.map((campo) => {
            const valor = respostas[campo.id];

            return (
              <div key={campo.id} className="space-y-2">
                <Label htmlFor={campo.id}>
                  {campo.label} {campo.obrigatorio && <span className="text-red-500">*</span>}
                </Label>

                {campo.tipo === 'text' && (
                  <Input
                    id={campo.id}
                    value={valor || ''}
                    onChange={(e) => handleCampoChange(campo.id, e.target.value)}
                    placeholder={campo.placeholder}
                    className={erros[campo.id] ? 'border-red-500' : ''}
                  />
                )}

                {campo.tipo === 'textarea' && (
                  <Textarea
                    id={campo.id}
                    value={valor || ''}
                    onChange={(e) => handleCampoChange(campo.id, e.target.value)}
                    placeholder={campo.placeholder}
                    rows={4}
                    className={erros[campo.id] ? 'border-red-500' : ''}
                  />
                )}

                {campo.tipo === 'select' && (
                  <Select
                    value={valor || ''}
                    onValueChange={(value) => handleCampoChange(campo.id, value)}
                  >
                    <SelectTrigger className={erros[campo.id] ? 'border-red-500' : ''}>
                      <SelectValue placeholder={campo.placeholder || 'Selecione uma opção'} />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.opcoes?.map((opcao) => (
                        <SelectItem key={opcao} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {campo.tipo === 'checkbox' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={campo.id}
                      checked={valor === true}
                      onCheckedChange={(checked) => handleCampoChange(campo.id, checked)}
                    />
                    <label
                      htmlFor={campo.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {campo.placeholder || 'Sim'}
                    </label>
                  </div>
                )}

                {campo.tipo === 'number' && (
                  <Input
                    id={campo.id}
                    type="number"
                    value={valor || ''}
                    onChange={(e) => handleCampoChange(campo.id, e.target.value)}
                    placeholder={campo.placeholder}
                    className={erros[campo.id] ? 'border-red-500' : ''}
                  />
                )}

                {campo.tipo === 'date' && (
                  <Input
                    id={campo.id}
                    type="date"
                    value={valor || ''}
                    onChange={(e) => handleCampoChange(campo.id, e.target.value)}
                    className={erros[campo.id] ? 'border-red-500' : ''}
                  />
                )}

                {erros[campo.id] && (
                  <p className="text-sm text-red-500">{erros[campo.id]}</p>
                )}
              </div>
            );
          })}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enviar Formulário
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

