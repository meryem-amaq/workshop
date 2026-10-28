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

// Destination d'un participant connecté
function participantHome(currentUser, sessionPhase) {
  if (!currentUser) return '/register';
  if (sessionPhase === 'teams_formed' && currentUser.team_id) {
    return '/team';
  }
  return '/waiting';
}

function RootEntry() {
  const { currentUser, isAdmin, sessionPhase } = useWorkshop();

  // 1. Participant déjà inscrit : va directement dans son parcours (Salle d'attente ou Espace Équipe)
  if (currentUser && !isAdmin) {
    return <Navigate to={participantHome(currentUser, sessionPhase)} replace />;
  }

  // 2. Super Admin déjà connecté : va sur l'écran de projection du Grand QR Code
  if (isAdmin) {
    return <Navigate to="/projection" replace />;
  }

  // 3. Personne n'est connecté :
  // Sur un ordinateur/tablette ouvrant le site racine, c'est l'animateur qui prépare l'atelier -> Page de Login
  return <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { isAdmin, currentUser, sessionPhase } = useWorkshop();
  if (isAdmin) return children;
  return <Navigate to={currentUser ? participantHome(currentUser, sessionPhase) : '/login'} replace />;
}

// Toute URL inconnue
function FallbackRoute() {
  const { isAdmin, currentUser, sessionPhase } = useWorkshop();
  if (isAdmin) return <Navigate to="/projection" replace />;
  if (currentUser) return <Navigate to={participantHome(currentUser, sessionPhase)} replace />;
  return <Navigate to="/register" replace />;
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
