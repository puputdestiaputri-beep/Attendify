const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'db_absensi'
    });
    
    const [existing] = await conn.execute('SELECT * FROM pengguna WHERE email = ?', ['nindykrw@gmail.com']);
    if (existing.length > 0) {
      console.log('User already exists');
    } else {
      const hash = await bcrypt.hash('dosen123', 10);
      await conn.execute('INSERT INTO pengguna (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)', 
        ['Dosen Nindy', 'nindykrw@gmail.com', hash, 'dosen', 'Y']);
      console.log('Lecturer account created: nindykrw@gmail.com / dosen123');
    }
    await conn.end();
  } catch (err) {
    console.error(err);
  }
})();
