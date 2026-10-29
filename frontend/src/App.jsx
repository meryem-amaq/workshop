import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import VotingPage from './pages/VotingPage';
import ProjectionPage from './pages/ProjectionPage';
import LoginPage from './pages/LoginPage';

// Destination d'un participant connecté
function participantHome(currentUser, sessionPhase) {
  if (!currentUser) return '/register';
  if (sessionPhase === 'teams_formed' && currentUser.team_id) {
    return '/team';
  }
  return '/waiting';
}

function RootEntry() {
  const { isAdmin } = useWorkshop();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // 1. Si un participant scanne un ancien QR code contenant ?join=1, l'envoyer sur l'inscription
  if (params.get('join') === '1') {
    return <Navigate to="/register" replace />;
  }

  // 2. Super Admin disposant d'un jeton JWT valide : va sur l'écran de projection du Grand QR Code
  if (isAdmin) {
    return <Navigate to="/projection" replace />;
  }

  // 3. Sans JWT valide : l'URL racine de l'application exige toujours la connexion sur /login
  return <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { isAdmin } = useWorkshop();
  if (isAdmin) return children;
  return <Navigate to="/login" replace />;
}

// Toute URL inconnue
function FallbackRoute() {
  const { isAdmin, currentUser, sessionPhase } = useWorkshop();
  if (isAdmin) return <Navigate to="/projection" replace />;
  if (currentUser) return <Navigate to={participantHome(currentUser, sessionPhase)} replace />;
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
              {/* Accueil intelligent */}
              <Route path="/" element={<RootEntry />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Parcours des Incubés / Participants (accessible par QR Code ou direct) */}
              <Route path="/register" element={<RegisterQuizPage />} />
              <Route path="/quiz" element={<RegisterQuizPage />} />
              <Route path="/waiting" element={<WaitingRoomPage />} />
              <Route path="/team" element={<TeamWorkspacePage />} />
              <Route path="/workspace" element={<TeamWorkspacePage />} />

              {/* Parcours Super Admin (accessible après connexion pour afficher le Grand QR Code) */}
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
              <Route path="/votes" element={<VotingPage />} />
              <Route path="/vote" element={<VotingPage />} />
              <Route path="/home" element={<Navigate to="/login" replace />} />

              {/* Redirection universelle de secours */}
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
