import React from 'react';

export default function House3Technique({
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
            Vérifier que l'idée peut réellement être réalisée avec les technologies accessibles.
          </div>
          <p className="house-mission-desc">
            Découvrir les technologies du FabLab et concevoir la chaîne technique : Capteur → Traitement → Comms → Utilisateur.
          </p>
        </div>

        <div className="house-guide-card">
          <div className="house-questions-title">❓ QUESTIONS CLÉS À TRANCHER</div>
          <ul className="house-questions-list">
            <li>Quels capteurs utiliser ? (Température, PIR, Ultrasons, pH, Courant...)</li>
            <li>Quel microcontrôleur ? (ESP32, Arduino, Raspberry Pi Pico...)</li>
            <li>Quelle communication réseau ? (WiFi, Bluetooth BLE, LoRaWAN, Zigbee, 4G...)</li>
            <li>Quelle alimentation ? (Batterie LiPo, pile 9V, panneau solaire, secteur...)</li>
          </ul>
        </div>
      </div>

      {/* Bloc Spécial : Architecture Technique Fondamentale (La Chaîne IoT) */}
      <div className="house-guide-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🗂 ARCHITECTURE TECHNIQUE FONDAMENTALE (LA CHAÎNE IOT)
        </div>
        <div className="house-chain-iot-grid">
          <div className="house-chain-step-card">
            <div className="house-chain-step-num">1. CAPTEUR</div>
            <div className="house-chain-step-desc">Température, Humidité, Son, Bouton, PIR, Gaz...</div>
          </div>
          <div className="house-chain-step-card">
            <div className="house-chain-step-num">2. TRAITEMENT</div>
            <div className="house-chain-step-desc">ESP32, Arduino Nano, Raspberry Pico...</div>
          </div>
          <div className="house-chain-step-card">
            <div className="house-chain-step-num">3. COMMUNICATION</div>
            <div className="house-chain-step-desc">WiFi, Bluetooth BLE, LoRaWAN, 4G / NB-IoT...</div>
          </div>
          <div className="house-chain-step-card">
            <div className="house-chain-step-num">4. UTILISATEUR</div>
            <div className="house-chain-step-desc">Dashboard Web, Alerte SMS, Actionneur...</div>
          </div>
        </div>
      </div>

      {/* 2. Livrable Exigé (Lecture seule) */}
      <div className="house-livrable-box">
        <div className="house-livrable-title">
          📄 Livrable exigé pour la Maison 3 : Architecture technique simple
        </div>
        <div className="house-formula-code">
          Capteur [type de capteur] → Traitement [microcontrôleur] → Communication [protocole réseau] → Utilisateur [dashboard / alerte]
        </div>
        <p className="house-example-sub">
          Exemple inspirant : Sonde capacitive d'humidité du sol → Microcontrôleur ESP32 → Réseau LoRaWAN longue portée (faible conso) → Tableau de bord Web & vanne solénoïde 12V.
        </p>
      </div>

      {/* 3. Section Saisie & Travail de l'équipe */}
      <div className="house-input-section">
        <h4 className="house-input-section-title">
          ✍️ Votre travail et réponses pour la Maison 3 (Faisabilité) :
        </h4>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            1. Bloc Capteurs & Conditionnement :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.sensors || ''}
            onChange={(e) => onChange('sensors', e.target.value)}
            placeholder="Ex : Sonde capacitive d'humidité du sol, DS18B20..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            2. Microcontrôleur & Gestion de l'énergie :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.processing || ''}
            onChange={(e) => onChange('processing', e.target.value)}
            placeholder="Ex : Microcontrôleur ESP32 avec mode Deep Sleep, Batterie LiPo 2000mAh..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            3. Protocole Réseau & Transport :
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={data.protocol || ''}
            onChange={(e) => onChange('protocol', e.target.value)}
            placeholder="Ex : Réseau LoRaWAN longue portée (The Things Network, faible consommation)..."
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            4. Plateforme Utilisateur & Restitution / Actionneur :
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={data.cloudUser || ''}
            onChange={(e) => onChange('cloudUser', e.target.value)}
            placeholder="Rédigez ici le travail de votre équipe pour la Maison 3...&#10;Exemple : Sonde capacitive d'humidité du sol → Microcontrôleur ESP32 → Réseau LoRaWAN longue portée (faible conso) → Tableau de bord Web & vanne solénoïde 12V."
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
              onClick={() => onSaveDraft(3)}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canEdit}
              onClick={() => onSaveDeliverable(3)}
            >
              {canEdit ? 'Valider la Maison 3 et Passer au Prototype ➔' : `🔒 Réservé à ${scribeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
