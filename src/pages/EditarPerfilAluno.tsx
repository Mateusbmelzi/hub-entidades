import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateStudentAreaInteresse } from '@/hooks/useUpdateStudentAreaInteresse';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditarPerfilAluno() {
  const [areaInteresse, setAreaInteresse] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { updateStudentAreaInteresse } = useUpdateStudentAreaInteresse();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if profile not completed
  if (!profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  useEffect(() => {
    if (profile?.area_interesse) {
      setAreaInteresse(profile.area_interesse);
    }
  }, [profile]);

  const areas = [
    'Consultoria e Negócios',
    'Tecnologia',
    'Finanças',
    'Direito',
    'Educação',
    'Cultura',
    'Entretenimento',
    'Humanidades',
    'Esportes',
    'Mercado de Luxo',
    'Representatividade e Integração',
    'Saúde'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await updateStudentAreaInteresse(user.id, {
        area_interesse: areaInteresse
      });

      if (success) {
        // Redirect back to previous page or dashboard
        window.history.back();
      }
    } catch (error) {
      console.error('Erro ao atualizar área de interesse:', error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Editar Área de Interesse</CardTitle>
            <CardDescription>
              Atualize sua área de interesse para receber recomendações personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Área de Interesse</label>
                <Select value={areaInteresse} onValueChange={setAreaInteresse} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua área de interesse" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 