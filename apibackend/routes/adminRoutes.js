// Rotas de administração (artigos, editorias e usuários)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    protect,
    allowAdminPanelAccess,
    requireContentManagers,
    ensurePrimaryAdmin,
    isPrimaryAdmin,
} = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const slugify = require('../utils/slugify');

const { hashPassword } = require('../utils/passwordManager');
const { formatUser } = require('../utils/userFormatter');
const { logSecurityEvent } = require('../services/securityLogService');
const { getPrimaryAdminEmail } = require('../utils/primaryAdmin');

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

const normalizeEmail = (email) => (email ? email.trim().toLowerCase() : '');

const sanitizeUsernameBase = (value) => {
    if (!value) {
        return 'adminviewer';
    }

    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
        .slice(0, 24) || 'adminviewer';
};

const generateUniqueUsername = async (baseValue) => {
    const base = sanitizeUsernameBase(baseValue);
    let candidate = base;
    let suffix = 1;

    while (await User.exists({ username: candidate })) {
        candidate = `${base}${suffix}`;
        suffix += 1;
    }

    return candidate;
};

const buildAdminPermissions = (user) => {
    const primaryAdmin = isPrimaryAdmin(user);
    return {
        canViewAdmin: true,
        canManageContent: primaryAdmin,
        canManageUsers: primaryAdmin,
        isPrimaryAdmin: primaryAdmin,
        isReadOnly: !primaryAdmin,
    };
};

const isValidHttpUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return false;
    }

    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_error) {
        return false;
    }
};

const parseTags = (tags) => {
    if (!tags) return undefined;
    if (Array.isArray(tags)) return tags.filter(Boolean).map((tag) => tag.trim()).filter(Boolean);
    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const resolveUploadedPath = (file) => {
    if (!file) {
        return undefined;
    }

    return path.posix.join('uploads', file.filename);
};

const resolveImageValue = (req, fieldName) => {
    const fileFromFieldArray = req.files?.[fieldName]?.[0];
    const uploaded = resolveUploadedPath(fileFromFieldArray);
    if (uploaded) {
        return uploaded;
    }

    const remoteUrl = req.body?.[`${fieldName}Url`];
    if (isValidHttpUrl(remoteUrl)) {
        return remoteUrl.trim();
    }

    return undefined;
};

const resolveCoverImageValue = (req) => {
    if (req.file) {
        return resolveUploadedPath(req.file);
    }

    if (isValidHttpUrl(req.body?.coverImageUrl)) {
        return req.body.coverImageUrl.trim();
    }

    return undefined;
};

const clampNumber = (value, { min, max, fallback }) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return fallback;
    }

    const clamped = Math.min(Math.max(numericValue, min), max);
    return clamped;
};

const parseCoverControls = (body = {}) => ({
    focusX: clampNumber(body.coverImageFocusX, { min: 0, max: 100, fallback: 50 }),
    focusY: clampNumber(body.coverImageFocusY, { min: 0, max: 100, fallback: 50 }),
    scale: clampNumber(body.coverImageScale, { min: 80, max: 300, fallback: 100 }),
});

const uploadEditoriaAssets = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'descriptionImage', maxCount: 1 },
]);

// --- PERFIL DO ADMINISTRADOR ---
router.get(
    '/profile',
    protect,
    allowAdminPanelAccess,
    asyncHandler(async (req, res) => {
        res.json({
            user: formatUser(req.user),
            permissions: buildAdminPermissions(req.user),
            primaryAdminEmail: getPrimaryAdminEmail(),
        });
    })
);

// --- ROTAS DE GESTÃO DE ARTIGOS ---
router.get(
    '/articles',
    protect,
    allowAdminPanelAccess,
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
    requireContentManagers,
    ensurePrimaryAdmin,
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

        const coverImageValue = resolveCoverImageValue(req);
        if (coverImageValue) {
            articleData.coverImage = coverImageValue;
        }

        const parsedTags = parseTags(tags);
        if (parsedTags !== undefined) {
            articleData.tags = parsedTags;
        }

        const createdArticle = await Article.create(articleData);

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'article:create',
            targetId: createdArticle._id,
            description: `Artigo criado (${createdArticle.title}).`,
        });

        res.status(201).json(createdArticle);
    })
);

router.put(
    '/articles/:id',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
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

        const coverImageValue = resolveCoverImageValue(req);
        if (coverImageValue) {
            article.coverImage = coverImageValue;
        }

        const updatedArticle = await article.save();

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'article:update',
            targetId: updatedArticle._id,
            description: `Artigo atualizado (${updatedArticle.title}).`,
            metadata: { fields: Object.keys(req.body || {}) },
        });

        res.json(updatedArticle);
    })
);

