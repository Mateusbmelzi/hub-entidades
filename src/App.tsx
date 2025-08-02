
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { EntityAuthProvider } from '@/hooks/useEntityAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import Navigation from '@/components/Navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageTrackingProvider } from '@/components/PageTrackingProvider';
import { AuthStateProvider } from '@/components/AuthStateProvider';
import { RedirectDestinationProvider } from '@/hooks/useRedirectDestination';

// Pages
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Entidades from '@/pages/Entidades';
import EntidadeDetalhes from '@/pages/EntidadeDetalhes';
import Eventos from '@/pages/Eventos';
import EventoDetalhes from '@/pages/EventoDetalhes';
import CriarEvento from '@/pages/CriarEvento';
import DemonstrarInteresse from '@/pages/DemonstrarInteresse';
import DemonstracoesInteresse from '@/pages/DemonstracoesInteresse';
import Perfil from '@/pages/Perfil';
import ProfileSetup from '@/pages/ProfileSetup';
import EditarPerfilAluno from '@/pages/EditarPerfilAluno';
import Cronograma from '@/pages/Cronograma';
import ParticipacaoEntidade from '@/pages/ParticipacaoEntidade';
import SuperAdminAuth from '@/pages/SuperAdminAuth';
import AdminCredenciais from '@/pages/AdminCredenciais';
import AprovarEventos from '@/pages/AprovarEventos';
import EmailVerification from '@/pages/EmailVerification';
import Welcome from '@/pages/Welcome';
import NotFound from '@/pages/NotFound';
import TestAuth from '@/pages/TestAuth';
import { ConnectionMonitor } from '@/components/ConnectionMonitor';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthStateProvider>
          <RedirectDestinationProvider>
            <AuthProvider>
              <EntityAuthProvider>
                <PageTrackingProvider>
                  <Router>
                    <div className="min-h-screen bg-background">
                      <ConnectionMonitor enabled={false} />
                      <Navigation />
                      <div className="pb-16 md:pb-0">
                      <Routes>
                        {/* Rota pública - Home */}
                        <Route path="/" element={<Home />} />
                        
                        {/* Rota de autenticação */}
                        <Route path="/auth" element={<Auth />} />
                        
                        {/* Rota de teste de autenticação */}
                        <Route path="/test-auth" element={<TestAuth />} />
                        

                        

                        
                        {/* Rota protegida - requer apenas super admin */}
                        <Route path="/dashboard" element={
                          <SuperAdminRoute>
                            <Dashboard />
                          </SuperAdminRoute>
                        } />
                        
                        <Route path="/entidades" element={
                          <ProtectedRoute>
                            <Entidades />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/entidades/:id" element={
                          <ProtectedRoute>
                            <EntidadeDetalhes />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/entidades/:id/demonstracoes" element={
                          <ProtectedRoute>
                            <DemonstracoesInteresse />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/eventos" element={
                          <ProtectedRoute>
                            <Eventos />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/eventos/:id" element={
                          <ProtectedRoute>
                            <EventoDetalhes />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/criar-evento" element={
                          <ProtectedRoute>
                            <CriarEvento />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/demonstrar-interesse/:entidadeId" element={
                          <ProtectedRoute>
                            <DemonstrarInteresse />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/perfil" element={
                          <ProtectedRoute>
                            <Perfil />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/profile-setup" element={
                          <ProtectedRoute>
                            <ProfileSetup />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/editar-perfil" element={
                          <ProtectedRoute>
                            <EditarPerfilAluno />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/cronograma" element={
                          <ProtectedRoute>
                            <Cronograma />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/participacao-entidade" element={
                          <ProtectedRoute>
                            <ParticipacaoEntidade />
                          </ProtectedRoute>
                        } />
                        
                        {/* Rotas do Super Admin */}
                        <Route path="/super-admin-auth" element={<SuperAdminAuth />} />
                        <Route path="/admin-credenciais" element={<AdminCredenciais />} />
                        <Route path="/aprovar-eventos" element={
                          <SuperAdminRoute>
                            <AprovarEventos />
                          </SuperAdminRoute>
                        } />
                        
                        {/* Rota de verificação de email */}
                        <Route path="/email-verification" element={<EmailVerification />} />
                        
                        {/* Rota de boas-vindas */}
                        <Route path="/welcome" element={<Welcome />} />
                        
                        {/* Rota 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                  <Toaster />
                </Router>
              </PageTrackingProvider>
            </EntityAuthProvider>
          </AuthProvider>
          </RedirectDestinationProvider>
        </AuthStateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
