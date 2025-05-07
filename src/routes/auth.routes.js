const express = require('express');
const authController = require('../controllers/auth.controller');
const authRoutes = express.Router();

authRoutes.post('/login', authController.loginUser);

module.exports = authRoutes;