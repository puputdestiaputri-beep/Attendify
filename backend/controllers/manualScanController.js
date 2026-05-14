const db = require('../config/db');

exports.allowManualScan = async (req, res) => {

  try {

    const { user_id } = req.body;

    const dosen_id = req.userId;

    if (!user_id) {

      return res.status(400).json({
        status: 'error',
        message: 'user_id required'
      });
    }

    // CHECK USER

    const [user] = await db.query(
      `
      SELECT role
      FROM pengguna
      WHERE id_user = ?
      `,
      [user_id]
    );

    if (
      user.length === 0 ||
      user[0].role !== 'mahasiswa'
    ) {

      return res.status(400).json({
        status: 'error',
        message: 'User must be mahasiswa'
      });
    }

    // INSERT / UPDATE PERMISSION

    await db.query(
      `
      INSERT INTO manual_scan_permission
      (
        user_id,
        enabled,
        granted_by,
        expires_at
      )

      VALUES
      (
        ?,
        1,
        ?,
        DATE_ADD(NOW(), INTERVAL 5 MINUTE)
      )

      ON DUPLICATE KEY UPDATE

        enabled = 1,
        granted_by = VALUES(granted_by),
        expires_at = VALUES(expires_at),
        created_at = NOW()
      `,
      [user_id, dosen_id]
    );

    res.json({

      status: 'success',

      message:
        'Manual scan permission granted',

      data: {

        user_id,

        expires_at:
          new Date(
            Date.now() + 5 * 60 * 1000
          ).toISOString()
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      status: 'error',

      message:
        'Failed to grant permission'
    });
  }
};

// ======================================
// DISABLE MANUAL SCAN
// ======================================

exports.disableManualScan = async (req, res) => {

  try {

    const { user_id } = req.body;

    if (!user_id) {

      return res.status(400).json({

        status: 'error',

        message:
          'user_id required'
      });
    }

    const [result] = await db.query(
      `
      UPDATE manual_scan_permission

      SET enabled = 0

      WHERE user_id = ?
      `,
      [user_id]
    );

    if (result.affectedRows === 0) {

      return res.json({

        status: 'success',

        message:
          'No active permission found'
      });
    }

    res.json({

      status: 'success',

      message:
        'Manual scan permission disabled'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      status: 'error',

      message:
        'Failed to disable permission'
    });
  }
};

// ======================================
// CHECK PERMISSION
// ======================================

exports.getPermission = async (req, res) => {

  try {

    const user_id = req.userId;

    const [permissions] = await db.query(
      `
      SELECT

        enabled,
        granted_by,
        created_at,
        expires_at,

        TIMESTAMPDIFF(
          MINUTE,
          NOW(),
          expires_at
        ) AS minutes_left

      FROM manual_scan_permission

      WHERE user_id = ?
      AND enabled = 1

      AND
      (
        expires_at IS NULL
        OR expires_at > NOW()
      )

      LIMIT 1
      `,
      [user_id]
    );

    if (permissions.length === 0) {

      return res.json({

        status: 'success',

        data: {

          enabled: false,

          message:
            'No active permission'
        }
      });
    }

    res.json({

      status: 'success',

      data: permissions[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      status: 'error',

      message:
        'Failed to check permission'
    });
  }
};

// ======================================
// GET ALL STUDENTS
// ======================================

exports.getUsersWithPermissions = async (req, res) => {

  try {

    const [students] = await db.query(
      `
      SELECT

        pengguna.id_user AS id,

        pengguna.nama,

        pengguna.username,

        pengguna.email,

        pengguna.role,

        manual_scan_permission.enabled,

        manual_scan_permission.created_at,

        manual_scan_permission.expires_at,

        CASE

          WHEN
            manual_scan_permission.enabled = 1

            AND
            (
              manual_scan_permission.expires_at IS NULL

              OR

              manual_scan_permission.expires_at > NOW()
            )

          THEN 'active'

          ELSE 'disabled'

        END AS permission_status

      FROM pengguna

      LEFT JOIN manual_scan_permission

      ON pengguna.id_user =
      manual_scan_permission.user_id

      WHERE pengguna.role = 'mahasiswa'

      ORDER BY pengguna.nama ASC
      `
    );

    res.json({

      status: 'success',

      data: students
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      status: 'error',

      message:
        'Failed to fetch students'
    });
  }
};