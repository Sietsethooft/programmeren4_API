const logger = require('../util/Logger');

function ErrorHandler(err, req, res, next) {
    logger.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        status,
        message,
        data: {}
    });
}

module.exports = ErrorHandler;