// TRAMA Portal - routes/pageRoutes.js v2.2.0
const express = require('express');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rota para servir o painel de administração
// Apenas utilizadores autenticados (protect) E com a função 'admin' (admin) podem aceder.
router.get('/dashboard/admin', protect, admin, (req, res) => {
    // Se o middleware passar, envia o ficheiro HTML do painel.
    res.sendFile(path.resolve(__dirname, '../public/admin/dashboard.html'));
});

// Rota para a página de login do admin
// Não precisa de proteção, pois é aqui que o admin faz o login.
router.get('/acesso/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/admin/login.html'));
});


module.exports = router;
