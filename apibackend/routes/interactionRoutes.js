// Rotas de interação (comentários e avaliações)
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');

// --- ROTAS DE COMENTÁRIOS ---
router.get(
    '/articles/:slug/comments',
    asyncHandler(async (req, res) => {
        const article = await Article.findOne({ slug: req.params.slug, status: 'publicado' }).lean();
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        const comments = await Comment.find({ articleId: article._id, isDeleted: false })
            .populate('authorId', 'displayName username avatarUrl')
            .sort({ createdAt: -1 })
            .lean();

        res.json(comments);
    })
);

router.post(
    '/articles/:slug/comments',
    protect,
    asyncHandler(async (req, res) => {
        const content = req.body.content ? req.body.content.trim() : '';
        if (!content) {
            res.status(400);
            throw new Error('O conteúdo do comentário não pode estar vazio.');
        }

        const article = await Article.findOne({ slug: req.params.slug, status: 'publicado' });
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        const comment = await Comment.create({
            articleId: article._id,
            authorId: req.user.id,
            content,
        });

        await Article.updateOne({ _id: article._id }, { $inc: { 'stats.commentsCount': 1 } });

        const newComment = await Comment.findById(comment._id)
            .populate('authorId', 'displayName username avatarUrl')
            .lean();

        res.status(201).json(newComment);
    })
);

// --- ROTAS DE AVALIAÇÃO ---
const updateArticleRatingStats = async (articleId) => {
    const stats = await Rating.aggregate([
        { $match: { articleId } },
        {
            $group: {
                _id: '$articleId',
                ratingsAvg: { $avg: '$value' },
                ratingsCount: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Article.findByIdAndUpdate(articleId, {
            'stats.ratingsAvg': parseFloat(stats[0].ratingsAvg.toFixed(2)),
            'stats.ratingsCount': stats[0].ratingsCount,
        });
    } else {
        await Article.findByIdAndUpdate(articleId, {
            'stats.ratingsAvg': 0,
            'stats.ratingsCount': 0,
        });
    }
};

router.get(
    '/articles/:slug/ratings/my-rating',
    protect,
    asyncHandler(async (req, res) => {
        const article = await Article.findOne({ slug: req.params.slug, status: 'publicado' }).lean();
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        const rating = await Rating.findOne({ articleId: article._id, userId: req.user.id }).lean();
        res.json({ value: rating ? rating.value : 0 });
    })
);

router.post(
    '/articles/:slug/ratings',
    protect,
    asyncHandler(async (req, res) => {
        const value = Number(req.body.value);
        if (!value || value < 1 || value > 5) {
            res.status(400);
            throw new Error('A avaliação deve ser um número entre 1 e 5.');
        }

        const article = await Article.findOne({ slug: req.params.slug, status: 'publicado' });
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        await Rating.findOneAndUpdate(
            { articleId: article._id, userId: req.user.id },
            { value },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await updateArticleRatingStats(article._id);

        const updatedArticle = await Article.findById(article._id, 'stats.ratingsAvg stats.ratingsCount').lean();
        res.status(200).json({
            message: 'Avaliação submetida com sucesso.',
            stats: updatedArticle ? updatedArticle.stats : { ratingsAvg: 0, ratingsCount: 0 },
        });
    })
);

module.exports = router;
