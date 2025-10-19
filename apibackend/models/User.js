// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Forneça um e-mail válido.'],
        },
        passwordHash: {
            type: String,
            required: true,
            select: false, // Não retorna o hash da senha por padrão
        },
        role: {
            type: String,
            enum: ['admin', 'editor', 'leitor'],
            default: 'leitor',
        },
        displayName: { type: String, trim: true },
        avatarUrl: { type: String },
        bio: { type: String, trim: true },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.passwordHash;
                return ret;
            },
        },
    }
);

module.exports = mongoose.model('User', userSchema);
