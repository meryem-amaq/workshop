import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { ARCHETYPES } from '../constants/workshopData';

export default function ProjectionPage() {
  const { isAdmin, participants, openAdminModal, showToast } = useWorkshop();
  const navigate = useNavigate();

  const [qrUrl, setQrUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [localIp, setLocalIp] = useState('');
  const [port, setPort] = useState(3000);
  const [isCloud, setIsCloud] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQr = async () => {
      const currentOrigin = window.location.origin;
      let target = `${currentOrigin}/?join=1`;
      try {
        const res = await fetch(`/api/qrcode?url=${encodeURIComponent(target)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.url) target = data.url;
          if (data.dataUrl) setDataUrl(data.dataUrl);
          if (data.localIp) setLocalIp(data.localIp);
          if (data.port) setPort(data.port);
          if (data.isCloud !== undefined) setIsCloud(data.isCloud);
        }
      } catch (e) {
        console.warn('Erreur chargement QR Code:', e);
      }
      if (isMounted) setQrUrl(target);
    };

    fetchQr();
    return () => { isMounted = false; };
  }, []);

  // Fallback canvas drawing if no server QR image
  useEffect(() => {
    if (dataUrl || !canvasRef.current || !qrUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const gridSize = 25;
    const cellSize = (size - 20) / gridSize;
    const padding = 10;
    let hash = 0;
    for (let i = 0; i < qrUrl.length; i++) {
      hash = (hash << 5) - hash + qrUrl.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#0f172a';
    function drawCorner(x, y) {
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      ctx.fillStyle = '#0f172a';
    }

    drawCorner(padding, padding);
    drawCorner(padding + cellSize * (gridSize - 7), padding);
    drawCorner(padding, padding + cellSize * (gridSize - 7));

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 7 && c < 7) || (r < 7 && c >= gridSize - 7) || (r >= gridSize - 7 && c < 7)) continue;
        const pseudo = Math.sin(r * 13 + c * 37 + hash) * 10000;
        if (pseudo - Math.floor(pseudo) > 0.5) {
          ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }, [dataUrl, qrUrl]);

  const copyWorkshopUrl = () => {
    navigator.clipboard.writeText(qrUrl || `http://${localIp || 'localhost'}:${port}/?join=1`);
    showToast('Lien du workshop copié !', 'success');
  };

  if (!isAdmin) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={{ color: '#fff', margin: '1rem 0' }}>Espace Animateur Réservé</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Veuillez renseigner votre code d'accès animateur pour projeter l'écran d'accueil avec le grand QR Code.
          </p>
          <button type="button" className="btn btn-primary" onClick={openAdminModal}>
            Saisir le Code Animateur ➔
          </button>
        </div>
      </div>
    );
  }

  const count = participants.length;
  const targetParticipants = 15; // Cible de référence pour la jauge circulaire
  const progressPercent = Math.min(Math.round((count / targetParticipants) * 100), 100);
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  const wifiDisplayUrl = localIp ? `http://${localIp}:${port}` : `http://localhost:${port}`;
  const directJoinUrl = qrUrl || `${wifiDisplayUrl}/?join=1`;

  return (
    <div className="view-panel active">
      <div className="projection-clean-container">

        {/* =========================================================
            GRILLE PRINCIPALE EN 2 COLONNES (60% GAUCHE / 40% DROITE)
            ========================================================= */}
        <div className="projection-main-split-grid">

          {/* =========================================================
              COLONNE DE GAUCHE (60% - CARTE D'ACTION PRINCIPALE)
              ========================================================= */}
          <section className="projection-col-card projection-card-left-60">

            {/* Titre de la carte mis en avant */}
            <div className="qr-action-header">
              <h2 className="qr-action-main-title">
                Scannez pour Rejoindre l'Atelier
              </h2>
            </div>

            {/* QR Code Large et Net parfaitement centré */}
            <div className="qr-display-center-box">
              <div className="qr-white-frame">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt="QR Code Workshop HD"
                    className="qr-img-large"
                  />
                ) : (
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={440}
                    className="qr-img-large"
                  />
                )}
              </div>
            </div>

            {/* Une seule ligne d'information textuelle : Wi-Fi Local ou Serveur Cloud */}
            <div className="qr-wifi-single-line">
              <span className="wifi-neon-dot"></span>
              <span className="wifi-text-content">
                {isCloud ? 'Serveur Cloud :' : 'Wi-Fi Local :'} <strong>{qrUrl ? qrUrl.replace('/?join=1', '').replace('?join=1', '') : wifiDisplayUrl}</strong>
              </span>
            </div>

            {/* En bas de la carte (petit texte) : Accès direct navigateur */}
            <div className="qr-direct-access-footer">
              <div className="direct-access-label-row">
                <span className="direct-access-hint">
                  OU ACCÉDEZ DIRECTEMENT VIA VOTRE NAVIGATEUR :
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
              COLONNE DE DROITE (40% - CARTE D'ÉTAT EN TEMPS RÉEL)
              ========================================================= */}
          <section className="projection-col-card projection-card-right-40">

            {/* Titre de la carte mis en avant */}
            <div className="dashboard-header-row">
              <h2 className="dashboard-main-title">
                Tableau de Bord des Participants
              </h2>
              <div className="neon-live-badge">
                <span className="neon-dot-pulse"></span>
                <span>En direct</span>
              </div>
            </div>

            {/* Intégration de l'Univers : Jauge Circulaire + Schtroumpf Professeur */}
            <div className="dashboard-gauge-character-box">

              {/* Jauge de progression circulaire avec grand nombre */}
              <div className="circular-kpi-wrap">
                <svg className="circular-gauge-svg" viewBox="0 0 100 100">
                  <circle
                    className="gauge-bg-circle"
                    cx="50"
                    cy="50"
                    r="45"
                  />
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
                  <span className="gauge-number-sub">{count > 1 ? 'inscrits' : 'inscrit'}</span>
                </div>
              </div>

              {/* Illustration 3D Schtroumpf Professeur (avec circuit imprimé) */}
              <div className="professor-showcase-card">
                <img
                  src="/assets/images/professeur.jpg"
                  alt="Schtroumpf Professeur IoT"
                  className="professor-avatar-3d"
                />
                <div className="professor-meta-text">
                  <span className="professor-name">Schtroumpf Professeur</span>
                  <span className="professor-role">Architecture & Lab IoT</span>
                </div>
              </div>

            </div>

            {/* Texte d'état clair */}
            <div className="dashboard-status-banner">
              {count === 0 ? (
                <div className="status-waiting-pill">
                  <span className="waiting-spinner">⏳</span>
                  <span>Participants en attente de connexion...</span>
                </div>
              ) : (
                <div className="status-ready-pill">
                  <span className="ready-icon">✓</span>
                  <span><strong>{count}</strong> participant{count > 1 ? 's' : ''} connecté{count > 1 ? 's' : ''} et prêt{count > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Mur défilant des participants en direct */}
            <div className="dashboard-live-participants-list">
              {count === 0 ? (
                <div className="dashboard-empty-message">
                  <p>Dès qu'un participant valide son profil, son avatar 3D apparaît ici en temps réel.</p>
                </div>
              ) : (
                <div className="dashboard-chips-grid">
                  {participants.map((p) => {
                    const arch = ARCHETYPES[p.archetype] || ARCHETYPES.Artiste;
                    return (
                      <div
                        key={p.id}
                        className="live-participant-chip"
                        style={{ borderLeft: `3px solid ${arch.color}` }}
                      >
                        <img
                          src={arch.avatar}
                          alt={arch.displayName}
                          className="chip-avatar-img"
                        />
                        <div className="chip-info-wrap">
                          <span className="chip-name">{p.first_name} {p.last_name}</span>
                          <span className="chip-arch" style={{ color: arch.color }}>{arch.displayName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bouton d'action principal de bascule */}
            <div className="dashboard-bottom-action">
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg pulse-glow"
                onClick={() => navigate('/launch')}
                style={{ minHeight: '54px', fontSize: '1.05rem', fontWeight: '800' }}
              >
                <span>⚡ Passer à la Constitution des Groupes ({count})</span>
                <span className="btn-arrow">➔</span>
              </button>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}
