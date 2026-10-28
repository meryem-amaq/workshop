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
    <header className="app-header" style={{
      background: 'rgba(7, 13, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      padding: '0.4rem 1rem'
    }}>
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>

        {/* Zone 1 : Logo & Titre */}
        <div
          onClick={() => navigate('/projection')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Supervision Workshop"
        >
          <img
            src="/assets/images/logo.jpg"
            alt="Logo Schtroumpf IoT"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              border: '1.5px solid rgba(56, 189, 248, 0.5)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
              objectFit: 'cover'
            }}
          />
          <span style={{
            color: '#fff',
            fontWeight: '800',
            fontSize: '0.98rem',
            letterSpacing: '-0.01em'
          }} className="header-brand-title">
            Village IoT
          </span>
        </div>

        {/* Zone 2 : Navigation Principale Super Admin (6 Étapes) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '4px 8px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <NavLink
            to="/projection"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>📱</span>
            <span>1. Projection QR</span>
          </NavLink>

          <NavLink
            to="/launch"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>👥</span>
            <span>2. Lancement Groupes</span>
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>🛖</span>
            <span>3. Espace Équipe</span>
          </NavLink>

          <NavLink
            to="/village"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>🍄</span>
            <span>4. Carte 3D Village</span>
          </NavLink>

          <NavLink
            to="/stages"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>📋</span>
            <span>5. Suivi 6 Maisons</span>
          </NavLink>

          <NavLink
            to="/restitution"
            className={({ isActive }) => `header-nav-btn ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            })}
          >
            <span>📊</span>
            <span>6. Restitution & Pitch</span>
          </NavLink>
        </nav>

        {/* Zone 3 : Statut Super Admin & Déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(56, 189, 248, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#38bdf8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            whiteSpace: 'nowrap'
          }}>
            👑 Super Admin
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            style={{
              color: '#ef4444',
              fontSize: '0.8rem',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
              background: 'rgba(239, 68, 68, 0.08)'
            }}
            onClick={() => {
              setAdminMode(false);
              navigate('/login');
            }}
            title="Quitter le mode Administrateur"
          >
            🚪 Quitter
          </button>
        </div>

      </div>
    </header>
  );
}
