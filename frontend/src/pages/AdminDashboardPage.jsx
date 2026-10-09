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

