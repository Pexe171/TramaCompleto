// Rotas de autenticação
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não configurado nas variáveis de ambiente.');
    }
};

const generateToken = (user) => {
    ensureJwtSecret();
    return jwt.sign(
        { id: user._id, displayName: user.displayName, role: user.role },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d',
        }
    );
};

const attachAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    });
};

const sanitizeUser = (user) => ({
    _id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
});

// @route   POST /api/auth/register
// @desc    Registrar um novo usuário (leitor)
// @access  Public
router.post(
    '/register',
    asyncHandler(async (req, res) => {
        const { username, email, password, displayName } = req.body;

        if (!username || !email || !password) {
            res.status(400);
            throw new Error('Username, e-mail e senha são obrigatórios.');
        }

        if (password.length < 6) {
            res.status(400);
            throw new Error('A senha deve conter pelo menos 6 caracteres.');
        }

        const userExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
        }).lean();

        if (userExists) {
            res.status(400);
            throw new Error('Já existe um usuário com o e-mail ou username informado.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase(),
            passwordHash,
            displayName: displayName ? displayName.trim() : username.trim(),
            role: 'leitor',
        });

        const token = generateToken(user);
        attachAuthCookie(res, token);

        res.status(201).json({ ...sanitizeUser(user), token, message: 'Usuário registrado com sucesso!' });
    })
);

// @route   POST /api/auth/login
// @desc    Autenticar usuário (qualquer role) e obter token
// @access  Public
router.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Informe e-mail e senha.');
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            res.status(401);
            throw new Error('Credenciais inválidas.');
        }

        const token = generateToken(user);
        attachAuthCookie(res, token);

        user.lastLoginAt = new Date();
        await user.save();

        res.json({ ...sanitizeUser(user), token });
    })
);

// @route   POST /api/auth/login/admin
// @desc    Autenticar um admin/editor
// @access  Public
router.post(
    '/login/admin',
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Informe e-mail e senha.');
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user || (user.role !== 'admin' && user.role !== 'editor') || !(await bcrypt.compare(password, user.passwordHash))) {
            res.status(401);
            throw new Error('Credenciais inválidas ou sem permissão de acesso.');
        }

        const token = generateToken(user);
        attachAuthCookie(res, token);

        user.lastLoginAt = new Date();
        await user.save();

        res.json({ message: 'Login de admin bem-sucedido!', role: user.role, token });
    })
);

// @route   POST /api/auth/logout
// @desc    Fazer logout do usuário
// @access  Private
router.post(
    '/logout',
    asyncHandler(async (_req, res) => {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: 'Logout bem-sucedido.' });
    })
);

module.exports = router;
