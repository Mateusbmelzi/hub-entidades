import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectDestination } from '@/hooks/useRedirectDestination';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, ArrowRight, Mail, Lock, GraduationCap } from 'lucide-react';
import TermosModal from '@/components/TermosModal';

export default function Auth() {
  // Estados separados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Estados separados para signup
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermosModal, setShowTermosModal] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState(false);

  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  const { destination, clearDestination } = useRedirectDestination();
  const navigate = useNavigate();

  // Se ainda está carregando, não fazer redirecionamento
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-4"></div>
            <p className="text-insper-dark-gray">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect baseado no estado do usuário
  if (user) {
    console.log('🔍 Auth Debug - Usuário autenticado:', {
      userEmail: user.email,
      profileCompleted: profile?.profile_completed,
      destination,
      hasDestination: !!destination
    });

    // Só redirecionar para profile-setup se o profile foi carregado e não está completo
    if (profile && !profile.profile_completed) {
      console.log('🔄 Redirecionando para profile-setup');
      return <Navigate to="/profile-setup" replace />;
    }
    
    // Se o profile ainda não foi carregado, aguardar
    if (!profile) {
      console.log('⏳ Aguardando carregamento do perfil...');
      return (
        <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-insper-red/20 border-t-insper-red mx-auto mb-4"></div>
              <p className="text-insper-dark-gray">Carregando perfil...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Se tem destino salvo, redirecionar para ele
    if (destination) {
      const targetRoute = destination;
      console.log('🔄 Redirecionando para destino salvo:', targetRoute);
      clearDestination();
      return <Navigate to={targetRoute} replace />;
    }
    
    // Redirecionamento padrão para home
    console.log('🔄 Redirecionando para home');
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login realizado com sucesso!');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingSignUp(true);
    setShowTermosModal(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermosModal(false);
    setLoading(true);

    const { error } = await signUp(signupEmail, signupPassword);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      try {
        await supabase.functions.invoke('send-email-verification', {
          body: {
            email: signupEmail,
            confirmationUrl: `${window.location.origin}/profile-setup`,
            userName: signupEmail.split('@')[0],
          },
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }

      toast.success('Conta criada com sucesso! Redirecionando para completar seu perfil...');
      
      setTimeout(() => {
        navigate('/profile-setup');
      }, 1500);
    }
    
    setPendingSignUp(false);
  };

  const handleCloseTermosModal = () => {
    setShowTermosModal(false);
    setPendingSignUp(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-insper-light-gray to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-insper-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-insper-red" />
          </div>
          <CardTitle className="text-2xl text-insper-black">Hub de Entidades</CardTitle>
          <CardDescription className="text-insper-dark-gray">
            Acesse sua conta para começar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-insper-light-gray p-1 rounded-lg">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:text-insper-red data-[state=active]:shadow-sm"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-white data-[state=active]:text-insper-red data-[state=active]:shadow-sm"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <form onSubmit={handleSignIn} className="form-group-mobile">
                <div className="form-field-mobile">
                  <Label htmlFor="signin-email" className="form-label-mobile">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="border-insper-light-gray-1 focus:border-insper-red focus:ring-insper-red input-mobile input-no-zoom"
                    required
                  />
                </div>
                <div className="form-field-mobile">
                  <Label htmlFor="signin-password" className="form-label-mobile">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Senha
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="border-insper-light-gray-1 focus:border-insper-red focus:ring-insper-red input-mobile input-no-zoom"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-insper-red hover:bg-insper-red/90 text-white py-3 button-mobile" 
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar na conta'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-6">
              <form onSubmit={handleSignUp} className="form-group-mobile">
                <div className="form-field-mobile">
                  <Label htmlFor="signup-email" className="form-label-mobile">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="border-insper-light-gray-1 focus:border-insper-red focus:ring-insper-red input-mobile input-no-zoom"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-insper-blue/10 text-insper-blue border-insper-blue/20 text-xs">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Qualquer email válido
                    </Badge>
                  </div>
                </div>
                <div className="form-field-mobile">
                  <Label htmlFor="signup-password" className="form-label-mobile">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Senha
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="border-insper-light-gray-1 focus:border-insper-red focus:ring-insper-red input-mobile input-no-zoom"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-insper-dark-gray/60">
                    Mínimo de 6 caracteres
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-insper-red hover:bg-insper-red/90 text-white py-3 button-mobile" 
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-insper-light-gray-1">
                          <p className="text-xs text-insper-dark-gray/60 text-center">
                Ao continuar, você concorda com nossos{' '}
                <button 
                  onClick={() => setShowTermosModal(true)}
                  className="text-insper-red hover:text-insper-red/80 underline"
                >
                  Termos de Uso
                </button>{' '}
                e{' '}
                <button 
                  onClick={() => setShowTermosModal(true)}
                  className="text-insper-red hover:text-insper-red/80 underline"
                >
                  Política de Privacidade
                </button>
              </p>
          </div>
        </CardContent>
      </Card>

      {/* Termos Modal */}
      <TermosModal
        isOpen={showTermosModal}
        onClose={handleCloseTermosModal}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
