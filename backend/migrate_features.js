const db = require('./config/db');

async function migrate() {
    try {
        console.log('Running migration for features...');
        
        // 1. Create reports table
        console.log('Creating reports table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                role VARCHAR(50),
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES pengguna(id_user)
            )
        `);
        console.log('Reports table created or already exists.');

        // 2. Modify absensi table
        console.log('Adding submitted_by_role to absensi table...');
        try {
            await db.query(`ALTER TABLE absensi ADD COLUMN submitted_by_role ENUM('dosen', 'admin', 'system') DEFAULT 'system'`);
            console.log('Column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column submitted_by_role already exists in absensi.');
            } else {
                throw err;
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
