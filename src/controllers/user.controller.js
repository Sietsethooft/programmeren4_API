const userService = require('../services/user.services');
const validate = require('../util/Validation');
const logger = require('../util/Logger');

const userController = {
    registerUser: (req, res, next) => { // UC-201
        const userData = req.body;
        
        const { error } = validate.registerUserValidation(userData); // Validate the user data using the validation function
        if (error) {
            return handleValidationError(res, error);
        }

        userService.findUserByEmail(userData.emailAdress, (error, existingUser) => {
            if (error) return next(error); // This sends the error to the error handler in util.
    
            if (existingUser) {
                return res.status(403).json({
                    status: 403,
                    message: 'A user with this email address already exists.',
                    data: {}
                });
            }
    
            // If no existing user is found, proceed with registration
            logger.info('Received user data:', userData); // Logs the received user data
    
            userService.registerUser(userData, (error, result) => {
                if (error) return next(error); // This sends the error to the error handler in util.
    
                res.status(201).json({
                    status: 201,
                    message: 'User registered successfully',
                    data: result
                });
            });
        });
    },
    
    getAllUsers: (req, res, next) => { // UC-202
        const filters = req.query;

        userService.getAllUsers(filters, (error, users) => {
            if (error) return next(error); // This sends the error to the error handler in util.
    
            res.status(200).json({
                status: 200,
                message: 'Users retrieved successfully',
                data: {
                    users
                }
            });
        });
    },

    updateUser: (req, res, next) => { // UC-203
        const userId = req.params.userId;
        const userData = req.body;

        const { error } = validate.updateUserValidation(userData); // Validate the user data using the validation function
        if (error) {
            return handleValidationError(res, error);
        }

        userService.updateUser(userId, userData, (error, result) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                });
            }

            res.status(200).json({
                status: 200,
                message: 'User updated successfully',
                data: result
            });
        });
    }
}

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


module.exports = userController;