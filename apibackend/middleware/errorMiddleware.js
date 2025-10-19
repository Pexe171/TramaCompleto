// Middleware de tratamento de erros padrão
const { HttpError } = require('../utils/httpError');

const notFound = (req, res, next) => {
    const error = new HttpError(404, `Rota não encontrada - ${req.originalUrl}`);
    next(error);
};

const errorHandler = (err, req, res, _next) => {
    const statusCode = err instanceof HttpError
        ? err.statusCode
        : err.statusCode || err.status || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

    res.status(statusCode);

    const response = {
        message: err.message || 'Erro interno do servidor.',
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        if (err.cause) {
            response.cause = err.cause;
        }
    }

    res.json(response);
};

module.exports = { notFound, errorHandler };
