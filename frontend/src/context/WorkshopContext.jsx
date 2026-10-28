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
    } else {
      localStorage.removeItem('smurf_iot_admin');
    }
  }, []);

  // Rafraîchissement optimisé des données de l'API (1 seule requête globale /api/state)
  const refreshWorkshopData = useCallback(async () => {
    try {
      const resState = await fetch('/api/state');
      if (resState.ok) {
        const data = await resState.json();
        const currentPhase = data.phase || (data.session && data.session.phase) || 'registration';
        setSessionPhase(currentPhase);

        const fetchedParts = data.participants || [];
        setParticipants(fetchedParts);

        const fetchedDels = data.deliverables || [];
        setDeliverables(fetchedDels);

        const fetchedTeams = data.teams || [];
        const hydratedTeams = fetchedTeams.map((t) => ({
          ...t,
          deliverables: fetchedDels.filter((d) => d.team_id === t.id)
        }));
        setTeams(hydratedTeams);

        // Synchroniser l'utilisateur connecté
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
      }
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
    // Polling toutes les 4 secondes (économie de 80% des requêtes réseau)
    const interval = setInterval(refreshWorkshopData, 4000);
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
