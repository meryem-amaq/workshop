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

      {/* 2. Livrable Exigé (Lecture seule) */}
      <div className="house-livrable-box">
        <div className="house-livrable-title">
          📄 Livrable exigé pour la Maison 1 : Problématique clairement formulée
        </div>
        <div className="house-formula-code">
          « Pour [utilisateur cible], le problème est [formulation du problème] parce que [cause racine / douleur subie]. »
        </div>
        <p className="house-example-sub">
          Exemple inspirant : « Pour les agriculteurs urbains en permaculture, le problème est la déshydratation imprévue des serres lors des canicules parce qu'ils ne peuvent pas être présents en journée pour réguler l'arrosage. »
        </p>
      </div>

      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 1 (Besoin) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            1. Utilisateur Cible (Persona) :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.targetUser || ''}
            onChange={(e) => onChange('targetUser', e.target.value)}
            placeholder="Ex : Agriculteurs urbains en permaculture, Jardinier amateur..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            2. Formulation du Problème / Douleur majeure :
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={data.problem || ''}
            onChange={(e) => onChange('problem', e.target.value)}
            placeholder="Ex : La déshydratation imprévue des serres lors des fortes chaleurs..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            3. Cause racine / Pourquoi les solutions actuelles échouent :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.cause || ''}
            onChange={(e) => onChange('cause', e.target.value)}
            placeholder="Ex : Ils ne peuvent pas être présents en journée pour surveiller et réguler l'arrosage..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
              4. Formulation Canonique Complète :
            </label>
            {canEdit && (
              <button type="button" className="btn btn-outline btn-xs" onClick={onGenerateFormula}>
                ⚡ Générer automatiquement
              </button>
            )}
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
