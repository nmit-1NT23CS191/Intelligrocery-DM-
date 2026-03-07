import db from './db';
import fs from 'fs';
import path from 'path';

function initDb() {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    try {
        db.exec(sql);
        console.log('✅ SQLite Database initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    }
}

initDb();
