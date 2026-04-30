const db = require('../config/db');

exports.allowManualScan = async (req, res) => {
  try {
    const { user_id } = req.body;
    const dosen_id = req.userId; // From auth middleware

    if (!user_id || typeof user_id !== 'number') {
      return res.status(400).json({ status: 'error', message: 'user_id required (number)' });
    }

    // Check if user is mahasiswa
    const [user] = await db.query('SELECT role FROM pengguna WHERE id_user = ?', [user_id]);
    if (user.length === 0 || user[0].role !== 'mahasiswa') {
      return res.status(400).json({ status: 'error', message: 'User must be mahasiswa' });
    }

    // UPSERT permission (enable if exists, create if not)
    await db.query(`
      INSERT INTO manual_scan_permission (user_id, enabled, granted_by, expires_at) 
      VALUES (?, 1, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
      ON DUPLICATE KEY UPDATE 
        enabled = 1, 
        granted_by = VALUES(granted_by), 
        expires_at = VALUES(expires_at),
        created_at = NOW()
    `, [user_id, dosen_id]);

    res.json({ 
      status: 'success', 
      message: 'Manual scan permission granted for 5 minutes',
      data: { user_id, expires_at: new Date(Date.now() + 5*60*1000).toISOString() }
    });
  } catch (error) {
    console.error('[ManualScan] allow error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to grant permission' });
  }
};

exports.disableManualScan = async (req, res) => {
  try {
    const { user_id } = req.body;
    const dosen_id = req.userId;

    if (!user_id) {
      return res.status(400).json({ status: 'error', message: 'user_id required' });
    }

    const [result] = await db.query(
      'UPDATE manual_scan_permission SET enabled = 0 WHERE user_id = ?',
      [user_id]
    );

    if (result.affectedRows === 0) {
      return res.json({ status: 'success', message: 'No active permission found' });
    }

    res.json({ status: 'success', message: 'Manual scan permission disabled' });
  } catch (error) {
    console.error('[ManualScan] disable error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to disable permission' });
  }
};

exports.getPermission = async (req, res) => {
  try {
    const user_id = req.userId;

    const [permissions] = await db.query(`
      SELECT 
        enabled,
        granted_by,
        created_at,
        expires_at,
        TIMESTAMPDIFF(MINUTE, NOW(), expires_at) as minutes_left
      FROM manual_scan_permission 
      WHERE user_id = ? AND enabled = 1 
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `, [user_id]);

    if (permissions.length === 0) {
      return res.json({ 
        status: 'success', 
        data: { enabled: false, message: 'No active permission' }
      });
    }

    res.json({ 
      status: 'success', 
      data: permissions[0] 
    });
  } catch (error) {
    console.error('[ManualScan] getPermission error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to check permission' });
  }
};

exports.getUsersWithPermissions = async (req, res) => {
  try {
    const dosen_id = req.userId;
    const [students] = await db.query(`
      SELECT 
        p.id_user as id,
        p.nama as name,
        p.username as nim,
        p.email,
        p.role,
        msp.enabled,
        msp.created_at,
        msp.expires_at,
        CASE 
          WHEN msp.enabled = 1 AND (msp.expires_at IS NULL OR msp.expires_at > NOW()) THEN 'active'
          WHEN msp.enabled = 1 THEN 'expired'
          ELSE 'disabled'
        END as permission_status
      FROM pengguna p
      LEFT JOIN manual_scan_permission msp ON p.id_user = msp.user_id
      WHERE p.role = 'mahasiswa'
      ORDER BY p.nama
    `);

    res.json({ status: 'success', data: students });
  } catch (error) {
    console.error('[ManualScan] getUsers error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch students' });
  }
};

