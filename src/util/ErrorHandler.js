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

// This function creates a database error object with a status code and message.
function createDatabaseError(error) {
    const dbError = new Error('Database error' + error.message);
    dbError.status = 500;
    return dbError;
}

module.exports = {
    ErrorHandler,
    createDatabaseError
};