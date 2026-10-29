import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WorkshopContext = createContext(null);

function isJwtValidLocally(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    const now = Math.floor(Date.now() / 1000);
    return Boolean(payload && payload.exp && payload.exp > now);
  } catch {
    return false;
  }
}

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

  // Mode Super Admin (strictement protégé par un jeton JWT signé et non expiré)
  const [isAdmin, setIsAdminState] = useState(() => {
    // Nettoyer l'ancien booléen non sécurisé s'il existait dans localStorage
    localStorage.removeItem('smurf_iot_admin');
    const token = sessionStorage.getItem('smurf_admin_jwt');
    if (isJwtValidLocally(token)) {
      return true;
    }
    sessionStorage.removeItem('smurf_admin_jwt');
    return false;
  });

  const [sessionPhase, setSessionPhase] = useState('registration');
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [votes, setVotes] = useState([]);
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

  const setAdminMode = useCallback((val, token = null) => {
    localStorage.removeItem('smurf_iot_admin');
    if (val && token && isJwtValidLocally(token)) {
      sessionStorage.setItem('smurf_admin_jwt', token);
      setIsAdminState(true);
    } else if (val) {
      const existing = sessionStorage.getItem('smurf_admin_jwt');
      if (isJwtValidLocally(existing)) {
        setIsAdminState(true);
      } else {
        sessionStorage.removeItem('smurf_admin_jwt');
        setIsAdminState(false);
      }
    } else {
      sessionStorage.removeItem('smurf_admin_jwt');
      setIsAdminState(false);
    }
  }, []);

  // Vérification serveur de la signature du JWT Super Admin
  const verifyAdminSession = useCallback(async () => {
    const token = sessionStorage.getItem('smurf_admin_jwt');
    if (!token || !isJwtValidLocally(token)) {
      sessionStorage.removeItem('smurf_admin_jwt');
      setIsAdminState(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        sessionStorage.removeItem('smurf_admin_jwt');
        setIsAdminState(false);
      }
    } catch {
      // Silencieux en cas de coupure réseau temporaire
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

        const fetchedVotes = data.votes || [];
        setVotes(fetchedVotes);

        const fetchedTeams = data.teams || [];
        const hydratedTeams = fetchedTeams.map((t) => ({
          ...t,
          deliverables: fetchedDels.filter((d) => d.team_id === t.id)
        }));
        setTeams(hydratedTeams);

        // Synchroniser l'utilisateur connecté
        setCurrentUserState((prevUser) => {
          if (!prevUser) return null;
          // Recherche STRICTE par identifiant (jamais par prénom : deux participants peuvent avoir le même prénom)
          const found = fetchedParts.find((p) => p.id === prevUser.id);
          if (found) {
            if (JSON.stringify(found) !== JSON.stringify(prevUser)) {
              localStorage.setItem('smurf_iot_user', JSON.stringify(found));
              return found;
            }
            return prevUser;
          }
          // Si le participant n'existe plus en base (atelier réinitialisé ou participant supprimé)
          const createdMs = prevUser.created_at ? new Date(prevUser.created_at).getTime() : 0;
          const isJustCreated = createdMs > 0 && Date.now() - createdMs < 10000;
          if (!isJustCreated) {
            localStorage.removeItem('smurf_iot_user');
            return null;
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
    verifyAdminSession();
    checkHealth();
    refreshWorkshopData();
    // Polling toutes les 4 secondes (économie de 80% des requêtes réseau)
    const interval = setInterval(refreshWorkshopData, 4000);
    return () => clearInterval(interval);
  }, [verifyAdminSession, checkHealth, refreshWorkshopData]);

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
        votes,
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
