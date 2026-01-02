const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    date: { type: Date, required: true }, // Normalized to midnight UTC recommended
    completed: { type: Boolean, required: true },
    reason: { type: String, default: '' },
});

const HabitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    minVersion: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
});

const UserSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Client-generated UUID
    habit: { type: HabitSchema, default: null },
    logs: [LogSchema],
}, { _id: false }); // Important: Tell Mongoose we are handling _id management manually

module.exports = mongoose.model('User', UserSchema);
