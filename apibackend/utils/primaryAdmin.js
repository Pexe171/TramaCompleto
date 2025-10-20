const getPrimaryAdminEmail = () => {
    const configured = process.env.PRIMARY_ADMIN_EMAIL;
    return (configured ? configured.trim() : 'admin@trama.com').toLowerCase();
};

const normalizeEmail = (email) => (email ? String(email).trim().toLowerCase() : '');

const isPrimaryAdmin = (userOrEmail) => {
    if (!userOrEmail) {
        return false;
    }

    const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
    return normalizeEmail(email) === getPrimaryAdminEmail();
};

module.exports = {
    getPrimaryAdminEmail,
    isPrimaryAdmin,
};
