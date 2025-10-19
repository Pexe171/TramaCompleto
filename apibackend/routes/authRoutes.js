// Rotas de autenticação
const express = require('express');
const router = express.Router();

const {
    register,
    login,
    loginAdmin,
    logout,
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Registrar um novo usuário (leitor)
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Autenticar usuário (qualquer role) e obter token
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/login/admin
// @desc    Autenticar um admin/editor
// @access  Public
router.post('/login/admin', loginAdmin);

// @route   POST /api/auth/logout
// @desc    Fazer logout do usuário
// @access  Private
router.post('/logout', logout);

module.exports = router;
