import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEntityAuth } from '@/hooks/useEntityAuth';
import { Eye, EyeOff } from 'lucide-react';

interface EntityLoginFormProps {
  onSuccess?: () => void;
}

const EntityLoginForm = ({ onSuccess }: EntityLoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, entidadeId } = useEntityAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (result.success && entidadeId) {
      setUsername('');
      setPassword('');
      onSuccess?.();
      // Redirecionar para a página da entidade após login
      navigate(`/entidades/${entidadeId}`);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto card-mobile">
      <CardHeader>
        <CardTitle>Login da Organização</CardTitle>
        <CardDescription>
          Entre com as credenciais da sua organização para gerenciar perfil, projetos e eventos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="form-group-mobile">
          <div className="form-field-mobile">
            <Label htmlFor="username" className="form-label-mobile">Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o usuário da organização"
              required
              className="input-mobile input-no-zoom"
            />
          </div>
          
          <div className="form-field-mobile">
            <Label htmlFor="password" className="form-label-mobile">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
                className="input-mobile input-no-zoom"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full button-mobile" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EntityLoginForm;