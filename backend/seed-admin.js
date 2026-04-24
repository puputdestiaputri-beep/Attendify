const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    const name = 'Admin Attendify';
    const email = 'admin@attendify.com';
    const password = 'admin123';
    const role = 'admin';

    try {
        console.log(`Checking if user ${email} exists...`);
        // Check if user already exists
        const [existing] = await db.query('SELECT * FROM pengguna WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log('Admin user already exists. Updating password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE pengguna SET password = ?, nama = ?, role = ? WHERE email = ?', [hashedPassword, name, role, email]);
            console.log('Admin account updated successfully!');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            // status 'Y' means active
            await db.query(
                'INSERT INTO pengguna (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, role, 'Y']
            );
            console.log('Admin account created successfully!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err.message);
        process.exit(1);
    }
}

seedAdmin();
