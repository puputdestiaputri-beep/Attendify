const db = require('./config/db');

async function checkTables() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables in database:', tables);
        
        for (let tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [columns] = await db.query(`DESCRIBE ${tableName}`);
            console.log(`\nColumns in ${tableName}:`);
            console.table(columns);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkTables();
