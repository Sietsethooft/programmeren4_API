const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const userRoutes = express.Router();
userRoutes.post('/user', userController.registerUser);

userRoutes.get('/user', authMiddleware.authenticateToken, userController.getAllUsers);
userRoutes.get('/user/profile', authMiddleware.authenticateToken, userController.getUserProfile);
userRoutes.get('/user/:userId', authMiddleware.authenticateToken, userController.getUserById);

userRoutes.put('/user/:userId', authMiddleware.authenticateToken, userController.updateUser);

userRoutes.delete('/user/:userId', authMiddleware.authenticateToken, userController.deleteUser);

module.exports = userRoutes;