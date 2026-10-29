/**
 * Point d'entrée du module de base de données
 * Module : server/db/index.js
 */

const store = require('./store');
const participantRepo = require('./participantRepo');
const teamRepo = require('./teamRepo');
const deliverableRepo = require('./deliverableRepo');
const sessionRepo = require('./sessionRepo');
const voteRepo = require('./voteRepo');

module.exports = {
  initDatabase: store.initDatabase,
  getStatus: store.getStatus,
  getPool: store.getPool,
  verifyAdminLogin: store.verifyAdminLogin,
  ...participantRepo,
  ...teamRepo,
  ...deliverableRepo,
  ...sessionRepo,
  ...voteRepo
};
