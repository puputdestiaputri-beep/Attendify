require('dotenv').config();
const db = require('../config/db');

async function migrate() {
  try {
    await db.query('ALTER TABLE pengguna ADD COLUMN foto_profil TEXT NULL AFTER kelas');
    console.log('✅ Column foto_profil added successfully');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Column foto_profil already exists, skipping');
    } else {
      console.error('❌ Migration failed:', e.message);
      process.exit(1);
    }
  }
  process.exit(0);
}

migrate();
