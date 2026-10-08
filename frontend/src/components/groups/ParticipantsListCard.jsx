import React from 'react';
import { ARCHETYPES } from '../../constants/workshopData';

export default function ParticipantsListCard({
  participants,
  teams,
  generating,
  onLaunchTeams,
  onOpenQrModal,
  onRemoveParticipant,
  onAssignTeam
}) {
  return (
    <div className="admin-prelaunch-card" style={{ marginBottom: '2rem' }}>
      <div className="prelaunch-header">
        <div className="prelaunch-meta">
          <div className="prelaunch-badge">🍄 Profils Schtroumpfs Reçus</div>
          <h3 className="prelaunch-title">
            👥 Liste Complète des Participants & Caractères 3D ({participants.length})
          </h3>
          <p className="prelaunch-desc">
            Chaque participant est présenté avec son dessin Schtroumpf 3D, son profil dominant, ses scores sur 75 pts et son rôle.
          </p>
        </div>
        <div className="prelaunch-action">
          <button
            type="button"
            className="btn btn-primary btn-lg pulse-glow"
            onClick={onLaunchTeams}
            disabled={generating || participants.length === 0}
          >
            <span>⚡ Former les Groupes ({participants.length})</span>
            <span className="btn-arrow">➔</span>
          </button>
        </div>
      </div>

      {/* Grille Visuelle des Participants Inscrits (Cartes 3D) */}
      <div className="admin-participants-grid">
        {participants.length === 0 ? (
          <div className="admin-prelaunch-empty" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', gridColumn: '1 / -1' }}>
            <h4>🍄 En attente des premières inscriptions...</h4>
            <p>Les participants apparaîtront ici dès qu'ils auront scanné le QR Code et validé leur test de 15 questions.</p>
            <button type="button" className="btn btn-outline btn-xs mt-3" onClick={onOpenQrModal}>
              📱 Afficher le Grand QR Code d'accès
            </button>
          </div>
        ) : (
          participants.map((p) => {
            const meta = ARCHETYPES[p.archetype] || ARCHETYPES.Professeur;
            const timeStr = p.created_at
              ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              : 'Prêt';
            const hasTeam = Boolean(p.team_id);
            const team = hasTeam ? teams.find((t) => t.id === p.team_id) : null;
            const isScribe = (team && team.scribe_participant_id === p.id) || p.is_scribe;
            const scores = p.archetype_scores || {};
            const dominantScore = scores[p.archetype] !== undefined ? scores[p.archetype] : 75;

            return (
              <div
                key={p.id}
                className="admin-part-card"
                style={{
                  borderLeft: `4px solid ${meta.color}`,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div className="admin-part-left" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <img
                    src={meta.avatar}
                    alt={p.archetype}
                    className="admin-part-avatar"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: `2px solid ${meta.color}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  />
                  <div className="admin-part-meta">
                    <div className="admin-part-name" style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                      {p.first_name} {p.last_name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '3px 0', flexWrap: 'wrap' }}>
                      <span
                        className="admin-part-arch"
                        style={{
                          background: `${meta.color}22`,
                          color: meta.color,
                          border: `1px solid ${meta.color}44`,
                          padding: '2px 7px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {meta.badge || p.archetype}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
                        📊 {dominantScore} / 75 pts
                      </span>
                    </div>
                    {hasTeam ? (
                      <div style={{ fontSize: '0.75rem', color: team ? team.color : '#38bdf8', fontWeight: 600 }}>
                        👥 {team ? team.name : 'Affecté'} {isScribe ? <span style={{ color: '#fbbf24' }}>(✍️ Rédacteur)</span> : <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Conseiller)</span>}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>⏳ En attente d'attribution de groupe</div>
                    )}
                    {teams.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                          className="admin-assign-select"
                          value={p.team_id || ''}
                          onChange={(e) => onAssignTeam(p.id, e.target.value)}
                          style={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            maxWidth: '210px'
                          }}
                        >
                          <option value="">{hasTeam ? '— Retirer du groupe —' : '⚡ Rattacher à une équipe ▾'}</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {p.team_id === t.id ? '✓ ' : ''}{t.name} ({t.archetype}){t.archetype === p.archetype ? ' ⭐ Idéal' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="admin-part-time" style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      Inscrit à {timeStr}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-part-del-btn btn btn-danger-outline btn-xs"
                  onClick={() => onRemoveParticipant(p.id, `${p.first_name} ${p.last_name}`)}
                  title="Retirer ce participant s'il a quitté le workshop"
                >
                  ✕ Retirer
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
