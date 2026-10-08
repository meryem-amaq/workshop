import React from 'react';

export default function House4Prototype({
  data,
  onChange,
  canEdit,
  scribeName,
  onSaveDraft,
  onSaveDeliverable,
  onPrevHouse
}) {
  return (
    <div className="house-step-content">
      {/* 1. Guide Pédagogique & Mission (Lecture seule) */}
      <div className="house-pedagogical-grid">
        <div className="house-guide-card">
          <div className="house-mission-title">✨ MISSION DE L'ÉQUIPE</div>
          <div className="house-mission-heading">
            Passer de l'idée à une première représentation concrète et tangible du produit.
          </div>
          <p className="house-mission-desc">
            Matérialiser la forme, l'ergonomie et le fonctionnement conceptuel sans matériel complexe requis.
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>À quoi ressemble le produit ? (Dimensions, forme, matériaux, boutons)</li>
            <li>Comment fonctionne-t-il dans les mains de l'utilisateur ?</li>
            <li>Quels composants logent à l'intérieur du boîtier ?</li>
            <li>Comment le prototype est-il fabriqué ? (Carton, maquette Figma, schéma Tinkercad, impression 3D)</li>
          </ul>
        </div>
      </div>

      {/* 2. Livrable Exigé (Lecture seule) */}
      <div className="house-livrable-box">
        <div className="house-livrable-title">
          📄 Livrable exigé pour la Maison 4 : Prototype conceptuel & scénario d'usage
        </div>
        <div className="house-formula-code">
          Maquette physique/visuelle + Schéma fonctionnel illustrant le comportement du produit dans son environnement réel.
        </div>
        <p className="house-example-sub">
          Exemple inspirant : Maquette en carton échelle 1:1 du boîtier étanche IP65 avec pointeau de terre amovible, voyant LED d'état tricolore et bouton d'appairage.
        </p>
      </div>

      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 4 (Prototype) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            1. Description de la Maquette & Boîtier :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.prototypeType || ''}
            onChange={(e) => onChange('prototypeType', e.target.value)}
            placeholder="Ex : Boîtier étanche IP65 imprimé en 3D avec pointeau de sol et voyant LED..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.35rem' }}>
            📸 2. Photo / Lien ou Schéma de la Maquette :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.prototypePhoto || ''}
            onChange={(e) => onChange('prototypePhoto', e.target.value)}
            placeholder="Ex : Lien image ou descriptif visuel (ex: Maquette carton + ESP32 + LED)..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            3. Scénario d'Usage Étape par Étape (Storyboard) :
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={data.usageScenario || ''}
            onChange={(e) => onChange('usageScenario', e.target.value)}
            placeholder="1. L'usager plante le boîtier en terre. 2. Il l'appaire via l'application mobile. 3. Le boîtier transmet les alertes automatiquement."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            4. Protocole de Test & Critères de Validation du POC :
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={data.testProtocol || ''}
            onChange={(e) => onChange('testProtocol', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 4...&#10;Exemple : Maquette en carton échelle 1:1 du boîtier étanche IP65 avec pointeau de terre amovible, voyant LED d'état tricolore et bouton d'appairage."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={onPrevHouse}>
            ← Maison précédente
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canEdit}
              onClick={() => onSaveDraft(4)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(4)}
            >
              {canEdit ? 'Valider la Maison 4 et Passer au Business ➔' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
