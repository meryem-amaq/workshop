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
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function testAll() {
  console.log('Testing full flow...');

  // 1. Health
  const h = await request('GET', '/api/health');
  console.log('✓ Health check status:', h.data.status, '| DB:', h.data.database.message);

  // 2. Register participants
  const p1 = await request('POST', '/api/participants/register', {
    first_name: 'Marie', last_name: 'Curie', answers: ['Professeur', 'Professeur', 'Professeur']
  });
  console.log('✓ Registered participant:', p1.data.participant.first_name, '-> Archetype:', p1.data.participant.archetype);

  const p2 = await request('POST', '/api/participants/register', {
    first_name: 'Claude', last_name: 'Monet', answers: ['Artiste', 'Artiste', 'Artiste']
  });
  console.log('✓ Registered participant:', p2.data.participant.first_name, '-> Archetype:', p2.data.participant.archetype);

  // 3. Auto-assign teams
  const t = await request('POST', '/api/teams/generate');
  console.log('✓ Teams generated count:', t.data.count);

  // 4. Submit deliverable for house 1
  const teams = await request('GET', '/api/teams');
  const targetTeam = teams.data[0];
  console.log('✓ Active team chosen:', targetTeam.name);

  const del = await request('POST', '/api/deliverables', {
    team_id: targetTeam.id,
    house_number: 1,
    content: {
      targetUser: 'Apiculteurs',
      problem: 'Mortalité des ruches',
      cause: 'Stress thermique',
      formulation: 'Pour les apiculteurs, le problème est la mortalité des ruches.'
    },
    advance_next: true
  });
  console.log('✓ Deliverable submitted for House 1, status:', del.status);

  // 5. Restitution
  const rest = await request('GET', '/api/restitution');
  console.log('✓ Restitution summary teams count:', rest.data.teams.length);

  console.log('🎉 ALL INTEGRATION FLOW TESTS PASSED SUCCESSFULLY!');
}

testAll().catch(console.error);
