import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, User } from 'lucide-react';
import { ProfessorConvidado } from '@/types/reserva';

interface ProfessoresConvidadosManagerProps {
  professores: ProfessorConvidado[];
  onProfessoresChange: (professores: ProfessorConvidado[]) => void;
  errors?: Record<string, string>;
}

export const ProfessoresConvidadosManager: React.FC<ProfessoresConvidadosManagerProps> = ({
  professores,
  onProfessoresChange,
  errors = {}
}) => {
  const addProfessor = () => {
    const novoProfessor: ProfessorConvidado = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nomeCompleto: '',
      apresentacao: '',
      ehPessoaPublica: false,
      haApoioExterno: false,
      comoAjudaraOrganizacao: ''
    };
    
    onProfessoresChange([...professores, novoProfessor]);
  };

  const removeProfessor = (id: string) => {
    onProfessoresChange(professores.filter(p => p.id !== id));
  };

  const updateProfessor = (id: string, field: keyof ProfessorConvidado, value: any) => {
    onProfessoresChange(
      professores.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Professores/Palestrantes Convidados
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProfessor}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Professor
        </Button>
      </div>

      {professores.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum professor convidado adicionado</p>
          <p className="text-sm">Clique em "Adicionar Professor" para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {professores.map((professor, index) => (
            <Card key={professor.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Professor {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProfessor(professor.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`nome_${professor.id}`}>
                    Nome Completo do Professor/Palestrante *
                  </Label>
                  <Input
                    id={`nome_${professor.id}`}
                    value={professor.nomeCompleto}
                    onChange={(e) => updateProfessor(professor.id, 'nomeCompleto', e.target.value)}
                    className={errors[`professor_${professor.id}_nome`] ? 'border-red-500' : ''}
                    maxLength={100}
                    placeholder="Ex: Dr. Maria Silva Santos"
                  />
                  <div className="flex justify-between items-center">
                    {errors[`professor_${professor.id}_nome`] ? (
                      <p className="text-sm text-red-500">{errors[`professor_${professor.id}_nome`]}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Mínimo: 5 caracteres, Máximo: 100</p>
                    )}
                    <span className="text-xs text-gray-400">
                      {professor.nomeCompleto.length}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`apresentacao_${professor.id}`}>
                    Breve Apresentação do Convidado *
                  </Label>
                  <Textarea
                    id={`apresentacao_${professor.id}`}
                    rows={3}
                    value={professor.apresentacao}
                    onChange={(e) => updateProfessor(professor.id, 'apresentacao', e.target.value)}
                    className={errors[`professor_${professor.id}_apresentacao`] ? 'border-red-500' : ''}
                    maxLength={500}
                    placeholder="Ex: Professor de Ciência da Computação na USP, especialista em Machine Learning..."
                  />
                  <div className="flex justify-between items-center">
                    {errors[`professor_${professor.id}_apresentacao`] ? (
                      <p className="text-sm text-red-500">{errors[`professor_${professor.id}_apresentacao`]}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Mínimo: 10 caracteres, Máximo: 500</p>
                    )}
                    <span className="text-xs text-gray-400">
                      {professor.apresentacao.length}/500
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`pessoa_publica_${professor.id}`}
                    checked={professor.ehPessoaPublica}
                    onCheckedChange={(checked) => updateProfessor(professor.id, 'ehPessoaPublica', checked)}
                  />
                  <Label htmlFor={`pessoa_publica_${professor.id}`}>
                    O convidado é uma pessoa pública?
                  </Label>
                </div>

                {professor.ehPessoaPublica && (
                  <div className="space-y-4 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`apoio_externo_${professor.id}`}
                        checked={professor.haApoioExterno || false}
                        onCheckedChange={(checked) => updateProfessor(professor.id, 'haApoioExterno', checked)}
                      />
                      <Label htmlFor={`apoio_externo_${professor.id}`}>
                        Haverá apoio externo?
                      </Label>
                    </div>

                    {professor.haApoioExterno && (
                      <div className="space-y-2">
                        <Label htmlFor={`como_ajudara_${professor.id}`}>
                          Como a empresa ajudará a organização estudantil? *
                        </Label>
                        <Textarea
                          id={`como_ajudara_${professor.id}`}
                          rows={3}
                          value={professor.comoAjudaraOrganizacao || ''}
                          onChange={(e) => updateProfessor(professor.id, 'comoAjudaraOrganizacao', e.target.value)}
                          className={errors[`professor_${professor.id}_apoio`] ? 'border-red-500' : ''}
                          maxLength={500}
                          placeholder="Descreva como a empresa ajudará a organização"
                        />
                        <div className="flex justify-between items-center">
                          {errors[`professor_${professor.id}_apoio`] ? (
                            <p className="text-sm text-red-500">{errors[`professor_${professor.id}_apoio`]}</p>
                          ) : (
                            <p className="text-xs text-gray-500">Mínimo: 10 caracteres, Máximo: 500</p>
                          )}
                          <span className="text-xs text-gray-400">
                            {(professor.comoAjudaraOrganizacao || '').length}/500
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
