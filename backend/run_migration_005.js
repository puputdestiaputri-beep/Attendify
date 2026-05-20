const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Running migration 005: Create Face System Tables...");
    const sqlPath = path.join(__dirname, 'migrations', '005_create_face_system_tables.sql');
    if (!fs.existsSync(sqlPath)) {
        throw new Error(`Migration file not found: ${sqlPath}`);
    }
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let statement of statements) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        try {
            await db.query(statement);
        } catch (err) {
            if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME') {
                console.log("Already exists, skipping...");
            } else {
                throw err;
            }
        }
    }
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

run();
