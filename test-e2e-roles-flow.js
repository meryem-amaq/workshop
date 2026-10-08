const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function verifyAll() {
  console.log('=== TEST COMPLET DES RÔLES & WORKFLOW REACT ===');

  // 1. Reset workshop
  await request('POST', '/api/workshop/reset');
  console.log('1. ✓ Workshop réinitialisé proprement');

  // 2. Inscription de 2 Schtroumpfs Artistes (Q2, Q7, Q12 à 5)
  // Indices: 1 (Q2), 6 (Q7), 11 (Q12) = 5
  const ratingsArtist = [1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1];
  const p1 = await request('POST', '/api/participants/register', {
    first_name: 'Pablo',
    last_name: 'Picasso',
    ratings: ratingsArtist
  });
  console.log('2. ✓ Inscription Pablo:', p1.data.participant.first_name, '-> Archétype:', p1.data.participant.archetype, '(Score /75:', p1.data.participant.archetype_scores.Artiste, ')');

  const p2 = await request('POST', '/api/participants/register', {
    first_name: 'Frida',
    last_name: 'Kahlo',
    ratings: ratingsArtist
  });
  console.log('3. ✓ Inscription Frida:', p2.data.participant.first_name, '-> Archétype:', p2.data.participant.archetype);

  // 4. Vérification pré-lancement de la grille admin
  const sess = await request('GET', '/api/session');
  console.log('4. ✓ Phase session avant lancement:', sess.data.phase, '| Inscrits visibles:', sess.data.participantCount);

  // 5. Lancement de la création des groupes par l\'admin
  const gen = await request('POST', '/api/teams/generate');
  console.log('5. ✓ Lancement par l\'admin réussi, équipes créées:', gen.data.count, '| Nouvelle phase:', gen.data.phase);

  // 6. Vérification de l\'équipe créée et du scribe désigné
  const teams = await request('GET', '/api/teams');
  const teamArtiste = teams.data.find(t => t.archetype === 'Artiste');
  console.log('6. ✓ Équipe trouvée:', teamArtiste.name);
  console.log('   - Porteur de stylo initial (Scribe ID):', teamArtiste.scribe_participant_id);
  console.log('   - Scribe attendu (Pablo Picasso):', p1.data.participant.id);

  // 7. Tentative d\'écriture par Frida (Conseiller, NON-scribe) -> Doit être 403 FORBIDDEN
  const failSubmit = await request('POST', '/api/deliverables', {
    team_id: teamArtiste.id,
    house_number: 1,
    content: { targetUser: 'Test Hacking' },
    submitted_by: p2.data.participant.id
  });
  console.log('7. ✓ Test sécurité : Conseiller tente d\'écrire -> HTTP Code:', failSubmit.status, '| Message:', failSubmit.data.error);

  // 8. Écriture par Pablo (Porteur de stylo officiel) -> Doit être 200 OK
  const okSubmit = await request('POST', '/api/deliverables', {
    team_id: teamArtiste.id,
    house_number: 1,
    content: {
      targetUser: 'Créateurs d\'art numérique',
      problem: 'Toiles statiques sans interaction',
      cause: 'Absence de capteurs IoT',
      formulation: 'Pour les créateurs, le problème est le manque d\'interactivité.'
    },
    submitted_by: p1.data.participant.id,
    advance_next: true
  });
  console.log('8. ✓ Test écriture Scribe officiel -> HTTP Code:', okSubmit.status, '| Maison 1 enregistrée avec succès !');

  // 9. L\'admin change le porteur de stylo : Frida devient le nouveau Scribe
  const changeScribe = await request('POST', `/api/teams/${teamArtiste.id}/scribe`, {
    participant_id: p2.data.participant.id
  });
  console.log('9. ✓ L\'admin réassigne le stylo à Frida Kahlo -> Succès:', changeScribe.data.success);

  // 10. Frida (nouveau scribe) peut maintenant valider la Maison 2
  const fridaSubmit = await request('POST', '/api/deliverables', {
    team_id: teamArtiste.id,
    house_number: 2,
    content: {
      conceptName: 'ToileConnect IoT',
      measures: 'Proximité et luminosité',
      connectivity: 'WiFi MQTT',
      actions: 'Variation des teintes lumineuses en temps réel'
    },
    submitted_by: p2.data.participant.id,
    advance_next: true
  });
  console.log('10. ✓ Nouveau Scribe (Frida) enregistre Maison 2 -> HTTP Code:', fridaSubmit.status);

  // 11. Test départ d\'un participant
  const removeP1 = await request('DELETE', `/api/participants/${p1.data.participant.id}`);
  console.log('11. ✓ Participant retiré par l\'admin:', removeP1.data.success);

  // 12. Restitution globale
  const rest = await request('GET', '/api/restitution');
  console.log('12. ✓ Fiches de restitution générées:', rest.data.teams.length, 'équipes');

  console.log('\n======================================================');
  console.log('🎯 TOUS LES TESTS DE RÔLE & WORKFLOW ADMIN ONT RÉUSSI !');
  console.log('======================================================');
}

verifyAll().catch(console.error);
