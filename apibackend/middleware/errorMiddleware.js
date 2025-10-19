// Middleware de tratamento de erros padrão
const notFound = (req, res, next) => {
    const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
    res.status(statusCode);

    const response = {
        message: err.message || 'Erro interno do servidor.',
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.json(response);
};

module.exports = { notFound, errorHandler };
