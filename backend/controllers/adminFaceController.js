const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const faceService = require('../services/faceService');

/**
 * Get list of students with their face registration status
 */
exports.getStudentsWithStatus = async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT 
                p.id_user, 
                p.nama, 
                p.role,
                fp.verification_status,
                fp.last_trained,
                fp.face_image,
                k.nama_kelas as kelas,
                k.prodi
            FROM pengguna p
            LEFT JOIN face_profiles fp ON p.id_user = fp.user_id
            LEFT JOIN mahasiswa_kelas mk ON p.id_user = mk.mahasiswa_id
            LEFT JOIN kelas k ON mk.kelas_id = k.id_kelas
            WHERE p.role = 'mahasiswa'
            ORDER BY p.nama ASC
        `);

        res.json({ success: true, data: students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get registration status for a specific user
 */
exports.getFaceStatus = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [profile] = await db.query('SELECT * FROM face_profiles WHERE user_id = ?', [user_id]);
        
        if (profile.length === 0) {
            return res.json({ success: true, status: 'NOT_REGISTERED' });
        }

        res.json({ success: true, data: profile[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Register or update student facial data
 */
exports.registerFace = async (req, res) => {
    const { user_id, images } = req.body; // images: array of base64 strings
    const admin_id = req.user.id;
    const io = req.app.get('io');

    if (!user_id || !images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing user_id or images array' });
    }

    try {
        if (io) io.emit('face_training_progress', { user_id, progress: 10, message: 'Starting training...' });

        const descriptors = [];
        const savedPaths = [];
        const uploadDir = path.join(__dirname, '..', 'uploads', 'faces');
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process each image
        for (let i = 0; i < images.length; i++) {
            if (io) io.emit('face_training_progress', { 
                user_id, 
                progress: 10 + Math.floor((i / images.length) * 70), 
                message: `Processing image ${i + 1}/${images.length}...` 
            });

            const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Validate quality
            const quality = await faceService.validateImageQuality(buffer);
            if (!quality.isValid) {
                return res.status(400).json({ success: false, message: `Image ${i+1}: ${quality.error}` });
            }

            descriptors.push(quality.detection.descriptor);

            // Save the first image as the primary profile image
            if (i === 0) {
                const fileName = `profile_${user_id}_${Date.now()}.jpg`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
                savedPaths.push(fileName);
            }
        }

        // Calculate average embedding
        if (io) io.emit('face_training_progress', { user_id, progress: 85, message: 'Generating final embeddings...' });
        const avgEmbedding = faceService.calculateAverageEmbedding(descriptors);

        // Update or Insert into face_profiles
        const [existing] = await db.query('SELECT id FROM face_profiles WHERE user_id = ?', [user_id]);
        
        if (existing.length > 0) {
            await db.query(`
                UPDATE face_profiles 
                SET embedding_data = ?, face_image = ?, verification_status = 'VERIFIED', last_trained = NOW()
                WHERE user_id = ?
            `, [JSON.stringify(Array.from(avgEmbedding)), savedPaths[0], user_id]);
        } else {
            await db.query(`
                INSERT INTO face_profiles (user_id, embedding_data, face_image, verification_status, last_trained)
                VALUES (?, ?, ?, 'VERIFIED', NOW())
            `, [user_id, JSON.stringify(Array.from(avgEmbedding)), savedPaths[0]]);
        }

        // Update is_face_verified in pengguna
        await db.query('UPDATE pengguna SET is_face_verified = 1 WHERE id_user = ?', [user_id]);

        // Log the training
        await db.query(`
            INSERT INTO face_training_logs (user_id, admin_id, training_result)
            VALUES (?, ?, ?)
        `, [user_id, admin_id, `Successfully trained with ${images.length} images. Confidence: 1.0`]);

        if (io) io.emit('face_training_progress', { user_id, progress: 100, message: 'Training completed successfully!' });

        res.json({ 
            success: true, 
            message: 'Face registration successful',
            data: {
                verification_status: 'VERIFIED',
                face_image: savedPaths[0]
            }
        });

    } catch (err) {
        console.error('[FaceRegister] Error:', err);
        
        // Log failure
        await db.query(`
            INSERT INTO face_training_logs (user_id, admin_id, training_result, failure_reason)
            VALUES (?, ?, 'FAILED', ?)
        `, [user_id, admin_id, err.message]);

        if (io) io.emit('face_training_progress', { user_id, progress: 0, message: 'Error: ' + err.message });
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Delete face profile
 */
exports.deleteFace = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // Get profile to find image path
        const [profile] = await db.query('SELECT face_image FROM face_profiles WHERE user_id = ?', [user_id]);
        
        if (profile.length > 0 && profile[0].face_image) {
            const filePath = path.join(__dirname, '..', 'uploads', 'faces', profile[0].face_image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM face_profiles WHERE user_id = ?', [user_id]);
        await db.query('UPDATE pengguna SET is_face_verified = 0 WHERE id_user = ?', [user_id]);

        res.json({ success: true, message: 'Face profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
