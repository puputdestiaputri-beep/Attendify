const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding email column to pengguna table...');
        await db.query('ALTER TABLE pengguna ADD COLUMN email VARCHAR(100) AFTER nama');
        console.log('Email column added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

migrate();
