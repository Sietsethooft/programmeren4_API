const userService = require('../services/user.services');
const validate = require('../util/Validation');
const logger = require('../util/Logger');

const userController = {
    registerUser: (req, res, next) => {
        const userData = req.body;
        
        const { error } = validate.registerUserValidation(userData); // Validate the user data using the validation function
        if (error) {
            let errorMessage = '';
            switch (error.details[0].context.key) { // Check the key of the error to provide a specific message
                case 'emailAdress':
                    errorMessage = 'EmailAdress is not in the correct format. An email address needs to follow the pattern: first.last@domain.com';
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
                message: 'Validation error',
                data: { 
                    error: errorMessage // Send the validation error message back to the client
                }});
        }


        logger.info('Received user data:', userData); // Logs the received user data
    
        userService.registerUser(userData, (err, result) => {
            if (err) return next(err); // This sends the error to the error handler in util.
    
            res.status(201).json({
                status: 201,
                message: 'User registered successfully',
                data: result
            });
        });
    }   
};

module.exports = userController;