const formatUser = (userDocument) => {
    if (!userDocument) {
        return null;
    }

    const raw = typeof userDocument.toObject === 'function' ? userDocument.toObject({ getters: true }) : userDocument;

    return {
        id: raw._id?.toString() || raw.id,
        username: raw.username,
        displayName: raw.displayName,
        email: raw.email,
        role: raw.role,
        avatarUrl: raw.avatarUrl || null,
        bio: raw.bio || null,
        isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
        lastLoginAt: raw.lastLoginAt || null,
        createdAt: raw.createdAt || null,
        updatedAt: raw.updatedAt || null,
    };
};

module.exports = {
    formatUser,
};
