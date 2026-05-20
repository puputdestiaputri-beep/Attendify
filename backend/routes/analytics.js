const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/analytics/dashboard
// Restricted to admin and dosen
router.get('/dashboard', analyticsCtrl.getDashboardAnalytics);
router.get('/suspicious-logs', analyticsCtrl.getSuspiciousLogs);
router.get('/ai-health', analyticsCtrl.getAIHealth);
router.get('/map', analyticsCtrl.getMapData);
router.get('/heatmap', analyticsCtrl.getHeatmapAnalytics);

module.exports = router;
