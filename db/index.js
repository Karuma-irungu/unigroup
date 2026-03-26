'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'unigroup.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Optimise for performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// ─── SCHEMA ───────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    company     TEXT,
    phone       TEXT,
    email       TEXT    NOT NULL,
    service     TEXT,
    message     TEXT    NOT NULL,
    ip          TEXT,
    status      TEXT    DEFAULT 'new',
    created_at  DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT (datetime('now'))
  );
`);

// ─── PREPARED STATEMENTS ─────────────────────────────────
const stmts = {
  insertEnquiry: db.prepare(`
    INSERT INTO enquiries (name, company, phone, email, service, message, ip)
    VALUES (@name, @company, @phone, @email, @service, @message, @ip)
  `),

  listEnquiries: db.prepare(`
    SELECT * FROM enquiries ORDER BY created_at DESC
  `),

  updateStatus: db.prepare(`
    UPDATE enquiries SET status = ? WHERE id = ?
  `),

  insertSubscriber: db.prepare(`
    INSERT OR IGNORE INTO subscribers (email) VALUES (?)
  `),
};

module.exports = { db, stmts };
