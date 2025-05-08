const jwt = require('jsonwebtoken');
const logger = require('../util/Logger');

const authMiddleware = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization']; // Get the authorization header from the request
        const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'Access token is missing or invalid.',
                data: {}
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
            if (error) {
                logger.error('Invalid token:', err.message);
                return res.status(403).json({
                    status: 403,
                    message: 'Invalid or expired token.',
                    data: {}
                });
            }

            req.user = user; // Attach the user information to the request object
            next();
        });
    }
};

module.exports = authMiddleware;