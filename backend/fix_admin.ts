import db from './src/db';
import bcrypt from 'bcryptjs';

async function fix() {
    const h = await bcrypt.hash('admin123', 10);
    db.prepare('UPDATE users SET password=? WHERE email=?').run(h, 'admin@intelligrocery.com');
    console.log('Fixed admin password');
    process.exit(0);
}

fix();
