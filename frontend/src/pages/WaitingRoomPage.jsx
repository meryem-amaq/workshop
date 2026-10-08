import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { ARCHETYPES } from '../constants/workshopData';
import {
  ArchetypeShowcaseCard,
  LiveWaitingFeed,
  TeamAssignedCard
} from '../components/waiting';

export default function WaitingRoomPage() {
  const { currentUser, setCurrentUser, participants, teams, sessionPhase, showToast } = useWorkshop();
  const navigate = useNavigate();

  // Chrono
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/register');
    }
  }, [currentUser, navigate]);

  // Tick du chronomètre en direct
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const assignedTeam = currentUser?.team_id 
    ? teams.find((t) => t.id === currentUser.team_id) 
    : (teams.length > 0 && sessionPhase === 'teams_formed' 
      ? (teams.find(t => t.archetype === currentUser?.archetype) || teams[0]) 
      : null);
  const isScribe = assignedTeam && (assignedTeam.scribe_participant_id === currentUser.id || currentUser.is_scribe);
  const scribeMember = assignedTeam?.members?.find((m) => m.id === assignedTeam.scribe_participant_id || m.is_scribe);
  const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Désigné par animateur';

  // Redirection automatique dès que le groupe est constitué par l'animateur
  useEffect(() => {
    if (assignedTeam) {
      showToast(
        `🎉 Votre groupe « ${assignedTeam.name} » est prêt ! Redirection vers votre Espace Équipe...`,
        'success'
      );
      const timeout = setTimeout(() => {
        navigate('/team');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [assignedTeam, navigate, showToast]);

  if (!currentUser) return null;

  const meta = ARCHETYPES[currentUser.archetype] || ARCHETYPES.Professeur;
  const breakdown = currentUser.breakdown || {};
  const scores75 = currentUser.archetype_scores || {};
  const totalSum = currentUser.total_sum || Object.values(scores75).reduce((a, b) => a + b, 0);

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="view-panel active">
      <div className="participant-screen-container">
        {/* ÉCRAN 1.3 : Attribution du Profil, Grille des 5 Scores & Attente (Design exact) */}
        <div id="screen-result" className="mobile-card step-screen active">
          <div className="result-header">
            <div className="result-confetti">🎉</div>
            <h2 className="result-greeting">
              Félicitations, <span>{currentUser.first_name} {currentUser.last_name}</span> !
            </h2>
            <p className="result-lead">
              Votre profil psychologique Schtroumpf a été calculé avec succès :
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                style={{ color: '#94a3b8', fontSize: '0.78rem' }}
                onClick={() => {
                  if (window.confirm('Voulez-vous modifier votre nom ou repasser le questionnaire ?')) {
                    setCurrentUser(null);
                    navigate('/register');
                  }
                }}
              >
                🔄 Changer de participant / Recommencer
              </button>
            </div>
          </div>

          {/* BANNIÈRE IMMÉDIATE DÈS QUE LE GROUPE EST CONSTITUÉ (EN HAUT DE L'ÉCRAN) */}
          {assignedTeam && (
            <div className="team-formed-alert-banner" id="resTeamFormedBanner" style={{ display: 'flex' }}>
              <div className="alert-banner-icon">🎉</div>
              <div className="alert-banner-content" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  Groupe Constitué !
                </div>
                <h3 id="resTeamFormedTitle" style={{ color: '#fff', margin: '0.2rem 0', fontSize: '1.15rem' }}>
                  Votre équipe : « {assignedTeam.name} »
                </h3>
                <p id="resTeamFormedRole" style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {isScribe ? (
                    <>Rôle officiel : <strong>✍️ Rédacteur Unique (Porteur de stylo)</strong> — Droits de saisie officiels des 6 Maisons.</>
                  ) : (
                    <>Rôle officiel : <strong>👥 Conseiller d'Équipe</strong> — Le rédacteur officiel est <em>{scribeName}</em>.</>
                  )}
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg pulse-glow mt-3"
                  onClick={() => navigate('/team')}
                >
                  🚀 Entrer dans l'Espace Équipe ➔
                </button>
              </div>
            </div>
          )}

          {/* Carte du profil Schtroumpf 3D, super-pouvoirs & répartition */}
          <ArchetypeShowcaseCard
            currentUser={currentUser}
            meta={meta}
            breakdown={breakdown}
            scores75={scores75}
            totalSum={totalSum}
          />

          {/* Salle d'Attente Interactive & Direct du Workshop */}
          <div className="team-waiting-box" id="teamWaitingBox">
            {!assignedTeam ? (
              <LiveWaitingFeed
                participants={participants}
                timeFormatted={timeFormatted}
              />
            ) : (
              <TeamAssignedCard
                assignedTeam={assignedTeam}
                isScribe={isScribe}
                scribeName={scribeName}
                currentUser={currentUser}
                onNavigateWorkspace={() => navigate('/team')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
