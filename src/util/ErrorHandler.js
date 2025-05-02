const logger = require('../util/Logger');

function ErrorHandler(error, req, res, next) {
    logger.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';

    res.status(status).json({
        status,
        message,
        data: {}
    });
}

module.exports = ErrorHandler;