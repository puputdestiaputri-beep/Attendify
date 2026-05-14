const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/analytics/dashboard
// Restricted to admin and dosen
router.get('/dashboard', analyticsCtrl.getDashboardAnalytics);

module.exports = router;
