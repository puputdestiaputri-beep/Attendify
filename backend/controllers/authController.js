const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        // PUBLIC REGISTRATION is ONLY for MAHASISWA
        const role = 'mahasiswa';
        
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO pengguna (nama, email, username, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, username || null, hashedPassword, role, 'Y']
        );

        res.status(201).json({
            status: 'success',
            message: 'Mahasiswa registered successfully',
            data: { id: result.insertId, name, email, role }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.registerAdminOrDosen = async (req, res) => {
    try {
        const { name, email, password, role, nip } = req.body;
        
        if (!name || !email || !password || !role) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }

        // Validate role (Dosen or Admin only)
        if (role !== 'dosen' && role !== 'admin') {
            return res.status(400).json({ status: 'error', message: 'Invalid role for this endpoint' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO pengguna (nama, email, username, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, nip || null, hashedPassword, role, 'Y']
        );

        res.status(201).json({
            status: 'success',
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
            data: { id: result.insertId, name, email, nip, role }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }
        res.status(500).json({ status: 'error', message: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check for user by email OR username (which could be NIM/NIP)
        const [users] = await db.query(
            'SELECT * FROM pengguna WHERE email = ? OR username = ?', 
            [email, email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Akun belum terdaftar' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Password salah' });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            status: 'success',
            message: 'Logged in successfully',
            data: {
                user: { id: user.id_user, name: user.nama, email: user.email, role: user.role },
                token
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id_user as id, nama as name, email, role, created_at FROM pengguna WHERE id_user = ?', [req.userId]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.json({ status: 'success', data: users[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
