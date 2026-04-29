const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'db_absensi' });
    await conn.execute('UPDATE pengguna SET prodi = ?, kelas = ? WHERE role = ? AND prodi IS NULL', ['Informatika', 'IF-A', 'mahasiswa']);
    console.log('All mahasiswa with NULL prodi updated to Informatika/IF-A');
    await conn.end();
  } catch (err) {
    console.error(err);
  }
})();
