const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const name = 'System Admin';
    const email = 'sysadmin@smartface.com';
    const password = 'Admin123!';
    const role = 'admin';

    try {
        console.log(`Checking if user ${email} exists...`);
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log('User already exists. Updating password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password = ?, name = ?, role = ? WHERE email = ?', [hashedPassword, name, role, email]);
            console.log('Admin account updated successfully!');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role]
            );
            console.log('Admin account created successfully!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
