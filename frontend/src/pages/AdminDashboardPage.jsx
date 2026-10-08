import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';
import CarteInteractiveVillage from '../components/village/CarteInteractiveVillage';

export default function AdminDashboardPage() {
  const {
    isAdmin,
    participants,
    teams,
    deliverables,
    openAdminModal,
    openQrModal,
    setActiveTeamId
  } = useWorkshop();

  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="view-panel active">
        <div className="participant-screen-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={{ color: '#fff', margin: '1rem 0' }}>Espace Animateur Réservé</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Veuillez renseigner votre code d'accès animateur pour accéder à la carte interactive 3D du Village.
          </p>
          <button type="button" className="btn btn-primary" onClick={openAdminModal}>
            Saisir le Code Animateur ➔
          </button>
        </div>
      </div>
    );
  }

  // Formatage des équipes pour le composant CarteInteractiveVillage
  const formattedTeams = teams.map((t) => ({
    id: t.id,
    groupName: t.name,
    personalityProfile: t.archetype || 'Professeur',
    currentStage: t.current_house || 1
  }));

  return (
    <div className="view-panel active">
      <div className="dashboard-container">
        
        {/* En-tête statistiques globales du Village (Carte Standalone) */}
        <div className="animator-control-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="control-bar-left">
            <div className="animator-badge">🍄 Carte 3D Interactive du Village IoT</div>
            <div className="live-stats">
              <span className="stat-item"><strong id="statParticipantsCount">{participants.length}</strong> Inscrits</span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong id="statTeamsCount">{teams.length}</strong> Équipes</span>
              <span className="stat-separator">•</span>
              <span className="stat-item"><strong id="statDeliverablesCount">{deliverables.length}</strong> Livrables</span>
            </div>
          </div>

          <div className="control-bar-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/launch')}>
              👥 Gérer les Groupes
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/stages')}>
              📋 Voir Détail 6 Maisons
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openQrModal}>
              📱 QR Code
            </button>
          </div>
        </div>

        {/* CARTE INTERACTIVE DU VILLAGE DES SCHTROUMPFS */}
        <div style={{ marginBottom: '2rem' }}>
          <CarteInteractiveVillage
            teams={formattedTeams}
            onTeamClick={(team) => {
              setActiveTeamId(team.id);
              navigate('/team');
            }}
            enableDemoSimulation={teams.length === 0}
          />
        </div>

      </div>
    </div>
  );
}

