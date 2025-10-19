const asyncHandler = require('../middleware/asyncHandler');
const { attachAuthCookie, revokeAuthCookie } = require('../utils/tokenManager');
const {
    registerUser,
    authenticateUser,
    authenticatePrivilegedUser,
} = require('../services/authService');

const respondWithAuthPayload = (res, payload, statusCode = 200) => {
    attachAuthCookie(res, payload.token);
    res.status(statusCode).json({
        ...payload,
        role: payload.user.role,
    });
};

const register = asyncHandler(async (req, res) => {
    const payload = await registerUser(req.body);
    respondWithAuthPayload(res, payload, 201);
});

const login = asyncHandler(async (req, res) => {
    const payload = await authenticateUser(req.body);
    respondWithAuthPayload(res, payload, 200);
});

const loginAdmin = asyncHandler(async (req, res) => {
    const payload = await authenticatePrivilegedUser(req.body);
    respondWithAuthPayload(res, payload, 200);
});

const logout = asyncHandler(async (_req, res) => {
    revokeAuthCookie(res);
    res.status(200).json({ message: 'Logout bem-sucedido.' });
});

module.exports = {
    register,
    login,
    loginAdmin,
    logout,
};
