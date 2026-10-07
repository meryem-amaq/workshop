const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  console.log('🚀 Initialisation de la base de données MySQL "smurf_iot_village"...');
  
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'smurf_iot_village';

  try {
    console.log(`🔌 Connexion au serveur MySQL ${user}@${host}:${port}...`);
    const conn = await mysql.createConnection({ host, port, user, password });

    console.log(`📦 Création de la base de données "${database}" si elle n'existe pas...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${database}\`;`);

    console.log(`📜 Application des tables du schéma schema.sql...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE') && !s.toLowerCase().startsWith('create database'));

    for (const stmt of statements) {
      await conn.query(stmt);
    }

    console.log('✅ Base de données MySQL configurée avec succès !');
    console.log(`   Base : ${database}`);
    console.log(`   Tables créées : sessions, teams, participants, deliverables, activity_logs`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Échec de l\'initialisation MySQL :', err.message);
    console.error('\nAstuce :');
    console.error('- Assurez-vous que le serveur MySQL est démarré (ex: brew services start mysql ou Docker).');
    console.error('- Vérifiez vos identifiants dans le fichier .env (DB_HOST, DB_USER, DB_PASSWORD, DB_PORT).');
    process.exit(1);
  }
}

run();
