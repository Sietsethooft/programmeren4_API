const logger = require('../util/Logger');

function errorHandler(error, req, res, next) {
    logger.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';

    res.status(status).json({
        status,
        message,
        data: {}
    });
}

// Specific error handler for validation errors
function handleValidationError(res, error) {
    if (error) {
        let errorMessage = '';
        switch (error.details[0].context.key) { // Check the key of the error to provide a specific message
            case 'emailAdress':
                errorMessage = 'EmailAdress is not in the correct format. An email address needs to follow the pattern: n.last@domain.com where lastname contains at least 2 characters.';
                break;
            case 'password':
                errorMessage = 'Password must be at least 8 characters long and include at least one uppercase letter and one number.';
                break;
            case 'phonenumber':
                errorMessage = 'Phonenumber must start with 06 and contain 10 digits.';
                break;
            default:
                errorMessage = error.details[0].message; // Default error message when no specific case is matched
        }

        return res.status(400).json({
            status: 400,
            message: 'Validation error: ' + errorMessage,
            data: {}
        });
    }
}

module.exports = { errorHandler, handleValidationError };