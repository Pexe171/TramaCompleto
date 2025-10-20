const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true, trim: true },
        status: { type: String, enum: ['success', 'blocked', 'error'], default: 'success' },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorEmail: { type: String, trim: true },
        isPrimaryAdmin: { type: Boolean, default: false },
        route: { type: String, trim: true },
        method: { type: String, trim: true },
        targetId: { type: String, trim: true },
        description: { type: String, trim: true },
        ipAddress: { type: String, trim: true },
        userAgent: { type: String, trim: true },
        metadata: { type: Object },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SecurityLog', securityLogSchema);
