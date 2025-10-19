// Middleware de autenticação e autorização
const User = require('../models/User');
const { verifyAuthToken } = require('../utils/tokenManager');

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

// Middleware para restringir acesso a Admins e Editores
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado. Requer permissão de Administrador ou Editor.' });
};

module.exports = { protect, optionalAuth, admin };
