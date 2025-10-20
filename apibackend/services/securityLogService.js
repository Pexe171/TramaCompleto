const SecurityLog = require('../models/SecurityLog');
const { isPrimaryAdmin } = require('../utils/primaryAdmin');

const resolveIpAddress = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || null;
};

const logSecurityEvent = async ({
    req,
    actor,
    action,
    status = 'success',
    targetId = null,
    description = '',
    metadata = {},
}) => {
    try {
        const entry = {
            action,
            status,
            actorId: actor?._id || actor?.id || null,
            actorEmail: actor?.email || null,
            isPrimaryAdmin: isPrimaryAdmin(actor),
            route: req?.originalUrl || req?.url || null,
            method: req?.method || null,
            targetId: targetId ? String(targetId) : null,
            description,
            ipAddress: req ? resolveIpAddress(req) : null,
            userAgent: req?.headers?.['user-agent'] || null,
            metadata,
        };

        await SecurityLog.create(entry);
    } catch (error) {
        console.error('Falha ao registar log de segurança:', error.message);
    }
};

module.exports = {
    logSecurityEvent,
};
