const jwt = require('jsonwebtoken');

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const TOKEN_EXPIRATION = '30d';

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado nas variáveis de ambiente.');
    }
    return process.env.JWT_SECRET;
};

const createTokenPayload = (user) => ({
    id: user._id?.toString() || user.id,
    displayName: user.displayName,
    role: user.role,
});

const generateAuthToken = (user) => {
    const secret = ensureJwtSecret();
    const payload = createTokenPayload(user);
    return jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRATION });
};

const verifyAuthToken = (token) => {
    const secret = ensureJwtSecret();
    return jwt.verify(token, secret);
};

const buildCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: THIRTY_DAYS_IN_MS,
});

const attachAuthCookie = (res, token) => {
    res.cookie('token', token, buildCookieOptions());
};

const revokeAuthCookie = (res) => {
    res.cookie('token', '', {
        ...buildCookieOptions(),
        maxAge: 0,
        expires: new Date(0),
    });
};

module.exports = {
    attachAuthCookie,
    generateAuthToken,
    verifyAuthToken,
    revokeAuthCookie,
};
