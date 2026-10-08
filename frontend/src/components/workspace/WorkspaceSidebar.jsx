import React from 'react';
import { getArchetypeDisplayName } from '../../constants/workshopData';

export default function WorkspaceSidebar({
  currentTeam,
  teams,
  currentUser,
  isAdmin,
  setActiveTeamId,
  scribeName,
  openScribeModal,
  members
}) {
  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Équipe en Cours</h3>
        <div className="team-selector-wrap">
          <label htmlFor="selectCurrentTeam">Choisir le groupe :</label>
          <select
            id="selectCurrentTeam"
            className="form-select"
            value={currentTeam.id}
            disabled={!isAdmin && Boolean(currentUser?.team_id)}
            onChange={(e) => setActiveTeamId(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({getArchetypeDisplayName(t.archetype)})
              </option>
            ))}
          </select>
        </div>

        {/* Carte récapitulative de l'équipe active */}
        <div className="active-team-card" id="activeTeamCard">
          <div className="active-team-head">
            <img
              src={`/assets/images/${currentTeam.avatar}`}
              alt="Avatar"
              className="active-team-avatar"
              id="teamCardAvatar"
              style={{ borderColor: currentTeam.color }}
            />
            <div>
              <h4 className="active-team-name" id="teamCardName">{currentTeam.name}</h4>
              <span className="active-team-trait" id="teamCardTrait" style={{ color: currentTeam.color }}>
                {getArchetypeDisplayName(currentTeam.archetype)}
              </span>
            </div>
          </div>

          {/* Rédacteur désigné / Contrôle de rôle */}
          <div className="scribe-callout" id="scribeCallout">
            <div className="scribe-header">
              <span className="scribe-badge">✍️ Rédacteur Unique (Porteur de stylo)</span>
            </div>
            <div className="scribe-name" id="teamCardScribeName">{scribeName}</div>
            <p className="scribe-helper">
              Seul le rédacteur possède les droits pour enregistrer les livrables. Les autres membres sont conseillers.
            </p>
            {isAdmin && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                id="btnChangeScribe"
                onClick={() => openScribeModal(currentTeam.id)}
              >
                Modifier le rédacteur
              </button>
            )}
          </div>

          {/* Liste des membres du groupe */}
          <div className="team-members-list-wrap">
            <span className="section-micro-title">Membres du groupe ({members.length}) :</span>
            <ul className="team-members-list" id="teamMembersList">
              {members.length === 0 ? (
                <li className="member-empty">Aucune équipe active</li>
              ) : (
                members.map((m) => {
                  const isMemScribe = m.id === currentTeam.scribe_participant_id || m.is_scribe;
                  const isMe = currentUser && m.id === currentUser.id;
                  return (
                    <li key={m.id} className="team-member-item">
                      <span style={{ color: isMe ? '#38bdf8' : '#fff' }}>
                        {m.first_name} {m.last_name} {isMe ? ' (Vous)' : ''}
                      </span>
                      <span
                        className={`member-pill-badge ${isMemScribe ? 'badge-scribe' : 'badge-counselor'}`}
                        style={{
                          fontSize: '0.7rem',
                          color: isMemScribe ? '#fbbf24' : '#64748b',
                          fontWeight: isMemScribe ? 'bold' : 'normal'
                        }}
                      >
                        {isMemScribe ? '✍️ Rédacteur' : 'Conseiller'}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Aide & Méthodologie Schtroumpf */}
        <div className="methodology-card">
          <h4>🍄 Le Saviez-vous ?</h4>
          <p id="methodologyTip">Chaque étape (« Maison ») valide un jalon décisif du produit connecté. Ne brûlez pas les étapes !</p>
        </div>
      </div>
    </aside>
  );
}
