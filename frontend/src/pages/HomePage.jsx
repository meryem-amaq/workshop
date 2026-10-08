import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { ARCHETYPES } from '../constants/workshopData';

export default function HomePage() {
  const { currentUser, showToast } = useWorkshop();
  const navigate = useNavigate();

  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [localIp, setLocalIp] = useState('');
  const [port, setPort] = useState(3000);
  const [activeProfileHover, setActiveProfileHover] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQr = async () => {
      let target = `${window.location.origin}/register?join=1`;
      try {
        const res = await fetch('/api/qrcode');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.url) target = data.url;
          if (data.dataUrl) setQrDataUrl(data.dataUrl);
          if (data.localIp) setLocalIp(data.localIp);
          if (data.port) setPort(data.port);
        }
      } catch (e) {
        console.warn('Erreur chargement QR Code:', e);
      }
      if (isMounted) setQrUrl(target);
    };

    fetchQr();
    return () => { isMounted = false; };
  }, []);

  // Si le participant scanne le QR code avec ?join=1, redirection directe vers le questionnaire
  useEffect(() => {
    if (window.location.search.includes('join=1') && !currentUser) {
      navigate('/register');
    }
  }, [currentUser, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl || window.location.origin);
    showToast('Lien du workshop copié dans le presse-papier !', 'success');
  };

  const archetypeList = [
    { key: 'Artiste', name: 'Artiste', icon: '🎨', role: 'Créativité & Design UX', color: '#ec4899', img: '/assets/images/artiste.jpg' },
    { key: 'Professeur', name: 'Professeur', icon: '🔬', role: 'Architecture & Capteurs', color: '#38bdf8', img: '/assets/images/professeur.jpg' },
    { key: 'Critique', name: 'Critique', icon: '🛡️', role: 'Faisabilité & Sécurité', color: '#8b5cf6', img: '/assets/images/critique.jpg' },
    { key: 'Empathique', name: 'Empathique', icon: '🤝', role: 'Besoins Utilisateur & Valeur', color: '#10b981', img: '/assets/images/empathique.jpg' },
    { key: 'Sportif', name: 'Sportif', icon: '⚡', role: 'Déploiement Agile & Go-to-market', color: '#f59e0b', img: '/assets/images/sportif.jpg' }
  ];

  return (
    <div className="view-panel active">
      <div className="home-split-container">
        
        {/* =========================================================
            COLONNE DE GAUCHE : ACCÈS MOBILE & QR CODE
            ========================================================= */}
        <section className="home-split-col home-col-left">
          <div className="home-welcome-card">
            
            <div className="home-badge-wrap">
              <span className="home-pill-badge">
                🚀 Workshop Innovation Collaborative
              </span>
            </div>

            <h1 className="home-main-title">
              Le Village IoT <span className="highlight">des Schtroumpfs</span>
            </h1>

            <p className="home-main-desc">
              Bienvenue au workshop d'innovation ! Scannez le QR Code ci-dessous avec l'appareil photo de votre smartphone pour démarrer l'aventure et passer le test de positionnement comportemental.
            </p>

            {/* Bloc QR Code Interactif & Stylisé */}
            <div className="home-qr-box-wrapper">
              <div className="home-qr-header">
                <span className="home-qr-icon">📱</span>
                <div>
                  <h3 className="home-qr-title">Accès Direct Smartphone</h3>
                  <p className="home-qr-sub">Scannez pour rejoindre l'atelier sans installation</p>
                </div>
              </div>

              <div className="home-qr-visual-frame">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code d'inscription au Workshop"
                    className="home-qr-image"
                  />
                ) : (
                  <div className="home-qr-placeholder">
                    <span className="home-qr-spin">⏳</span>
                    <span>Génération du QR Code...</span>
                  </div>
                )}
              </div>

              {localIp && (
                <div className="home-network-info">
                  <span className="status-dot online"></span>
                  <span>Réseau Local Wi-Fi : <strong>http://{localIp}:{port}</strong></span>
                </div>
              )}

              {/* Lien direct cliquable avec bouton Copier */}
              <div className="home-direct-url-block">
                <span className="home-url-hint">Lien direct d'accès :</span>
                <div className="home-url-input-group">
                  <input
                    type="text"
                    readOnly
                    value={qrUrl || `${window.location.origin}/register`}
                    className="home-url-input"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm home-copy-btn"
                    onClick={handleCopy}
                    title="Copier le lien direct"
                  >
                    📋 Copier
                  </button>
                </div>
              </div>
            </div>

            {/* Bouton alternatif : Participer depuis ce navigateur */}
            <div className="home-alternative-action">
              {currentUser ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg pulse-glow home-start-btn"
                  onClick={() => {
                    if (currentUser.team_id) navigate('/team');
                    else navigate('/waiting');
                  }}
                >
                  <span>🚀 Reprendre ma session ({currentUser.first_name} — {currentUser.archetype})</span>
                  <span className="btn-arrow">➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg pulse-glow home-start-btn"
                  onClick={() => navigate('/register')}
                  id="btnStartDirectBrowser"
                >
                  <span className="btn-icon">💻</span>
                  <span>Participer depuis ce navigateur (Saisir Nom & Prénom)</span>
                  <span className="btn-arrow">➔</span>
                </button>
              )}
            </div>

          </div>
        </section>

        {/* =========================================================
            COLONNE DE DROITE : ANIMATION & PRÉSENTATION VISUELLE
            ========================================================= */}
        <section className="home-split-col home-col-right">
          <div className="home-visual-showcase">
            
            {/* Bannière Principale / Atelier 3D */}
            <div className="home-hero-art-frame">
              <img
                src="/assets/images/archetypes.jpg"
                alt="Les 5 Schtroumpfs Innovateurs IoT"
                className="home-hero-art-img"
              />
              <div className="home-hero-art-overlay">
                <div className="overlay-content">
                  <span className="overlay-badge">5 Archétypes • 6 Maisons IoT</span>
                  <h3 className="overlay-title">L'Univers du Village Schtroumpf</h3>
                  <p className="overlay-text">
                    Chaque participant apporte sa force unique pour concevoir une solution connectée au cœur de la forêt magique.
                  </p>
                </div>
              </div>
            </div>

            {/* Cartes interactives des 5 Profils 3D */}
            <div className="home-archetypes-grid">
              {archetypeList.map((arch) => {
                const isHovered = activeProfileHover === arch.key;
                return (
                  <div
                    key={arch.key}
                    className={`home-arch-chip ${isHovered ? 'hovered' : ''}`}
                    style={{
                      borderColor: isHovered ? arch.color : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: isHovered ? `0 0 20px ${arch.color}55` : 'none'
                    }}
                    onMouseEnter={() => setActiveProfileHover(arch.key)}
                    onMouseLeave={() => setActiveProfileHover(null)}
                  >
                    <img
                      src={arch.img}
                      alt={arch.name}
                      className="home-arch-chip-avatar"
                    />
                    <div className="home-arch-chip-info">
                      <div className="home-arch-chip-name" style={{ color: arch.color }}>
                        <span>{arch.icon}</span> {arch.name}
                      </div>
                      <div className="home-arch-chip-role">{arch.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badge de synthèse pédagogique */}
            <div className="home-pedagogical-footer">
              <div className="footer-step-pill">
                <span className="step-num">1</span>
                <span>Test 15 Questions</span>
              </div>
              <span className="footer-step-arrow">➔</span>
              <div className="footer-step-pill">
                <span className="step-num">2</span>
                <span>Groupes Équilibrés</span>
              </div>
              <span className="footer-step-arrow">➔</span>
              <div className="footer-step-pill">
                <span className="step-num">3</span>
                <span>Atelier 6 Maisons</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
