import React from 'react';

export default function WorkspaceRoleBanner({
  isAdmin,
  isScribe,
  currentTeam,
  scribeName
}) {
  return (
    <div
      className={`workspace-role-banner ${
        isAdmin ? 'role-admin-mode' : isScribe ? 'role-scribe-mode' : 'role-counselor-mode'
      }`}
      style={{ marginBottom: '1.5rem' }}
    >
      <div className="role-banner-icon">{isAdmin ? '👑' : isScribe ? '✍️' : '👥'}</div>
      <div className="role-banner-text">
        <h3 className="role-banner-title">
          {isAdmin
            ? 'Mode Animateur (Supervision Globale)'
            : isScribe
            ? 'Mode Rédacteur Unique (Porteur de stylo)'
            : 'Mode Consultation (Conseiller d\'Équipe)'}
        </h3>
        <p className="role-banner-desc">
          {isAdmin ? (
            `Vous supervisez l'équipe ${currentTeam.name}. Vous pouvez modifier les saisies, réassigner le rédacteur ou forcer les étapes.`
          ) : isScribe ? (
            `Vous êtes le Porteur de stylo désigné pour « ${currentTeam.name} ». Vos saisies engagent l'ensemble de votre groupe.`
          ) : (
            <span>
              Le rédacteur désigné pour votre groupe est <strong>{scribeName}</strong>. Participez activement aux réflexions ; vos livrables sont mis à jour en temps réel.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
