import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';

export default function Header() {
  const { isAdmin, setAdminMode } = useWorkshop();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Cette barre de navigation est STRICTEMENT RÉSERVÉE au Super Admin connecté
  // Les participants n'ont AUCUN menu : leur écran est 100% épuré et dédié à l'atelier
  if (!isAdmin) {
    return null;
  }

  // 2. Sur la page de login, ne pas afficher la barre
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="app-header">
      <div className="admin-header-bar">

        {/* Zone 1 : Logo & Titre */}
        <div
          className="admin-header-brand"
          onClick={() => navigate('/projection')}
          title="Supervision Workshop"
        >
          <img
            src="/assets/images/logo.jpg"
            alt="Logo Schtroumpf IoT"
            className="admin-header-logo"
          />
          <span className="header-brand-title">
            Village IoT
          </span>
        </div>

        {/* Zone 2 : Navigation Principale Super Admin (6 Étapes) */}
        <nav className="admin-header-nav">
          <NavLink
            to="/projection"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>📱</span>
            <span>1. Projection QR</span>
          </NavLink>

          <NavLink
            to="/launch"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>👥</span>
            <span>2. Lancement Groupes</span>
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>🛖</span>
            <span>3. Espace Équipe</span>
          </NavLink>

          <NavLink
            to="/village"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>🍄</span>
            <span>4. Carte 3D Village</span>
          </NavLink>

          <NavLink
            to="/stages"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>📋</span>
            <span>5. Suivi 6 Maisons</span>
          </NavLink>

          <NavLink
            to="/restitution"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span>📊</span>
            <span>6. Restitution & Pitch</span>
          </NavLink>
        </nav>

        {/* Zone 3 : Statut Super Admin & Déconnexion */}
        <div className="admin-header-actions">
          <span className="admin-badge-pill">
            👑 <span className="admin-badge-text">Super Admin</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs admin-quit-btn"
            onClick={() => {
              setAdminMode(false);
              navigate('/login');
            }}
            title="Quitter le mode Administrateur"
          >
            🚪 <span>Quitter</span>
          </button>
        </div>

      </div>
    </header>
  );
}
