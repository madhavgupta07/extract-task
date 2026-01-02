const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Mongoose Schema
const userSchema = new mongoose.Schema({
    _id: String,
    habit: {
        name: String,
        minVersion: String,
        startDate: Date,
        isActive: Boolean
    },
    logs: [{
        date: Date,
        completed: Boolean,
        reason: String
    }]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Helper to normalize date to midnight
const getMidnight = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// 1. Initialize / Get User
app.post('/api/users/init', async (req, res) => {
    await connectDB();
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
app.post('/api/habit/start', async (req, res) => {
    await connectDB();
    const { deviceId, habitName, minVersion } = req.body;
    try {
        let user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.habit = {
            name: habitName,
            minVersion,
            startDate: new Date(),
            isActive: true
        };
        user.logs = [];

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Status
app.get('/api/habit/status', async (req, res) => {
    await connectDB();
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

        if (diffDays > 7) {
            return res.json({ status: 'completed', user });
        }

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
app.post('/api/habit/log', async (req, res) => {
    await connectDB();
    const { deviceId, completed, reason } = req.body;
    try {
        const user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

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
app.get('/api/habit/summary', async (req, res) => {
    await connectDB();
    const { deviceId } = req.query;
    try {
        const user = await User.findById(deviceId);
        if (!user) return res.status(404).json({ error: 'User not found' });

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
            totalDays: 7,
            completedDays: completedCount,
            insight,
            logs: user.logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Daily Reality Check API is running!' });
});

// Export for Vercel
module.exports = app;
