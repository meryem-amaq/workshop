import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useWorkshop } from '../context/WorkshopContext';
import { ARCHETYPES } from '../constants/workshopData';

export default function ProjectionPage() {
  const { isAdmin, setAdminMode, participants, showToast } = useWorkshop();
  const navigate = useNavigate();

  const [qrUrl, setQrUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [localIp, setLocalIp] = useState('');
  const [port, setPort] = useState(3000);
  const [isCloud, setIsCloud] = useState(false);
  const [quickPin, setQuickPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // 1. Génération infaillible du QR Code officiel Heroku
  useEffect(() => {
    let isMounted = true;
    const { origin, hostname } = window.location;
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

    const buildQr = (url) =>
      QRCode.toDataURL(url, {
        margin: 2,
        width: 480,
        errorCorrectionLevel: 'H',
        color: { dark: '#070d19', light: '#ffffff' }
      })
        .then((generatedDataUrl) => {
          if (isMounted) {
            setDataUrl(generatedDataUrl);
            setQrUrl(url);
          }
        })
        .catch((err) => console.error('Erreur génération QR Code client:', err));

    // En ligne (Heroku...) : l'adresse réelle du site ouvert = toujours valide.
    // En local : on remplace ensuite localhost par l'IP Wi-Fi (scannable par téléphone).
    buildQr(`${origin}/register`);

    const fetchServerInfo = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          const ip = data.network && data.network.localIp;
          const srvPort = data.network && data.network.port;
          if (ip) setLocalIp(ip);
          if (srvPort) setPort(srvPort);
          setIsCloud(!isLocalHost);
          if (isLocalHost && ip) {
            buildQr(`http://${ip}:${srvPort || window.location.port || 3000}/register`);
          }
        }
      } catch (e) {
        console.warn('Mode hors-ligne ou fallback local pour le QR code');
      }
    };

    fetchServerInfo();
    return () => { isMounted = false; };
  }, []);

  const copyWorkshopUrl = () => {
    navigator.clipboard.writeText(qrUrl || window.location.origin);
    showToast('Lien du workshop copié !', 'success');
  };

  const handleQuickLogin = (e) => {
    e.preventDefault();
    const clean = quickPin.trim().toLowerCase();
    if (clean === 'admin' || clean === '1234' || clean === 'animateur') {
      setAdminMode(true);
      setPinError(false);
      setQuickPin('');
      showToast('👑 Mode Super Admin activé !', 'success');
    } else {
      setPinError(true);
      showToast('Code d\'accès incorrect (essayez 1234 ou admin)', 'error');
    }
  };

  // Écran de déverrouillage rapide si non connecté en Admin
  if (!isAdmin) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center' }}>
          <div className="mobile-card step-screen active" style={{ padding: '2.5rem 2rem', borderRadius: '18px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Espace Animateur Réservé
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Connectez-vous pour afficher le grand écran de projection avec le QR Code et superviser les participants.
            </p>

            <form onSubmit={handleQuickLogin}>
              <input
                type="password"
                className="input-field"
                placeholder="Code PIN (ex : 1234)"
                value={quickPin}
                onChange={(e) => {
                  setQuickPin(e.target.value);
                  setPinError(false);
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  border: pinError ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg pulse-glow"
                style={{ width: '100%', minHeight: '48px', fontWeight: '700' }}
              >
                Déverrouiller l'Écran de Projection ➔
              </button>
            </form>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                style={{ color: '#94a3b8' }}
                onClick={() => navigate('/login')}
              >
                Aller sur la page de connexion complète ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const count = participants.length;
  const targetParticipants = 15;
  const progressPercent = Math.min(Math.round((count / targetParticipants) * 100), 100);
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  // Calcul de la répartition par archétype
  const archetypeCounts = {
    Artiste: participants.filter((p) => p.archetype === 'Artiste').length,
    Professeur: participants.filter((p) => p.archetype === 'Professeur').length,
    Critique: participants.filter((p) => p.archetype === 'Critique').length,
    Empathique: participants.filter((p) => p.archetype === 'Empathique').length,
    Sportif: participants.filter((p) => p.archetype === 'Sportif').length
  };

  const directJoinUrl = qrUrl || `${window.location.origin}/register`;

  return (
    <div className="view-panel active">
      <div className="projection-clean-container" style={{ padding: '1rem' }}>

        {/* =========================================================
            GRILLE PRINCIPALE EN 2 COLONNES (50% GAUCHE / 50% DROITE)
            ========================================================= */}
        <div className="projection-main-split-grid">

          {/* =========================================================
              COLONNE DE GAUCHE : QR CODE OFFICIEL HAUTE DÉFINITION
              ========================================================= */}
          <section className="projection-col-card projection-card-left-60">

            <div className="qr-action-header">
              <h2 className="qr-action-main-title">
                📱 Scannez pour Rejoindre l'Atelier
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Ouvrez l'appareil photo de votre smartphone pour accéder directement au questionnaire
              </p>
            </div>

            {/* QR Code Large et Net parfaitement centré */}
            <div className="qr-display-center-box" style={{ margin: '1rem 0' }}>
              <div className="qr-white-frame" style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '18px',
                boxShadow: '0 0 40px rgba(56, 189, 248, 0.35)',
                display: 'inline-block'
              }}>
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt="QR Code d'inscription au Workshop"
                    className="qr-img-large"
                    style={{ width: '280px', height: '280px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                    <span>⏳ Génération du QR Code...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ligne d'information Réseau / Serveur */}
            <div className="qr-wifi-single-line" style={{ marginBottom: '0.75rem' }}>
              <span className="wifi-neon-dot"></span>
              <span className="wifi-text-content">
                {isCloud ? 'Serveur Cloud (Accès Internet) :' : 'Serveur Workshop :'} <strong>{directJoinUrl}</strong>
              </span>
            </div>

            {/* Lien direct avec bouton Copier */}
            <div className="qr-direct-access-footer">
              <div className="direct-access-label-row">
                <span className="direct-access-hint">
                  LIEN DIRECT NAVIGATEUR :
                </span>
                <span className="direct-access-url">{directJoinUrl}</span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs copy-url-btn"
                  onClick={copyWorkshopUrl}
                  title="Copier l'adresse de connexion"
                >
                  📋 Copier
                </button>
              </div>
            </div>

          </section>

          {/* =========================================================
              COLONNE DE DROITE : SUIVI EN DIRECT DES INCUBÉS
              ========================================================= */}
          <section className="projection-col-card projection-card-right-40">

            <div className="dashboard-header-row">
              <h2 className="dashboard-main-title">
                👥 Suivi des Incubés en Direct
              </h2>
              <div className="neon-live-badge">
                <span className="neon-dot-pulse"></span>
                <span>En direct</span>
              </div>
            </div>

            {/* Jauge Circulaire + Indicateurs globaux */}
            <div className="dashboard-gauge-character-box" style={{ marginBottom: '1rem' }}>
              <div className="circular-kpi-wrap">
                <svg className="circular-gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg-circle" cx="50" cy="50" r="45" />
                  <circle
                    className="gauge-progress-circle"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: '283',
                      strokeDashoffset: `${strokeDashoffset}`
                    }}
                  />
                </svg>
                <div className="gauge-center-content">
                  <span className="gauge-big-number">{count}</span>
                  <span className="gauge-number-sub">{count > 1 ? 'prêts' : 'prêt'}</span>
                </div>
              </div>

              {/* Répartition dynamique par archétype en temps réel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Répartition des Profils :
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    🎨 Artiste : {archetypeCounts.Artiste}
                  </span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    🔬 Professeur : {archetypeCounts.Professeur}
                  </span>
                  <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    🛡️ Critique : {archetypeCounts.Critique}
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    🤝 Empathique : {archetypeCounts.Empathique}
                  </span>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ⚡ Sportif : {archetypeCounts.Sportif}
                  </span>
                </div>
              </div>
            </div>

            {/* État synthétique */}
            <div className="dashboard-status-banner" style={{ marginBottom: '1rem' }}>
              {count === 0 ? (
                <div className="status-waiting-pill">
                  <span className="waiting-spinner">⏳</span>
                  <span>En attente des premiers incubés... Scannez le QR Code pour démarrer !</span>
                </div>
              ) : (
                <div className="status-ready-pill">
                  <span className="ready-icon">✓</span>
                  <span><strong>{count}</strong> incubé{count > 1 ? 's ont' : ' a'} terminé le questionnaire de personnalité</span>
                </div>
              )}
            </div>

            {/* Liste détaillée en temps réel de chaque participant ayant terminé */}
            <div className="dashboard-live-participants-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {count === 0 ? (
                <div className="dashboard-empty-message">
                  <p>Dès qu'un incubé termine son questionnaire sur son téléphone, son profil Schtroumpf calculé apparaît ici instantanément.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {participants.slice().reverse().map((p) => {
                    const arch = ARCHETYPES[p.archetype] || ARCHETYPES.Professeur;
                    const dateFormatted = p.created_at
                      ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'À l\'instant';

                    return (
                      <div
                        key={p.id}
                        className="live-participant-chip"
                        style={{
                          borderLeft: `4px solid ${arch.color}`,
                          background: 'rgba(15, 23, 42, 0.7)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={arch.avatar}
                            alt={arch.displayName}
                            className="chip-avatar-img"
                            style={{ width: '38px', height: '38px', borderRadius: '50%', border: `2px solid ${arch.color}` }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>
                              {p.first_name} {p.last_name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: arch.color, fontWeight: '600' }}>
                              {arch.displayName}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            ✓ Terminé ({dateFormatted})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions principales pour l'animateur */}
            <div className="dashboard-bottom-action" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg pulse-glow"
                onClick={() => navigate('/launch')}
                style={{ minHeight: '50px', fontSize: '1.05rem', fontWeight: '800' }}
              >
                <span>⚡ Passer à la Constitution des Groupes ({count}) ➔</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-block btn-sm"
                onClick={() => navigate('/village')}
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
              >
                🍄 Basculer sur la Carte 3D du Village
              </button>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}
