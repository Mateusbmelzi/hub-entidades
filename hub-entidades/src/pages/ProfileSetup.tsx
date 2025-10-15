import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sparkles, User, Calendar, GraduationCap, Target, BookOpen, ArrowRight, Shield, Award, Users, Phone } from 'lucide-react';

export default function ProfileSetup() {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [celular, setCelular] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState(1);
  const [areasInteresse, setAreasInteresse] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { destination, clearDestination } = useRedirectDestination();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if profile already completed (but only if it was completed before this session)
  if (profile?.profile_completed && !profileCompleted) {
    if (destination) {
      return <Navigate to={destination} replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Redirect after profile completion in this session
  if (profileCompleted) {
    if (destination) {
      return <Navigate to={destination} replace />;
    }
    return <Navigate to="/" replace />;
  }

  const areas = [
    'consultoria e negocios',
    'tecnologia',
    'finanças',
    'direito',
    'educação',
    'cultura',
    'entretenimento'
  ];

  const cursos = [
    'Administração',
    'Economia', 
    'Engenharia da Computação',
    'Engenharia Mecânica',
    'Engenharia Mecatrônica',
    'Ciência da Computação',
    'Direito'
  ];

  const getAreaColor = (area: string) => {
    const colors = {
      'consultoria e negocios': 'bg-blue-100 text-blue-800 border-blue-200',
      'tecnologia': 'bg-purple-100 text-purple-800 border-purple-200',
      'finanças': 'bg-green-100 text-green-800 border-green-200',
      'direito': 'bg-red-100 text-red-800 border-red-200',
      'educação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cultura': 'bg-pink-100 text-pink-800 border-pink-200',
      'entretenimento': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[area as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Função para formatar celular
  const formatCelular = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Função para validar celular
  const validateCelular = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!dataNascimento) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }
    if (!celular.trim()) {
      toast.error('Celular é obrigatório');
      return;
    }
    if (!curso) {
      toast.error('Curso é obrigatório');
      return;
    }
    
    // Validação adicional
    if (areasInteresse.length === 0) {
      toast.error('Selecione pelo menos uma área de interesse');
      return;
    }
    
    // Validação do celular
    if (!validateCelular(celular)) {
      toast.error('Celular deve ter 10 ou 11 dígitos (com DDD)');
      return;
    }
    
    // Validação da data de nascimento
    if (dataNascimento) {
      const [day, month, year] = dataNascimento.split('/');
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 100) {
        toast.error('Data de nascimento inválida. Você deve ter entre 16 e 100 anos.');
        return;
      }
      
      if (birthDate > today) {
        toast.error('Data de nascimento não pode ser no futuro');
        return;
      }
    }
    
    setLoading(true);

    try {
      // Preparar dados para inserção
      const profileData = {
        id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento
          ? (() => {
              const [day, month, year] = dataNascimento.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            })()
          : null,
        celular: celular.trim(),
        curso,
        semestre,
        area_interesse: areasInteresse.length > 0 ? areasInteresse[0] : null, // Primeira área como principal
        areas_interesse: areasInteresse.length > 0 ? areasInteresse : null,
        profile_completed: true
      };
      
      console.log('Dados do perfil a serem salvos:', profileData);
      console.log('User ID:', user.id);
      
      // Usar upsert para garantir que o perfil seja criado ou atualizado
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error('Erro detalhado:', error);
        toast.error(`Erro ao salvar perfil: ${error.message}`);
      } else {
        console.log('Perfil salvo com sucesso:', data);
        toast.success('Perfil criado com sucesso!');
        
        // Marcar que o perfil foi completado nesta sessão
        setProfileCompleted(true);
        
        // Limpar cache e forçar refetch do perfil
        await refreshProfile();
        
        // Redirecionar após um pequeno delay para permitir que o toast seja exibido
        setTimeout(() => {
          if (destination) {
            navigate(destination);
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    }

    setLoading(false);
  };

  const handleCancel = async () => {
    try {
      // Fazer logout do usuário
      await signOut();
      
      // Limpar a rota de destino
      clearDestination();
      
      // Mostrar mensagem de cancelamento
      toast.success('Processo de inscrição cancelado. Você pode se cadastrar novamente a qualquer momento.');
      
      // Redirecionar para a home
      navigate('/');
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error('Erro ao cancelar inscrição. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Configuração de Perfil
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Complete seu perfil
            </h1>
            
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto mb-8">
              Precisamos de algumas informações para personalizar sua experiência no Hub de Organizações
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-100 text-sm">Conta criada</span>
              </div>
              <div className="w-8 h-1 bg-red-300 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-red-100 text-sm">Perfil</span>
              </div>
              <div className="w-8 h-1 bg-red-300 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-100 text-sm">Pronto!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Informações Pessoais</CardTitle>
            <CardDescription className="text-gray-600">
              Vamos configurar seu perfil para uma experiência personalizada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              
              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="data-nascimento" className="text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data de nascimento
                </Label>
                <Input
                  id="data-nascimento"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500">
                  Digite no formato dd/mm/aaaa
                </p>
              </div>

              {/* Celular */}
              <div className="space-y-2">
                <Label htmlFor="celular" className="text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Celular
                </Label>
                <Input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(formatCelular(e.target.value))}
                  className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              {/* Curso */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Curso
                </Label>
                <Select value={curso} onValueChange={setCurso} required>
                  <SelectTrigger className="border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Selecione seu curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border z-50">
                    {cursos.map((cursoOption) => (
                      <SelectItem key={cursoOption} value={cursoOption}>
                        {cursoOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semestre */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <Target className="w-4 h-4 inline mr-2" />
                  Semestre
                </Label>
                <Select value={semestre.toString()} onValueChange={(value) => setSemestre(Number(value))} required>
                  <SelectTrigger className="border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Selecione o semestre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border z-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semestre {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Áreas de Interesse */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Áreas de interesse (selecione até 3)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {areas.map((area) => (
                    <div key={area} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Checkbox
                        id={area}
                        checked={areasInteresse.includes(area)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (areasInteresse.length < 3) {
                              setAreasInteresse([...areasInteresse, area]);
                            }
                          } else {
                            setAreasInteresse(areasInteresse.filter(a => a !== area));
                          }
                        }}
                      />
                      <Label htmlFor={area} className="text-sm cursor-pointer flex-1">
                        {area.charAt(0).toUpperCase() + area.slice(1)}
                      </Label>
                      {areasInteresse.includes(area) && (
                        <Badge className={getAreaColor(area)}>
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                {areasInteresse.length === 3 && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    ✓ Máximo de 3 áreas selecionadas
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar inscrição?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja cancelar o processo de inscrição? 
                        Sua conta será removida e você precisará se cadastrar novamente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continuar cadastro</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sim, cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  type="submit" 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3" 
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Finalizar cadastro'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}