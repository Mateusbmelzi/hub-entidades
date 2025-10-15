import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, Mail, GraduationCap, Calendar, Users, CheckCircle, Clock, AlertCircle, Phone } from 'lucide-react';
import { useFormularioInscricao, CampoPersonalizado } from '@/hooks/useFormularioInscricao';
import { useInscricaoEvento } from '@/hooks/useInscricaoEvento';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FormularioInscricaoEventoProps {
  eventoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  nome_completo: string;
  email: string;
  curso: string;
  semestre: string;
  telefone: string;
  campos_personalizados: Record<string, any>;
}

export function FormularioInscricaoEvento({ eventoId, onSuccess, onCancel }: FormularioInscricaoEventoProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { inscreverEvento, loading } = useInscricaoEvento();
  const { formulario, loading: formularioLoading } = useFormularioInscricao(eventoId);
  
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    email: '',
    curso: '',
    semestre: '',
    telefone: '',
    campos_personalizados: {}
  });
  
  const [vagasDisponiveis, setVagasDisponiveis] = useState<number | null>(null);
  const [vagasEsgotadas, setVagasEsgotadas] = useState(false);

  // Preencher dados do usuário logado
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        nome_completo: profile.nome || '',
        email: user.email || '',
        curso: profile.curso || '',
        semestre: profile.semestre?.toString() || '',
        telefone: profile.celular || ''
      }));
    }
  }, [profile, user]);

  // Verificar vagas disponíveis
  useEffect(() => {
    const verificarVagas = async () => {
      if (!formulario?.limite_vagas) return;

      try {
        const { data: inscritos, error } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('evento_id', eventoId)
          .eq('status', 'confirmado');

        if (error) {
          console.error('Erro ao verificar vagas:', error);
          return;
        }

        const vagasOcupadas = inscritos?.length || 0;
        const vagasRestantes = formulario.limite_vagas - vagasOcupadas;
        
        setVagasDisponiveis(vagasRestantes);
        setVagasEsgotadas(vagasRestantes <= 0);
      } catch (error) {
        console.error('Erro ao verificar vagas:', error);
      }
    };

    if (formulario) {
      verificarVagas();
    }
  }, [formulario, eventoId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCampoPersonalizadoChange = (campoId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      campos_personalizados: {
        ...prev.campos_personalizados,
        [campoId]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome_completo.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome completo é obrigatório.',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O email é obrigatório.',
        variant: 'destructive'
      });
      return false;
    }

    // Validar campos personalizados obrigatórios
    if (formulario?.campos_personalizados) {
      for (const campo of formulario.campos_personalizados) {
        if (campo.obrigatorio) {
          const valor = formData.campos_personalizados[campo.id];
          if (!valor || (typeof valor === 'string' && !valor.trim())) {
            toast({
              title: 'Campo obrigatório',
              description: `O campo "${campo.label}" é obrigatório.`,
              variant: 'destructive'
            });
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (vagasEsgotadas && !formulario?.aceita_lista_espera) {
      toast({
        title: 'Vagas esgotadas',
        description: 'Não há mais vagas disponíveis para este evento.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await inscreverEvento(eventoId, {
        nome_participante: formData.nome_completo,
        email: formData.email,
        curso: formData.curso || undefined,
        semestre: formData.semestre ? parseInt(formData.semestre) : undefined,
        campos_adicionais: formData.campos_personalizados
      });

      if (result.success) {
        const status = result.status || 'confirmado';
        
        if (status === 'confirmado') {
          toast({
            title: '✅ Inscrição realizada com sucesso!',
            description: 'Você foi inscrito no evento.',
          });
        } else if (status === 'lista_espera') {
          toast({
            title: '⏳ Inscrito na lista de espera',
            description: 'As vagas estão esgotadas, mas você foi adicionado à lista de espera.',
          });
        }

        onSuccess?.();
      } else {
        toast({
          title: 'Erro na inscrição',
          description: result.error || 'Não foi possível realizar a inscrição.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao processar sua inscrição.',
        variant: 'destructive'
      });
    }
  };

  const renderCampoPersonalizado = (campo: CampoPersonalizado) => {
    const valor = formData.campos_personalizados[campo.id] || '';

    switch (campo.tipo) {
      case 'text':
        return (
          <Input
            value={valor}
            onChange={(e) => handleCampoPersonalizadoChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={valor}
            onChange={(e) => handleCampoPersonalizadoChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select
            value={valor}
            onValueChange={(value) => handleCampoPersonalizadoChange(campo.id, value)}
            required={campo.obrigatorio}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {campo.opcoes?.map((opcao, index) => (
                <SelectItem key={index} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={campo.id}
              checked={valor === true}
              onCheckedChange={(checked) => handleCampoPersonalizadoChange(campo.id, checked)}
              required={campo.obrigatorio}
            />
            <Label htmlFor={campo.id}>Sim</Label>
          </div>
        );

      default:
        return null;
    }
  };

  if (formularioLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!formulario?.ativo) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As inscrições para este evento não estão abertas no momento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Inscrever-se no Evento
        </DialogTitle>
        <DialogDescription>
          Preencha os dados abaixo para se inscrever no evento
        </DialogDescription>
      </DialogHeader>

      {/* Status das vagas */}
      {formulario.limite_vagas && (
        <Alert className={vagasEsgotadas ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          {vagasEsgotadas ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {formulario.aceita_lista_espera 
                  ? 'Vagas esgotadas - você será adicionado à lista de espera'
                  : 'Vagas esgotadas - inscrições encerradas'
                }
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {vagasDisponiveis !== null 
                  ? `${vagasDisponiveis} vagas disponíveis de ${formulario.limite_vagas}`
                  : 'Vagas disponíveis'
                }
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos básicos configurados no template */}
        <div className="space-y-4">
          {formulario.campos_basicos_visiveis?.includes('nome_completo') && (
            <div>
              <Label htmlFor="nome_completo" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          {formulario.campos_basicos_visiveis?.includes('email') && (
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
          )}

          {formulario.campos_basicos_visiveis?.includes('curso') && (
            <div>
              <Label htmlFor="curso" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Curso
              </Label>
              <Input
                id="curso"
                value={formData.curso}
                onChange={(e) => handleInputChange('curso', e.target.value)}
                placeholder="Ex: Engenharia de Computação"
              />
            </div>
          )}

          {formulario.campos_basicos_visiveis?.includes('semestre') && (
            <div>
              <Label htmlFor="semestre" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semestre
              </Label>
              <Input
                id="semestre"
                type="number"
                min="1"
                max="10"
                value={formData.semestre}
                onChange={(e) => handleInputChange('semestre', e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          )}

          {formulario.campos_basicos_visiveis?.includes('telefone') && (
            <div>
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
          )}
        </div>

        {/* Campos personalizados */}
        {formulario.campos_personalizados && formulario.campos_personalizados.length > 0 && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-4">Informações Adicionais</h4>
              {formulario.campos_personalizados.map((campo) => (
                <div key={campo.id} className="space-y-2">
                  <Label htmlFor={campo.id}>
                    {campo.label}
                    {campo.obrigatorio && ' *'}
                  </Label>
                  {renderCampoPersonalizado(campo)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || (vagasEsgotadas && !formulario.aceita_lista_espera)}
            className="flex-1"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : vagasEsgotadas && formulario.aceita_lista_espera ? (
              'Entrar na Lista de Espera'
            ) : (
              'Inscrever-se'
            )}
          </Button>
          
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
