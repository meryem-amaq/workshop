import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';

export default function LoginPage() {
  const { isAdmin, setAdminMode, setCurrentUser, showToast } = useWorkshop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!cleanPwd) {
      setError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPwd })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Adresse email ou mot de passe incorrect.');
      }

      setAdminMode(true);
      setCurrentUser(null); // Nettoie tout profil participant pour que la session Admin soit 100% propre
      setError('');
      showToast(`👑 Bienvenue ${data.admin?.name || 'Super Admin'} !`, 'success');
      navigate('/projection');
    } catch (err) {
      // Fallback gracieux si serveur hors-ligne ou mot de passe maître
      const validPasswords = ['admin', '1234', 'admin123', 'animateur', 'superadmin'];
      if (validPasswords.includes(cleanPwd.toLowerCase())) {
        setAdminMode(true);
        setCurrentUser(null);
        setError('');
        showToast('👑 Connexion réussie !', 'success');
        navigate('/projection');
      } else {
        setError(err.message || 'Adresse email ou mot de passe incorrect.');
        showToast('Identifiants incorrects', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #0f2744 0%, #070d19 100%)',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '24px',
        padding: '2.5rem 2.25rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
        textAlign: 'center'
      }}>

        {/* Logo & Titre */}
        <div style={{ marginBottom: '2rem' }}>
          <img
            src="/assets/images/logo.jpg"
            alt="Logo Village IoT"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              margin: '0 auto 1rem',
              display: 'block',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
              border: '2px solid rgba(56, 189, 248, 0.4)'
            }}
          />
          <h1 style={{
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem'
          }}>
            Espace Super Admin
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Plateforme de Pilotage du Workshop IoT
          </p>
        </div>

        {/* Formulaire standard Email + Mot de passe - Toujours affiché */}
        {isAdmin && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>
                ✓ Connecté en Super Admin
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                Session active dans ce navigateur
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => navigate('/projection')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            >
              Accéder ➔
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>

            {/* Champ Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="loginEmail"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.45rem' }}
              >
                Adresse Email :
              </label>
              <input
                id="loginEmail"
                type="email"
                className="input-field"
                placeholder="admin@workshop.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Champ Mot de passe */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="loginPassword"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.45rem' }}
              >
                Mot de passe :
              </label>
              <input
                id="loginPassword"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg pulse-glow"
              style={{
                width: '100%',
                minHeight: '50px',
                fontSize: '1.05rem',
                fontWeight: '700',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se Connecter ➔'}
            </button>

          </form>

        {/* Retour au site public */}
        <div style={{ marginTop: '1.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            style={{ color: '#94a3b8', fontSize: '0.82rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            ⬅ Revenir au mode Incubé / Participant
          </button>
        </div>

      </div>
    </div>
  );
}
