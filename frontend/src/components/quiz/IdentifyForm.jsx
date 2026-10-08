import React from 'react';

export default function IdentifyForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  onSubmit,
  onBack
}) {
  return (
    <div id="screen-identify" className="mobile-card step-screen active">
      {/* Bannière Héros avec l'image 3D des 5 Schtroumpfs */}
      <div className="card-hero card-hero-mini">
        <img
          src="/assets/images/archetypes.jpg"
          alt="Les 5 Schtroumpfs"
          className="hero-image"
        />
        <div className="hero-badge">Étape 1 : Identification</div>
      </div>

      <div className="card-body">
        <div className="identify-header-box text-center" style={{ textAlign: 'center' }}>
          <h2 className="card-title">Bienvenue dans l'Atelier IoT !</h2>
          <p className="card-desc">
            Veuillez renseigner votre prénom et nom pour démarrer votre évaluation de personnalité.
          </p>
        </div>

        {/* Formulaire Nom & Prénom */}
        <form id="formRegistration" className="auth-form" onSubmit={onSubmit}>
          <div className="form-section-divider">
            <span>IDENTIFICATION DU PARTICIPANT</span>
          </div>

          <div className="form-group">
            <label htmlFor="inputFirstName">Prénom *</label>
            <input
              type="text"
              id="inputFirstName"
              className="form-input"
              placeholder="Ex: Amin"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputLastName">Nom *</label>
            <input
              type="text"
              id="inputLastName"
              className="form-input"
              placeholder="Ex: Benali"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Badges des 5 Archétypes Schtroumpfs */}
          <div className="archetypes-preview-row">
            <div className="mini-archetype-chip" title="Créatif & Visuel">
              <span className="chip-color art"></span> Artiste
            </div>
            <div className="mini-archetype-chip" title="Analytique & Structuré">
              <span className="chip-color prof"></span> Professeur (Théoricien)
            </div>
            <div className="mini-archetype-chip" title="Rigoureux & Sceptique">
              <span className="chip-color crit"></span> Critique
            </div>
            <div className="mini-archetype-chip" title="Humain & Bienveillant">
              <span className="chip-color emp"></span> Empathique (Sentimental)
            </div>
            <div className="mini-archetype-chip" title="Athlétique & Maker">
              <span className="chip-color sprt"></span> Sportif (Action Man)
            </div>
          </div>

          {/* Bouton de validation éclatant avec flèche */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg pulse-glow"
            id="btnStartQuiz"
          >
            <span>Commencer le Questionnaire (15 Questions)</span>
            <span className="btn-arrow">➔</span>
          </button>
        </form>
      </div>
    </div>
  );
}
