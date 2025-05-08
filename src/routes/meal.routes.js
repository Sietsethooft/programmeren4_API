const express = require('express');
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middleware/auth.middleware');

const mealRoutes = express.Router();



module.exports = mealRoutes;