const express = require('express');
const userController = require('../controllers/user.controller');

const userRoutes = express.Router();

userRoutes.get('/user', userController.getAllUsers);

userRoutes.post('/user', userController.registerUser);

module.exports = userRoutes;