router.delete(
    '/articles/:id',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
    asyncHandler(async (req, res) => {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            res.status(404);
            throw new Error('Artigo não encontrado.');
        }
        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'article:delete',
            targetId: req.params.id,
            description: `Artigo removido (${article.title}).`,
        });

        res.json({ message: 'Artigo removido com sucesso.' });
    })
);

// --- ROTAS DE GESTÃO DE EDITORIAS ---
router.get(
    '/editorias',
    protect,
    allowAdminPanelAccess,
    asyncHandler(async (_req, res) => {
        const editorias = await Editoria.find().sort({ priority: 1, createdAt: -1 }).lean();
        res.json(editorias);
    })
);

router.post(
    '/editorias',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
    uploadEditoriaAssets,
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

        const coverControls = parseCoverControls(req.body);

        const editoriaData = {
            title: title.trim(),
            description: description ? description.trim() : undefined,
            slug,
            priority: priority !== undefined ? Number(priority) : 0,
            isActive: isActive === 'true' || isActive === true,
            coverImageFocusX: coverControls.focusX,
            coverImageFocusY: coverControls.focusY,
            coverImageScale: coverControls.scale,
        };

        const coverImageValue = resolveImageValue(req, 'coverImage');
        if (coverImageValue) {
            editoriaData.coverImage = coverImageValue;
        }

        const descriptionImageValue = resolveImageValue(req, 'descriptionImage');
        if (descriptionImageValue) {
            editoriaData.descriptionImage = descriptionImageValue;
        }

        const createdEditoria = await Editoria.create(editoriaData);

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'editoria:create',
            targetId: createdEditoria._id,
            description: `Editoria criada (${createdEditoria.title}).`,
        });

        res.status(201).json(createdEditoria);
    })
);

router.put(
    '/editorias/:id',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
    uploadEditoriaAssets,
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

        const coverImageValue = resolveImageValue(req, 'coverImage');
        if (coverImageValue) {
            editoria.coverImage = coverImageValue;
        }

        const descriptionImageValue = resolveImageValue(req, 'descriptionImage');
        if (descriptionImageValue) {
            editoria.descriptionImage = descriptionImageValue;
        }

        const coverControls = parseCoverControls(req.body);
        if (req.body?.coverImageFocusX !== undefined) {
            editoria.coverImageFocusX = coverControls.focusX;
        }
        if (req.body?.coverImageFocusY !== undefined) {
            editoria.coverImageFocusY = coverControls.focusY;
        }
        if (req.body?.coverImageScale !== undefined) {
            editoria.coverImageScale = coverControls.scale;
        }

        const updatedEditoria = await editoria.save();

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'editoria:update',
            targetId: updatedEditoria._id,
            description: `Editoria atualizada (${updatedEditoria.title}).`,
            metadata: { fields: Object.keys(req.body || {}) },
        });

        res.json(updatedEditoria);
    })
);

router.delete(
    '/editorias/:id',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
    asyncHandler(async (req, res) => {
        const editoria = await Editoria.findByIdAndDelete(req.params.id);
        if (!editoria) {
            res.status(404);
            throw new Error('Editoria não encontrada.');
        }

        await Article.updateMany({ editoriaId: editoria._id }, { $set: { editoriaId: null } });

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'editoria:delete',
            targetId: req.params.id,
            description: `Editoria removida (${editoria.title}).`,
        });
        res.json({ message: 'Editoria removida com sucesso.' });
    })
);

// --- ROTAS DE GESTÃO DE USUÁRIOS ---
router.get(
    '/users',
    protect,
    requireContentManagers,
    asyncHandler(async (_req, res) => {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        res.json(users);
    })
);

router.post(
    '/users/viewer',
    protect,
    requireContentManagers,
    ensurePrimaryAdmin,
    asyncHandler(async (req, res) => {
        const { email, displayName, password } = req.body || {};

        if (!email || !password) {
            res.status(400);
            throw new Error('Email e palavra-passe são obrigatórios para criar o administrador de visualização.');
        }

        if (password.length < 6) {
            res.status(400);
            throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.');
        }

        const normalizedEmail = normalizeEmail(email);

        const existingUser = await User.findOne({ email: normalizedEmail }).lean();
        if (existingUser) {
            res.status(400);
            throw new Error('Já existe um utilizador com este email.');
        }

        const username = await generateUniqueUsername(displayName || normalizedEmail.split('@')[0]);
        const passwordHash = await hashPassword(password);

        const viewerUser = await User.create({
            username,
            email: normalizedEmail,
            passwordHash,
            role: 'admin_viewer',
            displayName: displayName ? displayName.trim() : username,
        });

        await logSecurityEvent({
            req,
            actor: req.user,
            action: 'user:create_admin_viewer',
            targetId: viewerUser._id,
            description: `Administrador em modo visualização criado (${viewerUser.email}).`,
        });

        res.status(201).json({
            message: 'Administrador em modo visualização criado com sucesso.',
            user: formatUser(viewerUser),
        });
    })
);

module.exports = router;
