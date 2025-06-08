const express = require('express');
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');

const participantRoutes = express.Router();

participantRoutes.post('/:mealId/participate', authMiddleware.authenticateToken, participantController.createParticipant);

participantRoutes.delete('/:mealId/participate', authMiddleware.authenticateToken, participantController.deleteParticipant);

module.exports = participantRoutes;