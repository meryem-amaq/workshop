import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import Header from './components/Header';
import ModalAdminAuth from './components/ModalAdminAuth';
import ModalChangeScribe from './components/ModalChangeScribe';
import ModalQrCode from './components/ModalQrCode';
import ModalDbStatus from './components/ModalDbStatus';
import ToastContainer from './components/ToastContainer';

import HomePage from './pages/HomePage';
import RegisterQuizPage from './pages/RegisterQuizPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import GroupsLaunchPage from './pages/GroupsLaunchPage';
import TeamStagesPage from './pages/TeamStagesPage';
import RestitutionPage from './pages/RestitutionPage';
import ProjectionPage from './pages/ProjectionPage';
import LoginPage from './pages/LoginPage';

// Destination d'un participant d�j� inscrit (jamais la page de login)
function participantHome(currentUser) {
  return currentUser ? (currentUser.team_id ? '/team' : '/waiting') : null;
}

function RootEntry() {
  const { setAdminMode, currentUser, isAdmin } = useWorkshop();
  const isJoin = typeof window !== 'undefined' && window.location.search.includes('join=1');
  React.useEffect(() => {
    // Un scan du QR code = parcours participant : on quitte toute session admin
    if (isJoin) setAdminMode(false);
  }, [isJoin]);
  if (isJoin) {
    return <RegisterQuizPage />;
  }
  if (!isAdmin && currentUser) {
    return <Navigate to={participantHome(currentUser)} replace />;
  }
  return <Navigate to="/login" replace />;
}

// Pages réservées au Super Admin : redirection vers /login si non connecté
function AdminOnly({ children }) {
  const { isAdmin, currentUser } = useWorkshop();
  if (isAdmin) return children;
  return <Navigate to={participantHome(currentUser) || '/login'} replace />;
}

// Toute URL inconnue : un participant inscrit reste dans son parcours
function FallbackRoute() {
  const { isAdmin, currentUser } = useWorkshop();
  if (!isAdmin && currentUser) return <Navigate to={participantHome(currentUser)} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <WorkshopProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Si ?join=1 (via QR Code) -> Questionnaire Incubé. Sinon -> /login */}
              <Route path="/" element={<RootEntry />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Parcours des Incubés (accessible via le QR Code) */}
              <Route path="/register" element={<RegisterQuizPage />} />
              <Route path="/quiz" element={<RegisterQuizPage />} />
              <Route path="/waiting" element={<WaitingRoomPage />} />
              <Route path="/team" element={<TeamWorkspacePage />} />
              <Route path="/workspace" element={<TeamWorkspacePage />} />

              {/* Parcours Super Admin (accessible après connexion) */}
              <Route path="/projection" element={<AdminOnly><ProjectionPage /></AdminOnly>} />
              <Route path="/qrcode" element={<AdminOnly><ProjectionPage /></AdminOnly>} />
              <Route path="/launch" element={<AdminOnly><GroupsLaunchPage /></AdminOnly>} />
              <Route path="/groups" element={<AdminOnly><GroupsLaunchPage /></AdminOnly>} />
              <Route path="/admin" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />
              <Route path="/dashboard" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />
              <Route path="/village" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />
              <Route path="/stages" element={<AdminOnly><TeamStagesPage /></AdminOnly>} />
              <Route path="/progress" element={<AdminOnly><TeamStagesPage /></AdminOnly>} />
              <Route path="/restitution" element={<RestitutionPage />} />
              <Route path="/home" element={<Navigate to="/login" replace />} />

              {/* Redirection universelle vers le Login */}
              <Route path="*" element={<FallbackRoute />} />
            </Routes>
          </main>

          {/* Global Modals & Notifications */}
          <ModalAdminAuth />
          <ModalChangeScribe />
          <ModalQrCode />
          <ModalDbStatus />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </WorkshopProvider>
  );
}
