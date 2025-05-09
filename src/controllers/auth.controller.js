const authServices = require('../services/auth.services');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../util/Logger');

const authController = {
    loginUser: (req, res, next) => {
        const { emailAdress, password } = req.body; // Gets information from the request body

        if (!emailAdress || !password) { // Validates the input
            return res.status(400).json({
                status: 400,
                message: 'Email address and password are required.',
                data: {}
            });
        }

        authServices.login(emailAdress, (error, results) => {
            if (error) return next(error);
        
            const user = results[0];
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found.',
                    data: {}
                });
            }

            bcrypt.compare(password, user.password, (error, isMatch) => { // Validates the password
                if (error) return next(error);
        
                if (!isMatch) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid password or email.',
                        data: {}
                    });
                }
        
                // Generate JWT token
                const payload = { userId: user.id, emailAdress: user.emailAdress };
                const secret = process.env.JWT_SECRET;
                const options = { expiresIn: '1y' };
        
                jwt.sign(payload, secret, options, (error, token) => {
                    if (error) return next(error);
        
                    // Sends back user data and token
                    const userData = {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        emailAdress: user.emailAdress,
                        phonenumber: user.phoneNumber,
                        street: user.street,
                        city: user.city
                    };
        
                    res.status(200).json({
                        status: 200,
                        message: 'Login successful.',
                        data: { user: userData, token }
                    });
                });
            });
        });
    }
};

module.exports = authController;