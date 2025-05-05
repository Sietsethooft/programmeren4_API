const express = require('express');
const userController = require('../controllers/user.controller');

const userRoutes = express.Router();

userRoutes.get('/user', userController.getAllUsers);
userRoutes.get('/user/:userId', userController.getUserById);

userRoutes.post('/user', userController.registerUser);

userRoutes.put('/user/:userId', userController.updateUser);

userRoutes.delete('/user/:userId', userController.deleteUser);

module.exports = userRoutes;