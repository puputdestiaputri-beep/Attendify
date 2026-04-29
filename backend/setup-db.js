const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        multipleStatements: true
    });

    try {
        console.log('Reading database.sql...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        
        console.log('Executing SQL...');
        await connection.query(sql);
        
        console.log('Database and tables created successfully!');
    } catch (err) {
        console.error('Error during setup:', err);
    } finally {
        await connection.end();
    }
}

setup();
