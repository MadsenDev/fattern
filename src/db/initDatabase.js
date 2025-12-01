const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');
const { schemaStatements } = require('./schema');

const DATA_ROOT = path.join(os.homedir(), 'Fattern', 'data');
const DB_PATH = path.join(DATA_ROOT, 'fattern.db');

function ensureDataDirectories() {
  const attachmentDir = path.join(DATA_ROOT, 'attachments');
  const exportDir = path.join(os.homedir(), 'Fattern', 'exports');
  const logDir = path.join(os.homedir(), 'Fattern', 'logs');

  [DATA_ROOT, attachmentDir, exportDir, logDir].forEach((dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
  });
}

function applySchema(db) {
  const transaction = db.transaction(() => {
    schemaStatements.forEach((statement) => {
      db.prepare(statement).run();
    });
  });

  transaction();
}

function initializeDatabase() {
  ensureDataDirectories();

  const db = new Database(DB_PATH);
  applySchema(db);

  return { db, dbPath: DB_PATH };
}

module.exports = {
  initializeDatabase,
  DB_PATH,
  DATA_ROOT,
};
