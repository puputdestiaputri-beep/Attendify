const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Running migration 004...");
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '004_add_gps_and_ping_fields.sql'), 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let statement of statements) {
        console.log("Executing:", statement);
        await db.query(statement);
    }
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

run();
