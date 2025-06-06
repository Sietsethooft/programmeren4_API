const express = require('express');
const participantController = require('../controllers/participant.controller');
const authMiddleware = require('../middleware/auth.middleware');

const participantRoutes = express.Router();

module.exports = participantRoutes;