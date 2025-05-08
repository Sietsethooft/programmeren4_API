const express = require('express');
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middleware/auth.middleware');

const mealRoutes = express.Router();

mealRoutes.post('/meal', authMiddleware.authenticateToken, mealController.createMeal);

module.exports = mealRoutes;