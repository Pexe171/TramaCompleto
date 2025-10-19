// Rotas de administração (artigos, editorias e usuários)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect, admin } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const slugify = require('../utils/slugify');

const Article = require('../models/Article');
const Editoria = require('../models/Editoria');
const User = require('../models/User');

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

const parseTags = (tags) => {
    if (!tags) return undefined;
    if (Array.isArray(tags)) return tags.filter(Boolean).map((tag) => tag.trim()).filter(Boolean);
    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

// --- ROTAS DE GESTÃO DE ARTIGOS ---
router.get(
    '/articles',
    protect,
    admin,
    asyncHandler(async (_req, res) => {
        const articles = await Article.find()
            .populate('editoriaId', 'title')
            .populate('authorId', 'displayName username')
            .sort({ createdAt: -1 })
            .lean();
        res.json(articles);
    })
);

router.post(
    '/articles',
    protect,
    admin,
    upload.single('coverImage'),
    asyncHandler(async (req, res) => {
        const { title, summary, content, editoriaId, status, format, videoUrl, isFeatured, frameStyle, tags } = req.body;

        if (!title || !content) {
            res.status(400);
            throw new Error('Título e conteúdo são obrigatórios.');
        }

        let editoria = null;
        if (editoriaId) {
            editoria = await Editoria.findById(editoriaId);
            if (!editoria) {
                res.status(400);
                throw new Error('Editoria informada não foi encontrada.');
            }
        }

        const slug = slugify(title);
        const slugConflict = await Article.findOne({ slug });
        if (slugConflict) {
            res.status(400);
            throw new Error('Já existe um artigo com este título.');
        }

        const articleData = {
            title: title.trim(),
            summary: summary ? summary.trim() : undefined,
            content,
            editoriaId: editoria ? editoria._id : null,
            status: status || 'rascunho',
            format: format || 'texto',
            videoUrl: videoUrl ? videoUrl.trim() : undefined,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            frameStyle: frameStyle || 'none',
            slug,
            authorId: req.user.id,
            publishedAt: status === 'publicado' ? new Date() : null,
        };

        if (req.file) {
            articleData.coverImage = path.posix.join('uploads', req.file.filename);
        }

        const parsedTags = parseTags(tags);
        if (parsedTags !== undefined) {
            articleData.tags = parsedTags;
        }

        const createdArticle = await Article.create(articleData);
        res.status(201).json(createdArticle);
    })
);

router.put(
    '/articles/:id',
    protect,
    admin,
    upload.single('coverImage'),
    asyncHandler(async (req, res) => {
        const { title, summary, content, editoriaId, status, format, videoUrl, isFeatured, frameStyle, tags } = req.body;

        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }

        if (editoriaId) {
            const editoria = await Editoria.findById(editoriaId);
            if (!editoria) {
                res.status(400);
                throw new Error('Editoria informada não foi encontrada.');
            }
            article.editoriaId = editoria._id;
        } else if (editoriaId === null || editoriaId === '') {
            article.editoriaId = null;
        }

        if (title) {
            const slug = slugify(title);
            const slugConflict = await Article.findOne({ slug, _id: { $ne: article._id } });
            if (slugConflict) {
                res.status(400);
                throw new Error('Já existe outro artigo com este título.');
            }
            article.title = title.trim();
            article.slug = slug;
        }

        if (summary !== undefined) {
            article.summary = summary ? summary.trim() : '';
        }

        if (content) {
            article.content = content;
        }

        if (status) {
            article.status = status;
            if (status === 'publicado' && !article.publishedAt) {
                article.publishedAt = new Date();
            }
            if (status === 'rascunho') {
                article.publishedAt = null;
            }
        }

        if (format) {
            article.format = format;
        }

        if (videoUrl !== undefined) {
            article.videoUrl = videoUrl ? videoUrl.trim() : undefined;
        }

        if (typeof isFeatured !== 'undefined') {
            article.isFeatured = isFeatured === 'true' || isFeatured === true;
        }

        if (frameStyle) {
            article.frameStyle = frameStyle;
        }

        const parsedTags = parseTags(tags);
        if (parsedTags !== undefined) {
            article.tags = parsedTags;
        }

        if (req.file) {
            article.coverImage = path.posix.join('uploads', req.file.filename);
        }

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    })
);

router.delete(
    '/articles/:id',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }
        res.json({ message: 'Artigo removido com sucesso.' });
    })
);

// --- ROTAS DE GESTÃO DE EDITORIAS ---
router.get(
    '/editorias',
    protect,
    admin,
    asyncHandler(async (_req, res) => {
        const editorias = await Editoria.find().sort({ priority: 1, createdAt: -1 }).lean();
        res.json(editorias);
    })
);

router.post(
    '/editorias',
    protect,
    admin,
    upload.single('coverImage'),
    asyncHandler(async (req, res) => {
        const { title, description, priority, isActive } = req.body;

        if (!title) {
            res.status(400);
            throw new Error('O título da editoria é obrigatório.');
        }

        const slug = slugify(title);
        const slugConflict = await Editoria.findOne({ slug });
        if (slugConflict) {
            res.status(400);
            throw new Error('Já existe uma editoria com este título.');
        }

        const editoriaData = {
            title: title.trim(),
            description: description ? description.trim() : undefined,
            slug,
            priority: priority !== undefined ? Number(priority) : 0,
            isActive: isActive === 'true' || isActive === true,
        };

        if (req.file) {
            editoriaData.coverImage = path.posix.join('uploads', req.file.filename);
        }

        const createdEditoria = await Editoria.create(editoriaData);
        res.status(201).json(createdEditoria);
    })
);

router.put(
    '/editorias/:id',
    protect,
    admin,
    upload.single('coverImage'),
    asyncHandler(async (req, res) => {
        const { title, description, priority, isActive } = req.body;
        const editoria = await Editoria.findById(req.params.id);

        if (!editoria) {
            res.status(404);
            throw new Error('Editoria não encontrada.');
        }

        if (title) {
            const slug = slugify(title);
            const slugConflict = await Editoria.findOne({ slug, _id: { $ne: editoria._id } });
            if (slugConflict) {
                res.status(400);
                throw new Error('Já existe outra editoria com este título.');
            }
            editoria.title = title.trim();
            editoria.slug = slug;
        }

        if (description !== undefined) {
            editoria.description = description ? description.trim() : '';
        }

        if (priority !== undefined) {
            editoria.priority = Number(priority);
        }

        if (typeof isActive !== 'undefined') {
            editoria.isActive = isActive === 'true' || isActive === true;
        }

        if (req.file) {
            editoria.coverImage = path.posix.join('uploads', req.file.filename);
        }

        const updatedEditoria = await editoria.save();
        res.json(updatedEditoria);
    })
);

router.delete(
    '/editorias/:id',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const editoria = await Editoria.findByIdAndDelete(req.params.id);
        if (!editoria) {
            res.status(404);
            throw new Error('Editoria não encontrada.');
        }

        await Article.updateMany({ editoriaId: editoria._id }, { $set: { editoriaId: null } });
        res.json({ message: 'Editoria removida com sucesso.' });
    })
);

// --- ROTAS DE GESTÃO DE USUÁRIOS ---
router.get(
    '/users',
    protect,
    admin,
    asyncHandler(async (_req, res) => {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        res.json(users);
    })
);

module.exports = router;
