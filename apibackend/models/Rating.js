// models/Rating.js

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Índice único para garantir que um usuário só pode avaliar um artigo uma vez
ratingSchema.index({ articleId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
