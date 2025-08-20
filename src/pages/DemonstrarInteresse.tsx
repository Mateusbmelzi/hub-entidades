import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Target, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AreaAtuacaoDisplay } from '@/components/ui/area-atuacao-display';
import { useAuth } from '@/hooks/useAuth';
import { useEntidade } from '@/hooks/useEntidade';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DemonstrarInteresse: React.FC = () => {
  const { entidadeId } = useParams<{ entidadeId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { entidade, loading: entidadeLoading } = useEntidade(entidadeId);

  const [formData, setFormData] = useState({
    nome_estudante: '',
    email_estudante: '',
    curso_estudante: '',
    semestre_estudante: 1,
    areas_interesse: [] as string[],
    aceito_termos: false
  });

  const [loading, setLoading] = useState(false);

  console.log('🔍 DemonstrarInteresse Debug:', {
    entidadeId,
    user: user?.email,
    profile: profile?.nome,
    entidade: entidade?.nome,
    entidadeLoading
  });

  // Verificar autenticação e perfil completo
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile && !profile.profile_completed) {
      navigate('/profile-setup');
      return;
    }
  }, [user, profile, navigate]);

  // Preencher dados do formulário com informações do perfil
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        nome_estudante: profile.nome || '',
        email_estudante: profile.email || user?.email || '',
        curso_estudante: profile.curso || '',
        semestre_estudante: profile.semestre || 1,
        celular_estudante: profile.celular || ''
      }));
    }
  }, [profile, user?.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semestre_estudante' ? parseInt(value) || 1 : value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      aceito_termos: checked
    }));
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      areas_interesse: checked 
        ? [...prev.areas_interesse, area]
        : prev.areas_interesse.filter(a => a !== area)
    }));
  };

  const isAreaSelected = (area: string) => {
    return formData.areas_interesse.includes(area);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aceito_termos) {
      toast.error('Você deve aceitar os termos para continuar');
      return;
    }

    if (formData.areas_interesse.length === 0) {
      toast.error('Você deve selecionar pelo menos uma área de interesse');
      return;
    }

    if (!entidade?.id) {
      toast.error('Entidade não encontrada');
      return;
    }

    setLoading(true);

    try {
      const demonstrationData = {
        entidade_id: entidade.id,
        nome_estudante: formData.nome_estudante,
        email_estudante: formData.email_estudante,
        curso_estudante: formData.curso_estudante,
        semestre_estudante: formData.semestre_estudante,
        area_interesse: formData.areas_interesse.join(', '), // Converter array para string
        status: 'pendente' as const
      };

      const result = await supabase
        .from('demonstracoes_interesse')
        .insert(demonstrationData)
        .select();

      if (result.error) {
        throw result.error;
      }

      toast.success('Demonstração de interesse enviada com sucesso!');
      navigate(`/entidades/${entidade.id}`);
    } catch (error: any) {
      console.error('❌ Erro ao enviar demonstração:', error);
      toast.error('Erro ao enviar demonstração de interesse. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (entidadeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando entidade...</p>
        </div>
      </div>
    );
  }

  if (!entidade) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Entidade não encontrada</h2>
          <p className="text-gray-600 mb-6">A entidade que você está procurando não existe ou foi removida.</p>
          <Link to="/entidades">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Entidades
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/entidades/${entidade.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para {entidade.nome}
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstrar Interesse
          </h1>
          <p className="text-gray-600">
            Preencha o formulário abaixo para demonstrar seu interesse nesta entidade.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            {/* Mensagem sobre processo seletivo */}
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Processo Seletivo Temporariamente Fechado</strong><br />
                O processo seletivo desta organização estudantil não está aberto no momento. 
                No entanto, você pode demonstrar seu interesse através deste formulário. 
                Sua demonstração será considerada e você poderá ser notificado quando o 
                processo seletivo for aberto.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-red-600" />
                  Formulário de Interesse
                </CardTitle>
                <CardDescription>
                  Preencha suas informações para demonstrar interesse em {entidade.nome}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_estudante">Nome Completo *</Label>
                      <Input
                        id="nome_estudante"
                        name="nome_estudante"
                        value={formData.nome_estudante}
                        onChange={handleInputChange}
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email_estudante">Email *</Label>
                      <Input
                        id="email_estudante"
                        name="email_estudante"
                        type="email"
                        value={formData.email_estudante}
                        onChange={handleInputChange}
                        required
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="curso_estudante">Curso *</Label>
                      <Input
                        id="curso_estudante"
                        name="curso_estudante"
                        value={formData.curso_estudante}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Administração"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="semestre_estudante">Semestre *</Label>
                      <Input
                        id="semestre_estudante"
                        name="semestre_estudante"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.semestre_estudante}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Áreas de Interesse *</Label>
                    <div className="mt-2">
                      {!entidade.areas_internas || entidade.areas_internas.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Esta entidade ainda não definiu suas áreas internas. Entre em contato com a entidade para mais informações.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entidade.areas_internas.map((area) => (
                              <div key={area} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`area-${area}`}
                                  checked={isAreaSelected(area)}
                                  onCheckedChange={(checked) => handleAreaChange(area, checked as boolean)}
                                />
                                <Label 
                                  htmlFor={`area-${area}`} 
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {area}
                                </Label>
                              </div>
                            ))}
                          </div>
                          
                          {formData.areas_interesse.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">Áreas selecionadas:</p>
                              <div className="flex flex-wrap gap-2">
                                {formData.areas_interesse.map((area) => (
                                  <Badge key={area} variant="secondary" className="bg-red-100 text-red-800">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {formData.areas_interesse.length === 0 && (
                            <p className="text-sm text-amber-600">
                              Selecione pelo menos uma área de interesse
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aceito_termos"
                      checked={formData.aceito_termos}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="aceito_termos" className="text-sm">
                      Aceito que meus dados sejam compartilhados com a entidade para fins de contato
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    disabled={loading || formData.areas_interesse.length === 0 || !entidade.areas_internas || entidade.areas_internas.length === 0}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? 'Enviando...' : 'Enviar Demonstração de Interesse'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações da Entidade */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-red-600" />
                  Sobre a Entidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{entidade.nome}</h3>
                  {entidade.descricao_detalhada && (
                    <p className="text-sm text-gray-600 mt-1">{entidade.descricao_detalhada}</p>
                  )}
                </div>

                {entidade.area_atuacao && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Áreas de Atuação</h4>
                    <AreaAtuacaoDisplay
                      area_atuacao={entidade.area_atuacao}
                      variant="outline"
                      className="mt-1"
                      compact={true}
                    />
                  </div>
                )}

                {entidade.areas_internas && entidade.areas_internas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Áreas Internas Disponíveis</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entidade.areas_internas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entidade.local_feira && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Local na Feira</h4>
                    <p className="text-sm text-gray-600">{entidade.local_feira}</p>
                  </div>
                )}

                {entidade.local_apresentacao && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Local da Apresentação</h4>
                    <p className="text-sm text-gray-600">{entidade.local_apresentacao}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Ao demonstrar interesse, você concorda em compartilhar suas informações 
                    com esta entidade para fins de contato e processo seletivo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemonstrarInteresse; 