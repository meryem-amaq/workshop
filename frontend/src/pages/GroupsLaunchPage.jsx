import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { ARCHETYPES } from '../constants/workshopData';
import { ParticipantsListCard, TeamSummaryCard } from '../components/groups';

export default function GroupsLaunchPage() {
  const {
    isAdmin,
    participants,
    teams,
    refreshWorkshopData,
    openAdminModal,
    openScribeModal,
    openQrModal,
    setActiveTeamId,
    showToast
  } = useWorkshop();

  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (!isAdmin) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={{ color: '#fff', margin: '1rem 0' }}>Espace Animateur Réservé</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Veuillez renseigner votre code d'accès animateur pour gérer et lancer la constitution des groupes.
          </p>
          <button type="button" className="btn btn-primary" onClick={openAdminModal}>
            Saisir le Code Animateur ➔
          </button>
        </div>
      </div>
    );
  }

  // Lancement de la constitution des groupes homogènes
  const handleLaunchTeams = async () => {
    if (participants.length === 0) {
      showToast('Aucun participant inscrit. Attendez que les participants scannent le QR code.', 'warning');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/teams/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération des groupes');

      showToast(`🎉 ${data.count} groupes homogènes créés avec succès !`, 'success');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Charger les données de démonstration
  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('🧪 Données démo chargées : 15 participants, 5 équipes, 6 livrables !', 'success');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Réinitialiser le workshop
  const handleResetWorkshop = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser entièrement les données du workshop (participants, équipes et livrables) ?')) {
      return;
    }

    try {
      const res = await fetch('/api/workshop/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Workshop réinitialisé.', 'info');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Retirer un participant
  const handleRemoveParticipant = async (participantId, participantName) => {
    if (!window.confirm(`Confirmez-vous le retrait de ${participantName} du workshop ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/participants/${participantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du retrait du participant');

      showToast(`${participantName} a été retiré de l'atelier.`, 'info');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Assigner manuellement un participant à une équipe
  const handleAssignTeam = async (participantId, teamId) => {
    try {
      showToast('Mise à jour de l\'équipe...', 'info');
      const res = await fetch(`/api/participants/${participantId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: teamId || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'affectation');
      showToast('Participant affecté avec succès !', 'success');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Rattachement automatique en masse des retardataires
  const handleAutoAssignUnassigned = async () => {
    try {
      showToast('Rattachement automatique des retardataires...', 'info');
      const res = await fetch('/api/participants/auto-assign-unassigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du rattachement');
      showToast(`🎉 ${data.assigned} participant(s) rattaché(s) à leur équipe !`, 'success');
      await refreshWorkshopData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const unassignedParticipants = participants.filter((p) => !p.team_id);
  const archetypesList = ['Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif'];

  return (
    <div className="view-panel active">
      <div className="dashboard-container">
        
        {/* Barre de Commande du Lancement des Groupes */}
        <div className="animator-control-bar">
          <div className="control-bar-left">
            <div className="animator-badge">👥 Espace Lancement & Constitution des Groupes</div>
            <div className="live-stats">
              <span className="stat-item"><strong>{participants.length}</strong> Participants Inscrits</span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong>{teams.length}</strong> Groupes Homogènes</span>
              <span className="stat-separator">•</span>
              <span className="stat-item" style={{ color: teams.length > 0 ? '#10b981' : '#38bdf8' }}>
                Phase : {teams.length > 0 ? 'Groupes Prêts (6 Maisons)' : 'Inscriptions en direct'}
              </span>
            </div>
          </div>

          <div className="control-bar-actions">
            {unassignedParticipants.length > 0 && teams.length > 0 && (
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={handleAutoAssignUnassigned}
                style={{ boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}
              >
                ⚡ Rattacher les Retardataires ({unassignedParticipants.length})
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={openQrModal}>
              📱 QR Code Inscription
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm pulse-glow"
              onClick={handleLaunchTeams}
              disabled={generating || participants.length === 0}
            >
              {generating ? 'Formation...' : '⚡ Former les Groupes Homogènes'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSeedDemo}
              disabled={seeding}
              title="Charge 15 participants, 5 équipes et leurs livrables"
            >
              🧪 {seeding ? 'Chargement...' : 'Charger Données Démo'}
            </button>
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={handleResetWorkshop}
              title="Effacer et redémarrer"
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>

        {/* Répartition des 5 Familles Schtroumpfs en Direct */}
        <div className="archetypes-summary-card" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Répartition des 5 Familles Schtroumpfs :
          </h4>
          <div className="archetypes-preview-row" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {archetypesList.map((arch) => {
              const meta = ARCHETYPES[arch];
              const count = participants.filter((p) => p.archetype === arch).length;
              return (
                <div
                  key={arch}
                  className="mini-archetype-chip"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${meta.color}55`,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <img
                    src={meta.avatar}
                    alt={meta.name}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontWeight: 600, color: meta.color }}>{meta.name} :</span>
                  <strong style={{ color: '#fff', background: `${meta.color}33`, padding: '1px 7px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    {count}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRILLE NOMINATIVE DES PARTICIPANTS INSCRITS AVEC LEURS AVATARS 3D */}
        <ParticipantsListCard
          participants={participants}
          teams={teams}
          generating={generating}
          onLaunchTeams={handleLaunchTeams}
          onOpenQrModal={openQrModal}
          onRemoveParticipant={handleRemoveParticipant}
          onAssignTeam={handleAssignTeam}
        />

        {/* LISTE DES GROUPES HOMOGÈNES CONSTITUÉS */}
        <div className="formed-teams-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>🛖 Équipes Formées & Rédacteurs Désignés</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gérez le porteur de stylo (rédacteur officiel) pour chaque groupe</span>
          </div>

          <div className="dashboard-teams-grid">
            {teams.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 1.5rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🍄</span>
                <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>Aucun groupe formé pour le moment</h4>
                <p style={{ fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                  Lorsque les participants auront rempli le questionnaire, cliquez sur <strong>"⚡ Former les Groupes Homogènes"</strong> ci-dessus.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm pulse-glow"
                  onClick={handleLaunchTeams}
                  disabled={generating || participants.length === 0}
                >
                  ⚡ Lancer la Formation des Groupes
                </button>
              </div>
            ) : (
              teams.map((team) => (
                <TeamSummaryCard
                  key={team.id}
                  team={team}
                  onOpenScribeModal={openScribeModal}
                  onRemoveParticipant={handleRemoveParticipant}
                  onNavigateWorkspace={() => {
                    setActiveTeamId(team.id);
                    navigate('/team');
                  }}
                  onNavigateStages={() => navigate('/stages')}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
