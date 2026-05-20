const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'db_absensi',
        multipleStatements: true
    };

    let connection;

    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('Connected successfully.');

        const sqlFilePath = path.join(__dirname, 'migrations', '006_realtime_reporting_approval.sql');
        console.log(`Reading SQL file from: ${sqlFilePath}`);
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing migration 006...');
        await connection.query(sql);
        console.log('Migration 006 executed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
        process.exit();
    }
}

runMigration();
