// Middleware de autenticação e autorização
const User = require('../models/User');
const { verifyAuthToken } = require('../utils/tokenManager');
const { logSecurityEvent } = require('../services/securityLogService');
const { isPrimaryAdmin } = require('../utils/primaryAdmin');

const extractTokenFromHeaders = (req) => {
    const { authorization } = req.headers || {};
    if (authorization && authorization.startsWith('Bearer ')) {
        const [, token] = authorization.split(' ');
        return token;
    }
    return null;
};

const getToken = (req) => {
    const headerToken = extractTokenFromHeaders(req);
    if (headerToken && headerToken !== 'null' && headerToken !== 'undefined') {
        return headerToken;
    }
    if (req.cookies && req.cookies.token && req.cookies.token !== 'null' && req.cookies.token !== 'undefined') {
        return req.cookies.token;
    }
    return null;
};

const resolveAuthenticatedUser = async (token) => {
    if (!token) {
        return null;
    }

    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
        throw new Error('Usuário associado ao token não foi encontrado.');
    }

    return user;
};

// Middleware para proteger rotas (requer login)
const protect = async (req, res, next) => {
    try {
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'Não autorizado, token ausente.' });
        }

        const user = await resolveAuthenticatedUser(token);
        req.user = user;
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
};

// Middleware para rotas opcionais (não falha se o token não existir ou for inválido)
const optionalAuth = async (req, res, next) => {
    try {
        const token = getToken(req);
        if (!token) {
            return next();
        }

        const user = await resolveAuthenticatedUser(token);
        req.user = user;
        next();
    } catch (error) {
        console.warn('Token opcional ignorado:', error.message);
        next();
    }
};

const hasRole = (user, roles = []) => {
    if (!user) {
        return false;
    }
    return roles.includes(user.role);
};

const allowAdminPanelAccess = (req, res, next) => {
    if (hasRole(req.user, ['admin', 'editor', 'admin_viewer'])) {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Requer permissão administrativa.' });
};

const requireContentManagers = (req, res, next) => {
    if (hasRole(req.user, ['admin', 'editor'])) {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Requer permissão de Administrador.' });
};

const ensurePrimaryAdmin = async (req, res, next) => {
    if (isPrimaryAdmin(req.user)) {
        return next();
    }

    await logSecurityEvent({
        req,
        actor: req.user,
        action: 'unauthorized_admin_mutation',
        status: 'blocked',
        description: 'Tentativa de alteração administrativa bloqueada para um utilizador que não é o administrador principal.',
    });

    return res.status(403).json({
        message: 'Apenas o administrador principal pode executar esta ação.',
    });
};

module.exports = {
    protect,
    optionalAuth,
    admin: requireContentManagers,
    allowAdminPanelAccess,
    requireContentManagers,
    ensurePrimaryAdmin,
    isPrimaryAdmin,
};
