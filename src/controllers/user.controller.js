const userService = require('../services/user.services');
const validate = require('../util/Validation');
const logger = require('../util/Logger');
const { handleValidationErrorUser } = require('../util/ErrorHandler'); // Import an specific error handler function
const bcrypt = require('bcrypt');

const userController = {
    registerUser: (req, res, next) => { // UC-201
        const userData = req.body;

        const { error } = validate.registerUserValidation(userData); // Validate the user data using the validation function
        if (error) {
            return handleValidationErrorUser(res, error);
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

            // Hash the password before saving it
            bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
                if (error) return next(error);

                // Change the password in userData to the hashed password
                userData.password = hashedPassword;

                // Register the user
                userService.registerUser(userData, (error, result) => {
                    if (error) return next(error);

                    res.status(201).json({
                        status: 201,
                        message: 'User registered successfully',
                        data: { user: result}
                    });
                });
            });
        });
    },
    
    getAllUsers: (req, res, next) => { // UC-202
        const filters = req.query;

        userService.getAllUsers(filters, (error, users) => {
            if (error) return next(error);
    
            res.status(200).json({
                status: 200,
                message: 'Users retrieved successfully',
                data: {users}
            });
        });
    },

    getUserProfile: (req, res, next) => { // UC-203
        const userId = req.user.userId; // Get the userId from the token
        logger.info('User ID from token:', userId); // Log the userId for debugging
        
        userService.getUserById(userId, (error, result) => {
            if (error) return next(error);

            if (!result) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                });
            }

            res.status(200).json({
                status: 200,
                message: 'User profile retrieved successfully',
                data: {user: result}
            });
        });
    },

    getUserById: (req, res, next) => { // UC-204
        const userId = parseInt(req.params.userId, 10);

        userService.getUserById(userId, (error, result) => {
            if (error) return next(error);

            if (!result) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                });
            }

            res.status(200).json({
                status: 200,
                message: 'User retrieved successfully',
                data: {user: result}
            });
        });
    },

    updateUser: (req, res, next) => { // UC-205
        const userId = parseInt(req.params.userId, 10);
        const userData = req.body;
        const loggedInUserId = req.user.userId; // Get the userId from the token

        userService.getUserById(userId, (error, user) => {
            if (error) return next(error);

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                });
            }

            if (loggedInUserId !== userId) {
                return next({
                    status: 403,
                    message: "User is not the owner of this account",
                    data: {}
                });
            }

            const { error: validationError } = validate.updateUserValidation(userData); // Validate the user data using the validation function
            if (validationError) {
                return handleValidationErrorUser(res, validationError);
            }

            // Check if password is present, hash it if so
            if (userData.password) {
                bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
                    if (err) return next(err);

                    userData.password = hashedPassword;

                    userService.updateUser(userId, userData, (error, result) => {
                        if (error) return next(error);

                        res.status(200).json({
                            status: 200,
                            message: 'User updated successfully',
                            data: {user: result}
                        });
                    });
                });
            } else {
                userService.updateUser(userId, userData, (error, result) => {
                    if (error) return next(error);

                    res.status(200).json({
                        status: 200,
                        message: 'User updated successfully',
                        data: {user: result}
                    });
                });
            }
        });
    },

    deleteUser: (req, res, next) => { // UC-206
        const userId = parseInt(req.params.userId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        userService.getUserById(userId, (error, user) => {
            if (error) return next(error);

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                });
            }

            if (loggedInUserId !== userId) {
                return next({
                    status: 403,
                    message: "User is not the owner of this account",
                    data: {}
                });
            }

            userService.deleteUser(userId, (error, result) => {
                if (error) return next(error);
    
                res.status(200).json({
                    status: 200,
                    message: `User with ID ${userId} is deleted`,
                    data: {}
                });
            });
        });
    }
}

module.exports = userController;