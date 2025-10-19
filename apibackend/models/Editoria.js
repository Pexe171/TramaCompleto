// models/Editoria.js
const mongoose = require('mongoose');

const editoriaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: { type: String, trim: true },
        coverImage: { type: String },
        descriptionImage: { type: String },
        coverImageFocusX: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },
        coverImageFocusY: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },
        coverImageScale: {
            type: Number,
            default: 100,
            min: 80,
            max: 300,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Editoria', editoriaSchema);
