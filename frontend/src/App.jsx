import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkshopProvider } from './context/WorkshopContext';
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

function RootEntry() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  if (search.includes('join=1')) {
    return <RegisterQuizPage />;
  }
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
              <Route path="/projection" element={<ProjectionPage />} />
              <Route path="/qrcode" element={<ProjectionPage />} />
              <Route path="/launch" element={<GroupsLaunchPage />} />
              <Route path="/groups" element={<GroupsLaunchPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/dashboard" element={<AdminDashboardPage />} />
              <Route path="/village" element={<AdminDashboardPage />} />
              <Route path="/stages" element={<TeamStagesPage />} />
              <Route path="/progress" element={<TeamStagesPage />} />
              <Route path="/restitution" element={<RestitutionPage />} />
              <Route path="/home" element={<Navigate to="/login" replace />} />

              {/* Redirection universelle vers le Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
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
