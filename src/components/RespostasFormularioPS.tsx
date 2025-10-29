import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RespostasFormularioPSProps {
  respostas: Record<string, any>;
}

export function RespostasFormularioPS({ respostas }: RespostasFormularioPSProps) {
  if (!respostas || Object.keys(respostas).length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">Nenhuma resposta de formulário disponível</p>
      </div>
    );
  }

  const formatarResposta = (valor: any): string => {
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }
    if (typeof valor === 'object' && valor !== null) {
      return JSON.stringify(valor, null, 2);
    }
    return String(valor);
  };

  const getTipoResposta = (valor: any): 'texto' | 'multipla' | 'booleana' | 'objeto' => {
    if (typeof valor === 'boolean') return 'booleana';
    if (Array.isArray(valor)) return 'multipla';
    if (typeof valor === 'object' && valor !== null) return 'objeto';
    return 'texto';
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'booleana':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'multipla':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'objeto':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'booleana':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'multipla':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'objeto':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'booleana':
        return 'Sim/Não';
      case 'multipla':
        return 'Múltipla Escolha';
      case 'objeto':
        return 'Objeto JSON';
      default:
        return 'Texto';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg">Respostas do Formulário</h4>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {Object.keys(respostas).length} pergunta(s)
        </Badge>
      </div>

      <Separator />

      <div className="space-y-4">
        {Object.entries(respostas).map(([pergunta, resposta], index) => {
          const tipo = getTipoResposta(resposta);
          const respostaFormatada = formatarResposta(resposta);
          
          return (
            <Card key={pergunta} className="hover:shadow-sm transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Pergunta {index + 1}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTipoBadge(tipo)}`}
                    >
                      {getTipoIcon(tipo)}
                      <span className="ml-1">{getTipoLabel(tipo)}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">{pergunta}</h5>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {respostaFormatada}
                      </p>
                    </div>
                  </div>
                  
                  {/* Informações adicionais */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tipo: {tipo}</span>
                    <span>
                      {typeof resposta === 'string' ? `${resposta.length} caracteres` : 
                       Array.isArray(resposta) ? `${resposta.length} itens` :
                       'Dados estruturados'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo das Respostas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h5 className="font-semibold text-blue-900 mb-3">Resumo das Respostas</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(respostas).length}
              </div>
              <div className="text-blue-700">Total de Perguntas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(respostas).filter(r => r !== null && r !== undefined && r !== '').length}
              </div>
              <div className="text-green-700">Respostas Preenchidas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(respostas).filter(r => Array.isArray(r)).length}
              </div>
              <div className="text-purple-700">Respostas Múltiplas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(respostas).filter(r => typeof r === 'boolean').length}
              </div>
              <div className="text-orange-700">Sim/Não</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
