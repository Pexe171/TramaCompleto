class HttpError extends Error {
    constructor(statusCode, message, cause) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        if (cause) {
            this.cause = cause;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

const createHttpError = (statusCode, message, cause) => new HttpError(statusCode, message, cause);

module.exports = {
    HttpError,
    createHttpError,
};
