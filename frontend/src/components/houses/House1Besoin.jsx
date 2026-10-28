import React from 'react';

export default function House1Besoin({
  data,
  onChange,
  canEdit,
  scribeName,
  onSaveDraft,
  onSaveDeliverable,
  onGenerateFormula
}) {
  return (
    <div className="house-step-content">
      {/* 1. Guide Pédagogique & Mission (Lecture seule) */}
      <div className="house-pedagogical-grid">
        <div className="house-guide-card">
          <div className="house-mission-title">✨ MISSION DE L'ÉQUIPE</div>
          <div className="house-mission-heading">
            Identifier un problème réel rencontré par une personne, une entreprise ou une communauté.
          </div>
          <p className="house-mission-desc">
            Ne partez pas de la technologie mais de la douleur vécue au quotidien par l'utilisateur cible.
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>Qui rencontre le problème ? (Utilisateur précis / personas)</li>
            <li>Quel est son besoin fondamental ?</li>
            <li>Dans quelle situation ou contexte précis ?</li>
            <li>À quelle fréquence ce problème se produit-il ?</li>
          </ul>
        </div>
      </div>


      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 1 (Besoin) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
              Votre réponse pour cette Maison :
            </label>
            
          </div>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={data.formulation || ''}
            onChange={(e) => onChange('formulation', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 1...&#10;Exemple : « Pour les agriculteurs urbains en permaculture, le problème est la déshydratation imprévue des serres lors des canicules parce qu'ils ne peuvent pas être présents en journée pour réguler l'arrosage. »"
            className="input-field"
            style={{ width: '100%', borderColor: '#38bdf8' }}
          />
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!canEdit}
            onClick={() => onSaveDraft(1)}
          >
            💾 Sauvegarder Brouillon
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canEdit}
            onClick={() => onSaveDeliverable(1)}
          >
            {canEdit ? 'Valider la Maison 1 et Passer au Concept ➔' : `🔒 Réservé à ${scribeName}`}
          </button>
        </div>
      </div>
    </div>
  );
}
