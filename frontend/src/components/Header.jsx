import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';

export default function Header() {
  const { currentUser, isAdmin, sessionPhase } = useWorkshop();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-container-pro single-row">
        
        {/* Zone 1 : Logo uniquement à gauche */}
        <div className="header-logo-only" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Accueil Workshop">
          <img
            src="/assets/images/logo.jpg"
            alt="Logo Schtroumpf IoT"
            className="brand-logo-compact"
            id="headerLogoImg"
          />
        </div>

        {/* Zone 2 : Navigation Principale sur la même ligne */}
        <nav className="nav-tabs-pro" id="mainNavTabs">
          {isAdmin ? (
            /* =========================================================
               VUES DE SUPERVISION OFFICIELLES DE L'ANIMATEUR
               ========================================================= */
            <>
              <NavLink
                to="/projection"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">📱</span>
                <span className="tab-label">1. Projection (QR Code)</span>
              </NavLink>

              <NavLink
                to="/launch"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">👥</span>
                <span className="tab-label">2. Lancement Groupes</span>
              </NavLink>

              <NavLink
                to="/team"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">🛖</span>
                <span className="tab-label">3. Espace Équipe</span>
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">🍄</span>
                <span className="tab-label">4. Carte 3D Village</span>
              </NavLink>

              <NavLink
                to="/stages"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-label">5. Suivi 6 Maisons</span>
              </NavLink>

              <NavLink
                to="/restitution"
                className={({ isActive }) => `nav-tab-pro ${isActive ? 'active' : ''}`}
              >
                <span className="tab-icon">📊</span>
                <span className="tab-label">6. Restitution</span>
              </NavLink>
            </>
          ) : (
            /* =========================================================
               VUES PARTICIPANT (EXCLUSIVEMENT 4 ONGLETS GUIDÉS)
               ========================================================= */
            <>
              <button
                type="button"
                className={`nav-tab-pro ${!currentUser ? 'active' : ''}`}
                onClick={() => navigate(currentUser ? '/waiting' : '/register')}
              >
                <span className="tab-icon">👤</span>
                <span className="tab-label">Profil</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pro ${currentUser && !currentUser.team_id ? 'active' : ''}`}
                onClick={() => {
                  if (!currentUser) {
                    navigate('/register');
                  } else if (currentUser.team_id) {
                    navigate('/team');
                  } else {
                    navigate('/waiting');
                  }
                }}
              >
                <span className="tab-icon">👥</span>
                <span className="tab-label">Mon Équipe</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pro ${currentUser?.team_id ? 'active' : ''}`}
                onClick={() => {
                  if (!currentUser) {
                    navigate('/register');
                  } else if (!currentUser.team_id) {
                    navigate('/waiting');
                  } else {
                    navigate('/team');
                  }
                }}
              >
                <span className="tab-icon">🏠</span>
                <span className="tab-label">Atelier IoT</span>
              </button>

              <button
                type="button"
                className="nav-tab-pro"
                onClick={() => {
                  if (sessionPhase === 'restitution') {
                    navigate('/restitution');
                  } else {
                    navigate('/team');
                  }
                }}
              >
                <span className="tab-icon">📊</span>
                <span className="tab-label">Résultats</span>
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
