const userService = require('../services/user.services');
const validate = require('../util/Validation');
const logger = require('../util/Logger');

const userController = {
    registerUser: (req, res, next) => {
        const userData = req.body;
        
        const { error } = validate.registerUserValidation(userData); // Validate the user data using the validation function
        if (error) {
            return res.status(400).json({
                status: 400,
                message: 'Validation error',
                error: error.details[0].message // Send the validation error message back to the client
            });
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