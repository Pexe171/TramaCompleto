const User = require('../models/User');
const { createHttpError } = require('../utils/httpError');
const { hashPassword, comparePassword } = require('../utils/passwordManager');
const { formatUser } = require('../utils/userFormatter');
const { generateAuthToken } = require('../utils/tokenManager');

const normalizeEmail = (email) => email?.trim().toLowerCase();
const normalizeUsername = (username) => username?.trim();

const ensureUserIsActive = (user) => {
    if (user && user.isActive === false) {
        throw createHttpError(403, 'Esta conta está desativada. Contacte o suporte.');
    }
};

const registerUser = async ({ username, email, password, displayName }) => {
    if (!username || !email || !password) {
        throw createHttpError(400, 'Username, e-mail e palavra-passe são obrigatórios.');
    }

    if (password.length < 6) {
        throw createHttpError(400, 'A palavra-passe deve conter pelo menos 6 caracteres.');
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    const existingUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    }).lean();

    if (existingUser) {
        throw createHttpError(400, 'Já existe um utilizador com o e-mail ou username informados.');
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        displayName: displayName ? displayName.trim() : normalizedUsername,
        role: 'leitor',
    });

    const token = generateAuthToken(user);

    return {
        token,
        user: formatUser(user),
        message: 'Conta criada com sucesso! Bem-vindo(a) ao Trama.',
    };
};

const authenticateUser = async ({ email, password }) => {
    if (!email || !password) {
        throw createHttpError(400, 'Informe e-mail e palavra-passe.');
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail })
        .select('+passwordHash')
        .exec();

    if (!user) {
        throw createHttpError(401, 'Credenciais inválidas.');
    }

    ensureUserIsActive(user);

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw createHttpError(401, 'Credenciais inválidas.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateAuthToken(user);

    return {
        token,
        user: formatUser(user),
        message: 'Sessão iniciada com sucesso.',
    };
};

const authenticatePrivilegedUser = async (credentials) => {
    const result = await authenticateUser(credentials);
    if (!['admin', 'editor', 'admin_viewer'].includes(result.user.role)) {
        throw createHttpError(403, 'Credenciais válidas, mas sem permissão de acesso.');
    }
    return {
        ...result,
        message: 'Login de administração efetuado com sucesso.',
    };
};

module.exports = {
    registerUser,
    authenticateUser,
    authenticatePrivilegedUser,
};
