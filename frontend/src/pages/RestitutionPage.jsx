import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { getArchetypeDisplayName } from '../constants/workshopData';
import { RestitutionTeamCard } from '../components/restitution';

export default function RestitutionPage() {
  const { teams, showToast } = useWorkshop();
  const [filterTeamId, setFilterTeamId] = useState('all');

  const filteredTeams = filterTeamId === 'all' ? teams : teams.filter((t) => t.id === filterTeamId);

  // Export en fichier Markdown
  const handleExportMarkdown = () => {
    let md = `# LE VILLAGE IoT DES SCHTROUMPFS - RESTITUTION FINALE DES PROJETS\n`;
    md += `Date d'exportation : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;
    md += `Ce document synthétise les travaux des équipes formées par archétype Schtroumpf à travers les 6 Maisons du Village IoT.\n\n`;
    md += `---\n\n`;

    teams.forEach((t, idx) => {
      const dels = t.deliverables || [];
      const d1 = dels.find((d) => d.house_number === 1)?.content || {};
      const d2 = dels.find((d) => d.house_number === 2)?.content || {};
      const d3 = dels.find((d) => d.house_number === 3)?.content || {};
      const d4 = dels.find((d) => d.house_number === 4)?.content || {};
      const d5 = dels.find((d) => d.house_number === 5)?.content || {};
      const d6 = dels.find((d) => d.house_number === 6)?.content || {};

      const scribeMember =
        (t.members || []).find((m) => m.id === t.scribe_participant_id || m.is_scribe) || t.scribe;
      const scribeName = scribeMember ? `${scribeMember.first_name} ${scribeMember.last_name}` : 'Non désigné';

      md += `## ${idx + 1}. Équipe : ${t.name} (${getArchetypeDisplayName(t.archetype)})\n\n`;
      md += `- **Progression :** Maison ${t.current_house}/6 (${t.progress_percent}%)\n`;
      md += `- **Rédacteur Officiel (Porteur de stylo) :** ${scribeName}\n`;
      md += `- **Membres :** ${(t.members || []).map((m) => `${m.first_name} ${m.last_name}`).join(', ') || 'Aucun'}\n\n`;

      md += `### Maison 1 — Besoin (16%)\n`;
      md += `- **Utilisateur Cible :** ${d1.targetUser || 'N/A'}\n`;
      md += `- **Problème / Douleur :** ${d1.problem || 'N/A'}\n`;
      md += `- **Formule Canonique :** ${d1.formulation || 'N/A'}\n\n`;

      md += `### Maison 2 — Idée IoT (33%)\n`;
      md += `- **Nom du Produit :** ${d2.conceptName || 'N/A'}\n`;
      md += `- **Grandeurs Mesurées :** ${d2.measures || 'N/A'}\n`;
      md += `- **Connectivité :** ${d2.connectivity || 'N/A'}\n`;
      md += `- **Action Déclenchée :** ${d2.actions || 'N/A'}\n\n`;

      md += `### Maison 3 — Faisabilité Technique (50%)\n`;
      md += `- **Capteurs :** ${d3.sensors || 'N/A'}\n`;
      md += `- **Microcontrôleur & Énergie :** ${d3.processing || 'N/A'}\n`;
      md += `- **Protocole Réseau :** ${d3.protocol || 'N/A'}\n`;
      md += `- **Cloud & Restitution :** ${d3.cloudUser || 'N/A'}\n\n`;

      md += `### Maison 4 — Prototype (66%)\n`;
      md += `- **Maquette Physique :** ${d4.prototypeType || 'N/A'}\n`;
      md += `- **Scénario d'Usage :** ${d4.usageScenario || 'N/A'}\n`;
      md += `- **Protocole de Validation :** ${d4.testProtocol || 'N/A'}\n\n`;

      md += `### Maison 5 — Business Model Canvas (83%)\n`;
      md += `- **Proposition de Valeur :** ${d5.bmcValue || 'N/A'}\n`;
      md += `- **Segments Clients :** ${d5.bmcSegments || 'N/A'}\n`;
      md += `- **Flux de Revenus :** ${d5.bmcRevenues || 'N/A'}\n`;
      md += `- **Structure de Coûts :** ${d5.bmcCosts || 'N/A'}\n\n`;

      md += `### Maison 6 — Marché & Pitch (100%)\n`;
      md += `- **Plan de Lancement :** ${d6.launchPlan || 'N/A'}\n`;
      md += `- **Objectifs 12 Mois :** ${d6.targetMetrics || 'N/A'}\n`;
      md += `> **Script du Pitch :**\n> ${d6.pitchScript || 'N/A'}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restitution_village_iot_schtroumpfs_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 Rapport Markdown exporté avec succès !', 'success');
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="view-panel active">
      <div className="restitution-container">
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊 Restitution Finale des Projets IoT</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Synthèse complète des livrables des 6 Maisons par groupe Schtroumpf pour le débriefing et la soutenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleToggleFullscreen}>
              🖥️ Plein Écran
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleExportMarkdown}>
              📄 Exporter en Markdown (.md)
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button
            type="button"
            className={`filter-pill ${filterTeamId === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTeamId('all')}
          >
            Tous les Groupes ({teams.length})
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`filter-pill ${filterTeamId === t.id ? 'active' : ''}`}
              onClick={() => setFilterTeamId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Team Deliverables Sheets */}
        {filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h3>Aucun livrable disponible pour l'instant.</h3>
            <p>Les fiches de restitution apparaîtront au fur et à mesure que les équipes valident les 6 Maisons.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredTeams.map((team) => (
              <RestitutionTeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
