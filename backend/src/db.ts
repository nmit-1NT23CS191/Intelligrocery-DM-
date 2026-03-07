import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../intelligrocery.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database');

export default db;
