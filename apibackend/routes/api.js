// Rotas públicas de conteúdo
const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');
const Editoria = require('../models/Editoria');
const Article = require('../models/Article');

// @desc    Obter dados para a página inicial (Últimas Postagens)
// @route   GET /api/home
router.get(
    '/home',
    asyncHandler(async (_req, res) => {
        const ultimasPostagens = await Article.find({ status: 'publicado' })
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(6)
            .populate('editoriaId', 'title slug')
            .lean();

        res.json({ ultimasPostagens });
    })
);

// @desc    Obter a última editoria com publicação
// @route   GET /api/latest-editoria
router.get(
    '/latest-editoria',
    asyncHandler(async (_req, res) => {
        const latestArticleWithEditoria = await Article.findOne({ 
            status: 'publicado',
            editoriaId: { $ne: null } 
        })
        .sort({ publishedAt: -1, createdAt: -1 })
        .populate('editoriaId')
        .lean();

        if (latestArticleWithEditoria && latestArticleWithEditoria.editoriaId) {
            res.json(latestArticleWithEditoria.editoriaId);
        } else {
            // Se não encontrar, busca a primeira editoria ativa como fallback
            const fallbackEditoria = await Editoria.findOne({ isActive: true }).sort({ priority: 1, createdAt: -1 }).lean();
            if (fallbackEditoria) {
                res.json(fallbackEditoria);
            } else {
                res.status(404).json({ message: 'Nenhuma editoria encontrada.' });
            }
        }
    })
);


// @desc    Obter todas as editorias para o menu (Apenas ativas)
// @route   GET /api/editorias
router.get(
    '/editorias',
    asyncHandler(async (_req, res) => {
        const editorias = await Editoria.find({ isActive: true })
            .sort({ priority: 1, title: 1 })
            .lean();
        res.json(editorias);
    })
);

// @desc    Obter detalhes de uma editoria e os seus artigos
// @route   GET /api/editorias/:slug
router.get(
    '/editorias/:slug',
    asyncHandler(async (req, res) => {
        const editoria = await Editoria.findOne({ slug: req.params.slug, isActive: true }).lean();
        if (!editoria) {
            res.status(404);
            throw new Error('Editoria não encontrada.');
        }

        const articles = await Article.find({ editoriaId: editoria._id, status: 'publicado' })
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean();

        res.json({ ...editoria, articles });
    })
);

// @desc    Obter a página "Quem Somos"
// @route   GET /api/quem-somos
router.get('/quem-somos', (_req, res) => {
    res.json({
        title: 'Quem Somos?',
        content: `
            <p class="text-lg leading-relaxed">
                Somos o Trama, um portal de cinema e comunicação, criado por estudantes de Relações Públicas da UFAM, para amantes do cinema!
            </p>
            <p class="mt-4 text-lg leading-relaxed">
                Com o objetivo de apresentar as estratégias de comunicação presentes no mundo cinematográfico.
            </p>
        `,
    });
});

// @desc    Obter um artigo específico
// @route   GET /api/articles/:editoriaSlug/:articleSlug
router.get(
    '/articles/:editoriaSlug/:articleSlug',
    asyncHandler(async (req, res) => {
        const article = await Article.findOne({ slug: req.params.articleSlug, status: 'publicado' })
            .populate('authorId', 'displayName')
            .populate('editoriaId', 'title slug')
            .lean();

        if (!article || (article.editoriaId && article.editoriaId.slug !== req.params.editoriaSlug)) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        await Article.findByIdAndUpdate(article._id, { $inc: { 'stats.views': 1 } });

        res.json(article);
    })
);

module.exports = router;
