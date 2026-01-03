const express = require('express');
const router = express.Router();

// Stubbed Notification Routes for Supabase Migration

router.get('/settings', async (req, res) => {
    res.json({
        userId: req.query.userId || 'anon',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        anomalyAlerts: true,
        weeklyReports: true
    });
});

router.post('/settings', async (req, res) => {
    res.json({
        success: true,
        message: 'Notification settings updated (STUB)',
        settings: req.body
    });
});

router.post('/track-click', async (req, res) => {
    res.json({ success: true });
});

router.post('/track-acknowledge', async (req, res) => {
    res.json({ success: true });
});

router.get('/stats', async (req, res) => {
    res.json({
        totalSent: 0,
        openRate: '0%',
        clickRate: '0%'
    });
});

router.get('/history', async (req, res) => {
    res.json({
        count: 0,
        notifications: []
    });
});

module.exports = router;
