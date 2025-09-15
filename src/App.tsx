import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { EntityAuthProvider } from '@/hooks/useEntityAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SuperAdminRoute } from '@/components/SuperAdminRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { WelcomeRoute } from '@/components/WelcomeRoute';

import Navigation from '@/components/Navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageTrackingProvider } from '@/components/PageTrackingProvider';
import { AuthStateProvider } from '@/components/AuthStateProvider';
import { RedirectDestinationProvider } from '@/hooks/useRedirectDestination';
import { useScrollToTop } from '@/hooks/useScrollToTop';

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
import TestEventos from '@/pages/TestEventos';
import TermosUso from '@/pages/TermosUso';
import ReservaSala from '@/pages/ReservaSala';
import ReservaAuditorio from '@/pages/ReservaAuditorio';
import AprovarReservas from '@/pages/AprovarReservas';
import MinhasReservas from '@/pages/MinhasReservas';
import CalendarioReservas from '@/pages/CalendarioReservas';
import HistoricoReservas from '@/pages/HistoricoReservas';
import Footer from '@/components/Footer';

const queryClient = new QueryClient();

// Componente interno que usa o hook de scroll to top
function AppRouter() {
  useScrollToTop();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 pb-16 md:pb-0">
        <Routes>
          {/* Rota pública - Home */}
          <Route path="/" element={<Home />} />
          
          {/* Rota de autenticação */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Rota de teste de autenticação */}
          <Route path="/test-auth" element={<TestAuth />} />
          
          {/* Rota de teste de eventos */}
          <Route path="/test-eventos" element={<TestEventos />} />
          
          {/* Rota pública - Termos de Uso */}
          <Route path="/termos-uso" element={<TermosUso />} />
          
          {/* Rota protegida - requer admin ou super admin */}
          <Route path="/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
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
            <AdminRoute>
              <CriarEvento />
            </AdminRoute>
          } />
          
          <Route path="/demonstrar-interesse/:entidadeId" element={
            <ProtectedRoute>
              <DemonstrarInteresse />
            </ProtectedRoute>
          } />
          
          <Route path="/perfil" element={
            <ProtectedRoute requireProfile={true}>
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
            <AdminRoute>
              <Cronograma />
            </AdminRoute>
          } />
          
          <Route path="/participacao-entidade" element={
            <AdminRoute>
              <ParticipacaoEntidade />
            </AdminRoute>
          } />
          
          <Route path="/reserva-sala" element={
            <ProtectedRoute>
              <ReservaSala />
            </ProtectedRoute>
          } />
          
          <Route path="/reserva-auditorio" element={
            <ProtectedRoute>
              <ReservaAuditorio />
            </ProtectedRoute>
          } />
          
          {/* Rotas do Sistema de Reservas */}
          <Route path="/minhas-reservas" element={
            <ProtectedRoute>
              <MinhasReservas />
            </ProtectedRoute>
          } />
          
          <Route path="/calendario-reservas" element={
            <ProtectedRoute>
              <CalendarioReservas />
            </ProtectedRoute>
          } />
          
          {/* Rotas do Super Admin */}
          <Route path="/super-admin-auth" element={<SuperAdminAuth />} />
          <Route path="/admin-credenciais" element={<AdminCredenciais />} />
          <Route path="/aprovar-eventos" element={
            <AdminRoute>
              <AprovarEventos />
            </AdminRoute>
          } />
          
          <Route path="/aprovar-reservas" element={
            <ProtectedRoute>
              <AprovarReservas />
            </ProtectedRoute>
          } />
          
          <Route path="/historico-reservas" element={
            <ProtectedRoute>
              <HistoricoReservas />
            </ProtectedRoute>
          } />
          
          {/* Rota de verificação de email */}
          <Route path="/email-verification" element={<EmailVerification />} />
          
          {/* Rota de boas-vindas - protegida para usuários com destino de redirecionamento */}
          <Route path="/welcome" element={
            <WelcomeRoute>
              <Welcome />
            </WelcomeRoute>
          } />
          
          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

// Componente wrapper principal
function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthStateProvider>
          <RedirectDestinationProvider>
            <AuthProvider>
              <EntityAuthProvider>
                <PageTrackingProvider>
                  <Router>
                    <AppRouter />
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

function App() {
  return <AppContent />;
}

export default App;
