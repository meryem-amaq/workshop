import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WorkshopContext = createContext(null);

export function WorkshopProvider({ children }) {
  // Participant connecté localement
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const saved = localStorage.getItem('smurf_iot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Mode Animateur (déverrouillé par PIN)
  const [isAdmin, setIsAdminState] = useState(() => {
    return localStorage.getItem('smurf_iot_admin') === 'true';
  });

  const [sessionPhase, setSessionPhase] = useState('registration');
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [dbHealth, setDbHealth] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);

  // Modales
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [scribeModalTeamId, setScribeModalTeamId] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('smurf_iot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smurf_iot_user');
    }
  }, []);

  const setAdminMode = useCallback((val) => {
    setIsAdminState(val);
    if (val) {
      localStorage.setItem('smurf_iot_admin', 'true');
      showToast('👑 Espace Animateur déverrouillé !', 'success');
    } else {
      localStorage.removeItem('smurf_iot_admin');
      showToast('Retour au mode participant standard.', 'info');
    }
  }, [showToast]);

  // Rafraîchissement des données de l'API
  const refreshWorkshopData = useCallback(async () => {
    try {
      const [resSession, resTeams, resParticipants, resDeliverables] = await Promise.all([
        fetch('/api/session'),
        fetch('/api/teams'),
        fetch('/api/participants'),
        fetch('/api/deliverables')
      ]);

      let currentPhase = 'registration';
      if (resSession.ok) {
        const sessData = await resSession.json();
        currentPhase = sessData.phase || 'registration';
        setSessionPhase(currentPhase);
      }

      let fetchedTeams = [];
      if (resTeams.ok) {
        fetchedTeams = await resTeams.json();
      }

      let fetchedParts = [];
      if (resParticipants.ok) {
        fetchedParts = await resParticipants.json();
        setParticipants(fetchedParts);
      }

      let fetchedDels = [];
      if (resDeliverables.ok) {
        fetchedDels = await resDeliverables.json();
        setDeliverables(fetchedDels);
      }

      // Lier les livrables à leurs équipes
      const hydratedTeams = fetchedTeams.map((t) => ({
        ...t,
        deliverables: fetchedDels.filter((d) => d.team_id === t.id)
      }));
      setTeams(hydratedTeams);

      // Si l'utilisateur connecté existe, vérifier sa mise à jour (notamment son affectation d'équipe)
      setCurrentUserState((prevUser) => {
        if (!prevUser) return null;
        let found = fetchedParts.find((p) => p.id === prevUser.id);
        if (!found && prevUser.first_name) {
          found = fetchedParts.find((p) => 
            p.first_name && p.first_name.trim().toLowerCase() === prevUser.first_name.trim().toLowerCase()
          );
        }
        if (found) {
          if (JSON.stringify(found) !== JSON.stringify(prevUser)) {
            localStorage.setItem('smurf_iot_user', JSON.stringify(found));
            return found;
          }
        } else if (hydratedTeams.length > 0 && !prevUser.team_id) {
          const myTeam = hydratedTeams.find((t) => (t.members || []).some((m) => m.id === prevUser.id));
          if (myTeam) {
            const updated = { ...prevUser, team_id: myTeam.id };
            localStorage.setItem('smurf_iot_user', JSON.stringify(updated));
            return updated;
          }
        }
        return prevUser;
      });
    } catch {
      // Erreur silencieuse de polling
    }
  }, []);

  // Vérifier la santé MySQL au démarrage
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setDbHealth(data.database);
      }
    } catch {
      // Silencieux
    }
  }, []);

  useEffect(() => {
    checkHealth();
    refreshWorkshopData();
    // Polling toutes les 2.5 secondes
    const interval = setInterval(refreshWorkshopData, 2500);
    return () => clearInterval(interval);
  }, [checkHealth, refreshWorkshopData]);

  return (
    <WorkshopContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        setAdminMode,
        sessionPhase,
        participants,
        teams,
        deliverables,
        dbHealth,
        activeTeamId,
        setActiveTeamId,
        refreshWorkshopData,
        toasts,
        showToast,
        isAdminModalOpen,
        openAdminModal: () => setIsAdminModalOpen(true),
        closeAdminModal: () => setIsAdminModalOpen(false),
        isDbModalOpen,
        openDbModal: () => setIsDbModalOpen(true),
        closeDbModal: () => setIsDbModalOpen(false),
        isQrModalOpen,
        openQrModal: () => setIsQrModalOpen(true),
        closeQrModal: () => setIsQrModalOpen(false),
        scribeModalTeamId,
        openScribeModal: (teamId) => setScribeModalTeamId(teamId),
        closeScribeModal: () => setScribeModalTeamId(null)
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshop() {
  const ctx = useContext(WorkshopContext);
  if (!ctx) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return ctx;
}
