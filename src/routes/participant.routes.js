const express = require('express');
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');

const participantRoutes = express.Router();

participantRoutes.post('/:mealId/participate', authMiddleware.authenticateToken, participantController.createParticipant);

participantRoutes.delete('/:mealId/participate', authMiddleware.authenticateToken, participantController.deleteParticipant);

participantRoutes.get('/:mealId/participants', authMiddleware.authenticateToken, participantController.getParticipants);
participantRoutes.get('/:mealId/participants/:participantId', authMiddleware.authenticateToken, participantController.getParticipantById);

module.exports = participantRoutes;