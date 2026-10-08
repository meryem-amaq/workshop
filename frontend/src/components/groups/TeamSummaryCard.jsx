import React from 'react';
import { ARCHETYPES, getArchetypeDisplayName } from '../../constants/workshopData';

export default function TeamSummaryCard({
  team,
  onOpenScribeModal,
  onRemoveParticipant,
  onNavigateWorkspace,
  onNavigateStages
}) {
  const scribeMember =
    (team.members || []).find((m) => m.id === team.scribe_participant_id || m.is_scribe) || team.scribe;
  const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

  return (
    <div
      className="dash-team-card"
      style={{
        borderTop: `3px solid ${team.color}`,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}
    >
      <div className="dash-team-head" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '1rem' }}>
        <img
          src={`/assets/images/${team.avatar}`}
          alt={team.name}
          className="dash-team-avatar"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            objectFit: 'cover',
            border: `2px solid ${team.color}`
          }}
        />
        <div style={{ flex: 1 }}>
          <div className="dash-team-title" style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
            {team.name}
          </div>
          <div className="dash-team-sub" style={{ fontSize: '0.8rem', color: team.color }}>
            {getArchetypeDisplayName(team.archetype)} • {(team.members || []).length} membres
          </div>
        </div>
      </div>

      {/* Rédacteur Unique (Porteur de stylo) */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            ✍️ Rédacteur Unique : <strong style={{ color: '#fbbf24' }}>{scribeName}</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            style={{ padding: '2px 7px', fontSize: '0.72rem' }}
            onClick={() => onOpenScribeModal(team.id)}
          >
            Changer
          </button>
        </div>
      </div>

      {/* Liste des membres du groupe */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
          Membres du groupe :
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {(team.members || []).map((m) => {
            const isScribe = m.id === team.scribe_participant_id || m.is_scribe;
            const mMeta = ARCHETYPES[m.archetype] || ARCHETYPES.Professeur;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.4rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img
                    src={mMeta.avatar}
                    alt={m.first_name}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>{m.first_name} {m.last_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isScribe ? (
                    <span className="member-pill-badge badge-scribe" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      ✍️ Rédacteur
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Conseiller</span>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-xs"
                    style={{ padding: '1px 5px', fontSize: '0.65rem' }}
                    onClick={() => onRemoveParticipant(m.id, `${m.first_name} ${m.last_name}`)}
                    title="Retirer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-outline btn-xs"
          style={{ flex: 1 }}
          onClick={onNavigateStages}
        >
          📋 Voir 6 Maisons
        </button>
        <button
          type="button"
          className="btn btn-primary btn-xs"
          style={{ flex: 1 }}
          onClick={onNavigateWorkspace}
        >
          ✍️ Espace Rédaction
        </button>
      </div>
    </div>
  );
}
