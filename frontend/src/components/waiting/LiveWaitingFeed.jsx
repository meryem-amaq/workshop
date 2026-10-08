import React from 'react';
import { ARCHETYPES } from '../../constants/workshopData';

export default function LiveWaitingFeed({
  participants,
  timeFormatted
}) {
  return (
    <div id="waitingIdleState" className="waiting-state-panel">
      <div className="waiting-header-row">
        <div className="waiting-spinner">
          <div className="radar-ping"></div>
          <span className="waiting-icon">🍄</span>
        </div>
        <div className="waiting-main-meta">
          <h4 className="waiting-title">⏳ Salle d'Attente en Direct</h4>
          <p className="waiting-desc">
            Votre profil est enregistré ! Restez sur cet écran : dès que l'animateur lancera la répartition, votre groupe s'affichera automatiquement ici.
          </p>

          {/* Chrono & Compteur de participants */}
          <div className="waiting-meta-pills mt-2">
            <div className="waiting-timer-pill" id="waitingTimerPill">
              <span>⏱️ Chrono :</span>
              <strong id="waitingTimerDisplay">{timeFormatted}</strong>
            </div>
            <div className="waiting-count-pill" id="waitingCountPill">
              <span>👥 <strong id="waitingCountReady">{participants.length}</strong> participant(s) prêt(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flux des participants arrivés en direct */}
      <div className="waiting-feed-container mt-3">
        <div className="feed-header">
          <span className="feed-dot-pulse"></span>
          <span className="feed-label">Participations reçues en direct :</span>
        </div>
        <div className="waiting-live-feed" id="waitingLiveFeed">
          {participants.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '0.6rem' }}>
              En attente de la première participation...
            </div>
          ) : (
            [...participants].reverse().map((p) => {
              const pMeta = ARCHETYPES[p.archetype] || ARCHETYPES.Professeur;
              const timeStr = p.created_at
                ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : 'À l\'instant';
              return (
                <div key={p.id} className="waiting-feed-item">
                  <div className="feed-item-left">
                    <span className="waiting-feed-dot" style={{ background: pMeta.color }}></span>
                    <span className="feed-item-name">{p.first_name} {p.last_name}</span>
                    <span
                      className="feed-item-badge"
                      style={{ background: `${pMeta.color}22`, color: pMeta.color, border: `1px solid ${pMeta.color}44` }}
                    >
                      {pMeta.badge || p.archetype}
                    </span>
                  </div>
                  <span className="feed-item-time">{timeStr}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
