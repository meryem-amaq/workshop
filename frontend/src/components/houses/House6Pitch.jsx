import React from 'react';

export default function House6Pitch({
  data,
  onChange,
  canEdit,
  scribeName,
  onSaveDraft,
  onSaveDeliverable,
  onPrevHouse,
  pitchRunning,
  setPitchRunning,
  pitchSeconds,
  setPitchSeconds,
  pitchFormatted
}) {
  return (
    <div className="house-step-content">
      {/* 1. Guide Pédagogique & Mission (Lecture seule) */}
      <div className="house-pedagogical-grid">
        <div className="house-guide-card">
          <div className="house-mission-title">✨ MISSION DE L'ÉQUIPE</div>
          <div className="house-mission-heading">
            Vérifier si le produit peut réellement trouver sa place sur le marché et convaincre.
          </div>
          <p className="house-mission-desc">
            Construire le mini-plan de lancement commercial et réussir le pitch de 3 minutes !
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>Existe-t-il réellement des clients prêts à payer ?</li>
            <li>Combien seraient-ils prêts à débourser (willingness to pay) ?</li>
            <li>Existe-t-il déjà des solutions concurrentes (directes ou indirectes) ?</li>
            <li>Qu'est-ce qui rend notre solution unique et irremplaçable ?</li>
          </ul>
        </div>
      </div>

      {/* CHRONOMÈTRE DU PITCH FINAL (3 MINUTES) */}
      <div className="house-stopwatch-banner">
        <div>
          <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⏱️ CHRONOMÈTRE DU PITCH FINAL (3 MINUTES)
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
            Présentez votre projet IoT devant le village en 180 secondes chrono !
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="house-stopwatch-digits" style={{ color: pitchSeconds <= 30 && pitchRunning ? '#ef4444' : '#38bdf8' }}>
            {pitchFormatted}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.6rem 1rem', fontSize: '1rem' }}
            onClick={() => setPitchRunning(!pitchRunning)}
          >
            {pitchRunning ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.6rem 0.9rem', fontSize: '1rem' }}
            onClick={() => {
              setPitchRunning(false);
              setPitchSeconds(180);
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* 🎮 Mini-Jeu Spécial : L'Apocalypse des Schtroumpfs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(236, 72, 153, 0.35)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(236, 72, 153, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🎮</span>
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.98rem' }}>
              Défi Interactif : L'Apocalypse des Schtroumpfs
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '2px' }}>
              Testez votre réactivité dans le mini-jeu connecté avant le pitch final !
            </div>
          </div>
        </div>
        <a
          href="https://smurfs-apocalypse-armagadan.ai.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            borderColor: '#ec4899',
            color: '#fff',
            fontWeight: '700',
            fontSize: '0.88rem',
            padding: '0.55rem 1.1rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '10px'
          }}
        >
          <span>🕹️ Lancer le Jeu</span>
          <span>➔</span>
        </a>
      </div>


      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 6 (Marché & Pitch) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            Script & Punchlines du Pitch (3 Minutes Chrono) :
          </label>
          <textarea
            rows={4}
            disabled={!canEdit}
            value={data.pitchScript || ''}
            onChange={(e) => onChange('pitchScript', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 6...&#10;Exemple : Maraîchers bio périurbains ➔ 89€ + 5€/mois ➔ Concurrent : sondes manuelles ou pro à 600€ ➔ Différenciation : plug-and-play solaire sans configuration ➔ Canal : salon Tech & Bio + campagne précommande Ulule."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline" onClick={onPrevHouse}>
              ← Maison précédente
            </button>
            <a
              href="https://smurfs-apocalypse-armagadan.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                borderColor: '#ec4899',
                color: '#f472b6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none'
              }}
              title="Ouvrir le jeu dans un nouvel onglet"
            >
              🎮 L'Apocalypse des Schtroumpfs ↗
            </a>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canEdit}
              onClick={() => onSaveDraft(6)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(6)}
            >
              {canEdit ? '🏆 Clôturer les 6 Maisons et Voir la Restitution' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
