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

function applyMigrations(db) {
  // Add image_path column to products if it doesn't exist
  try {
    db.prepare('ALTER TABLE products ADD COLUMN image_path TEXT').run();
  } catch (error) {
    // Column already exists, ignore
    if (!error.message.includes('duplicate column')) {
      console.warn('Migration warning (products.image_path):', error.message);
    }
  }

  // Add image_path column to customers if it doesn't exist
  try {
    db.prepare('ALTER TABLE customers ADD COLUMN image_path TEXT').run();
  } catch (error) {
    // Column already exists, ignore
    if (!error.message.includes('duplicate column')) {
      console.warn('Migration warning (customers.image_path):', error.message);
    }
  }
}

function initializeDatabase() {
  ensureDataDirectories();

  const db = new Database(DB_PATH);
  applySchema(db);
  applyMigrations(db);

  return { db, dbPath: DB_PATH };
}

module.exports = {
  initializeDatabase,
  DB_PATH,
  DATA_ROOT,
};
