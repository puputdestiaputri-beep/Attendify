const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations/003_create_manual_scan_permission.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration 003...');
    
    // Execute each statement
    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.includes('DESCRIBE') && !s.includes('SELECT'));
    
    for (let stmt of statements) {
      console.log('Executing:', stmt.substring(0, 50) + '...');
      await db.query(stmt);
      console.log('✓ Done');
    }
    
    // Verify
    const [permissions] = await db.query('DESCRIBE manual_scan_permission');
    const [absensiCols] = await db.query("DESCRIBE absensi WHERE Field = 'manual_mode'");
    
    console.log('\\n✅ Migration 003 SUCCESS!');
    console.log('manual_scan_permission table:', permissions.length ? 'Created' : 'Already exists');
    console.log('absensi.manual_mode column:', absensiCols.length ? 'Added' : 'Already exists');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

runMigration();

