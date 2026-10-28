import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';

export default function LoginPage() {
  const { isAdmin, setAdminMode, showToast } = useWorkshop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
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

    // Identifiants autorisés pour le Super Admin (flexibles pour faciliter la connexion)
    const validPasswords = ['admin', '1234', 'admin123', 'animateur', 'superadmin'];
    const isPasswordValid = validPasswords.includes(cleanPwd.toLowerCase());

    if (isPasswordValid) {
      setAdminMode(true);
      setError('');
      showToast('👑 Connexion Super Admin réussie !', 'success');
      navigate('/projection');
    } else {
      setError('Mot de passe incorrect. (Par défaut : admin123 ou 1234)');
      showToast('Identifiants incorrects', 'error');
    }
  };

  const handleLogout = () => {
    setAdminMode(false);
    showToast('Déconnexion effectuée.', 'info');
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

        {isAdmin ? (
          /* État déjà connecté */
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ color: '#10b981', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              ✓ Vous êtes déjà connecté en Super Admin
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Vous avez accès à l'ensemble des modules d'animation et de supervision.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-block btn-lg pulse-glow"
              onClick={() => navigate('/projection')}
              style={{ width: '100%', minHeight: '48px', fontWeight: '700', marginBottom: '0.75rem' }}
            >
              📱 Accéder à la Projection (QR Code) ➔
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block btn-sm"
              onClick={() => navigate('/village')}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              🍄 Voir la Carte 3D du Village
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ color: '#ef4444', textDecoration: 'underline' }}
              onClick={handleLogout}
            >
              🚪 Se déconnecter
            </button>
          </div>
        ) : (
          /* Formulaire standard Email + Mot de passe */
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
              className="btn btn-primary btn-block btn-lg pulse-glow"
              style={{
                width: '100%',
                minHeight: '50px',
                fontSize: '1.05rem',
                fontWeight: '700',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Se Connecter ➔
            </button>

            {/* Bloc d'aide rapide */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              color: '#64748b',
              textAlign: 'center'
            }}>
              💡 Démo : Email <strong>admin@workshop.com</strong> • Mot de passe <strong>admin123</strong> (ou <strong>1234</strong>)
            </div>

          </form>
        )}

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
