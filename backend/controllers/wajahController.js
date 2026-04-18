const db = require('../config/db');

// In-memory sessions for active validation (to handle IoT matching)
let activeSessions = {};

exports.getAvailableUsers = async (req, res) => {
    try {
        // Get users who don't have face data yet
        const [users] = await db.query('SELECT id_user as id, nama as name FROM pengguna WHERE id_wajah IS NULL AND role != "admin"');
        res.json({ status: 'success', data: users });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.startValidationSession = async (req, res) => {
    try {
        const { user_id, device_id } = req.body;
        if (!user_id || !device_id) {
            return res.status(400).json({ status: 'error', message: 'user_id and device_id are required' });
        }

        // 1. Create a new record in 'wajah' table
        const [result] = await db.query(
            'INSERT INTO wajah (tanggal_input) VALUES (NOW())'
        );
        const id_wajah = result.insertId;

        // 2. Link it to pengguna
        await db.query(
            'UPDATE pengguna SET id_wajah = ? WHERE id_user = ?',
            [id_wajah, user_id]
        );

        // 3. Mark this session as active for the IoT device
        activeSessions[device_id] = {
            user_id,
            id_wajah,
            capturedCount: 0,
            startTime: Date.now()
        };

        res.json({ 
            status: 'success', 
            message: 'Validation session started. ESP32-CAM is now capturing...',
            data: { id_wajah, user_id }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.uploadIotFaceData = async (req, res) => {
    try {
        const { device_id, image, frame_index } = req.body; 
        // frame_index: 1, 2, 3, or 4

        if (!activeSessions[device_id]) {
            return res.status(404).json({ status: 'error', message: 'No active validation session for this device' });
        }

        const session = activeSessions[device_id];
        const columnName = `foto${frame_index}`;

        // In a real scenario, 'image' would be saved to disk. 
        // Here we mock the path.
        const mockPath = `/uploads/faces/user_${session.user_id}_f${frame_index}.jpg`;

        await db.query(
            `UPDATE wajah SET ${columnName} = ? WHERE id_wajah = ?`,
            [mockPath, session.id_wajah]
        );

        session.capturedCount++;

        // If 4 frames are captured, session is done
        if (session.capturedCount >= 4) {
            delete activeSessions[device_id];
        }

        res.json({ 
            status: 'success', 
            message: `Frame ${frame_index} captured`,
            progress: session.capturedCount
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getValidationStatus = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [user] = await db.query('SELECT id_wajah FROM pengguna WHERE id_user = ?', [user_id]);
        
        if (user.length === 0 || !user[0].id_wajah) {
            return res.json({ status: 'idle', message: 'No active validation' });
        }

        const [wajah] = await db.query('SELECT * FROM wajah WHERE id_wajah = ?', [user[0].id_wajah]);
        const record = wajah[0];
        
        let count = 0;
        if (record.foto1) count++;
        if (record.foto2) count++;
        if (record.foto3) count++;
        if (record.foto4) count++;

        res.json({ 
            status: count === 4 ? 'completed' : 'processing', 
            progress: count,
            data: record
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
