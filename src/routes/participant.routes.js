const express = require('express');
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');

const participantRoutes = express.Router();

participantRoutes.post('/participate', authMiddleware.authenticateToken, participantController.createParticipant);

module.exports = participantRoutes;