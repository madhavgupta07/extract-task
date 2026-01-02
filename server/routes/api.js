const express = require('express');
const router = express.Router();
const User = require('../models/UserLocal');

// Helper to normalize date to midnight
const getMidnight = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// 1. Initialize / Get User
router.post('/users/init', async (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

    try {
        let user = await User.findById(deviceId);
        if (!user) {
            user = new User({ _id: deviceId, logs: [] });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Start Habit
router.post('/habit/start', async (req, res) => {
    const { deviceId, habitName, minVersion } = req.body;
    try {
        const user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.habit = {
            name: habitName,
            minVersion,
            startDate: new Date(),
            isActive: true
        };
        // Clear old logs if restarting? 
        // "The app asks the user to commit to ONLY ONE small daily action for the next 7 days"
        // Let's assume a hard reset for simplicity and "brutal" focus.
        user.logs = [];

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Status
router.get('/habit/status', async (req, res) => {
    const { deviceId } = req.query;
    try {
        const user = await User.findById(deviceId);
        if (!user || !user.habit || !user.habit.isActive) {
            return res.json({ status: 'setup' });
        }

        const start = new Date(user.habit.startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Day 1 starts immediately. 
        // Start + 24h = Day 2.

        if (diffDays > 7) {
            return res.json({ status: 'completed', user });
        }

        // Check if logged today
        const todayMidnight = getMidnight(now);
        const hasLoggedToday = user.logs.some(log => {
            return getMidnight(log.date).getTime() === todayMidnight.getTime();
        });

        res.json({
            status: 'active',
            dayNumber: diffDays,
            hasLoggedToday,
            habit: user.habit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Log Daily Check
router.post('/habit/log', async (req, res) => {
    const { deviceId, completed, reason } = req.body;
    try {
        const user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Prevent duplicate logs for same day
        const now = new Date();
        const todayMidnight = getMidnight(now);
        const alreadyLogged = user.logs.some(log => getMidnight(log.date).getTime() === todayMidnight.getTime());

        if (alreadyLogged) {
            return res.status(400).json({ error: 'Already logged today' });
        }

        user.logs.push({
            date: now,
            completed,
            reason
        });

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Summary
router.get('/habit/summary', async (req, res) => {
    const { deviceId } = req.query;
    try {
        const user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Simple logic for insight
        const completedCount = user.logs.filter(l => l.completed).length;
        let insight = "";

        if (completedCount >= 6) {
            insight = "You proved consistency is possible with small steps.";
        } else if (completedCount >= 4) {
            insight = "You're building momentum, but watch out for the weekend slip-ups.";
        } else {
            insight = "Your environment seems to be the biggest blocker. Try an even smaller habit.";
        }

        res.json({
            totalDays: 7, // Fixed for this app
            completedDays: completedCount,
            insight,
            logs: user.logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
