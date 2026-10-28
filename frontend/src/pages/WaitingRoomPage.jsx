import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import {
  LiveWaitingFeed,
  TeamAssignedCard
} from '../components/waiting';

export default function WaitingRoomPage() {
  const { currentUser, setCurrentUser, participants, teams, showToast } = useWorkshop();
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

  // Le groupe n'est révélé qu'une fois attribué par l'animateur (aucun caractère avant le lancement)
  const assignedTeam = currentUser
    ? (currentUser.team_id
        ? teams.find((t) => t.id === currentUser.team_id)
        : teams.find((t) => (t.members || []).some((m) => m.id === currentUser.id))) || null
    : null;
  const isScribe = Boolean(
    assignedTeam && currentUser &&
    (assignedTeam.scribe_participant_id === currentUser.id || currentUser.is_scribe)
  );
  const scribeMember = assignedTeam?.members?.find((m) => m.id === assignedTeam.scribe_participant_id || m.is_scribe);
  const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Désigné par animateur';

  // Notification bienveillante lorsque le groupe est prêt (affichée 1 seule fois)
  const notifiedTeamIdRef = React.useRef(null);
  useEffect(() => {
    if (assignedTeam && notifiedTeamIdRef.current !== assignedTeam.id) {
      notifiedTeamIdRef.current = assignedTeam.id;
      showToast(
        `🎉 Votre groupe « ${assignedTeam.name} » est prêt ! Cliquez ci-dessous pour entrer dans votre Espace Équipe.`,
        'success'
      );
    }
  }, [assignedTeam?.id, assignedTeam?.name, showToast]);

  if (!currentUser) return null;

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="view-panel active">
      <div className="participant-screen-container">
        <div id="screen-result" className="mobile-card step-screen active">
          <div className="result-header">
            <div className="result-confetti">🎉</div>
            <h2 className="result-greeting">
              {assignedTeam ? 'Félicitations, ' : 'Merci, '}
              <span>{currentUser.first_name} {currentUser.last_name}</span> !
            </h2>
            <p className="result-lead">
              {assignedTeam
                ? 'L\'animateur a constitué les groupes. Voici votre équipe :'
                : 'Votre questionnaire est enregistré. Patientez : l\'animateur va bientôt constituer les groupes.'}
            </p>
            {!assignedTeam && (
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
            )}
          </div>

          {/* Salle d'Attente (sans caractère) ou Équipe attribuée (avatar + nom de l'équipe) */}
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
