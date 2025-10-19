const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
    if (!password) {
        throw new Error('Senha obrigatória para gerar hash.');
    }
    return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    if (!password || !hash) {
        return false;
    }
    return bcrypt.compare(password, hash);
};

module.exports = {
    SALT_ROUNDS,
    hashPassword,
    comparePassword,
};
