import React from 'react';
import { getArchetypeDisplayName } from '../../constants/workshopData';

export default function TeamAssignedCard({
  assignedTeam,
  isScribe,
  scribeName,
  currentUser,
  onNavigateWorkspace
}) {
  return (
    <div id="waitingAssignedState" className="waiting-state-panel">
      <div className="assigned-celebrate-card">
        <div className="assigned-head-row">
          <img
            src={`/assets/images/${assignedTeam.avatar}`}
            alt={assignedTeam.name}
            className="assigned-team-avatar"
            id="assignedTeamAvatar"
          />
          <div>
            <span className="assigned-badge-top">🎉 Votre Équipe est Formée !</span>
            <h3 className="assigned-team-title" id="assignedTeamName" style={{ color: assignedTeam.color }}>
              {assignedTeam.name}
            </h3>
            <div className="assigned-team-trait" id="assignedTeamTrait">
              Archétype dominant : {getArchetypeDisplayName(assignedTeam.archetype)}
            </div>
          </div>
        </div>

        {/* Bannière de rôle (Rédacteur vs Conseiller) */}
        <div className={`role-notice-card ${isScribe ? 'is-scribe' : 'is-counselor'}`} id="assignedRoleCard">
          <div className="role-icon-col" id="assignedRoleIcon">
            {isScribe ? '✍️' : '👥'}
          </div>
          <div className="role-text-col">
            <strong className="role-headline" id="assignedRoleHeadline">
              {isScribe
                ? 'Vous êtes le Rédacteur Unique (Porteur de stylo)'
                : 'Vous êtes Conseiller de l\'Équipe'}
            </strong>
            <p className="role-explanation" id="assignedRoleExplanation">
              {isScribe
                ? 'Vous avez les droits exclusifs de saisie et de validation pour remplir les livrables des 6 Maisons au nom de votre équipe.'
                : `Le rédacteur officiel de votre groupe est ${scribeName}. Participez aux débats et aux orientations ; seul le rédacteur enregistre les livrables.`}
            </p>
          </div>
        </div>

        {/* Membres de l'équipe */}
        <div className="assigned-members-box">
          <h4 className="members-box-title">
            👥 Membres de votre groupe (<span id="assignedMembersCount">{(assignedTeam.members || []).length}</span>) :
          </h4>
          <div className="team-members-list-grid" id="assignedMembersList">
            {(assignedTeam.members || []).map((m) => {
              const isMemScribe = m.id === assignedTeam.scribe_participant_id || m.is_scribe;
              const isMe = m.id === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`assigned-member-pill ${isMe ? 'is-me' : ''} ${isMemScribe ? 'is-scribe' : ''}`}
                >
                  <div className="member-pill-name">
                    {m.first_name} {m.last_name} {isMe ? <small style={{ color: '#38bdf8', marginLeft: '0.3rem', fontSize: '0.75rem' }}>(Vous)</small> : null}
                  </div>
                  <span className={`member-pill-badge ${isMemScribe ? 'badge-scribe' : 'badge-counselor'}`}>
                    {isMemScribe ? '✍️ Rédacteur' : 'Conseiller'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bouton d'accès vers l'espace de travail */}
        <div className="assigned-actions mt-3">
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg pulse-glow"
            id="btnEnterWorkspace"
            onClick={onNavigateWorkspace}
          >
            <span id="btnEnterWorkspaceText">
              {isScribe ? '✍️ Ouvrir l\'Espace de Travail de mon Équipe' : '👀 Découvrir la Maison de mon Équipe'}
            </span>
            <span className="btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
