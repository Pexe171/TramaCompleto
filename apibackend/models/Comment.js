// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        articleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Comment', commentSchema);
