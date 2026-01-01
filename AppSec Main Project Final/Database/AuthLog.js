const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    role: { type: String },
    status: { type: String, enum: ['success', 'failure'] },
    event: { type: String, enum: ['login', 'register'] },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String }
});

module.exports = mongoose.model('AuthLog', authLogSchema);
