import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, RefreshCw } from 'lucide-react';

export default function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if email is already verified and profile completed
  if (user.email_confirmed_at && profile?.profile_completed) {
    return <Navigate to="/" replace />;
  }

  // Redirect to profile setup if email verified but profile not completed
  if (user.email_confirmed_at && !profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  const handleResendVerification = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`
        }
      });

      if (error) {
        toast.error('Erro ao reenviar email de verificação');
        console.error(error);
      } else {
        toast.success('Email de verificação reenviado!');
      }
    } catch (error) {
      toast.error('Erro ao reenviar email');
      console.error(error);
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Verifique seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para{' '}
            <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Clique no link no email para verificar sua conta e continuar
              o cadastro.
            </p>
            <p className="mt-2">
              Não recebeu o email? Verifique sua caixa de spam ou reenvie.
            </p>
          </div>
          
          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Reenviando...' : 'Reenviar email'}
          </Button>
          
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full"
          >
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}