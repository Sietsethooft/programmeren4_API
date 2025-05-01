const userService = require('../services/user.services');
const logger = require('../util/Logger');

const userController = {
    registerUser: (req, res, next) => {
        const userData = req.body;
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