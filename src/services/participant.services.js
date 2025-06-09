const logger = require('../util/Logger');
const db = require('../database/DBconfig');

const participantService = {
    createParticipant: (mealId, loggedInUserId, callback) => {
        const query = 'INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)';
        db.query(query, [mealId, loggedInUserId], (error, results) => {
            if (error) {
                logger.error(`Error creating participant: ${error.message}`);
                return callback(error);
            }
            callback(null, { mealId, userId: loggedInUserId });
        });
    },

    checkParticipant: (mealId, loggedInUserId, callback) => {
        const query = 'SELECT * FROM meal_participants_user WHERE mealId = ? AND userId = ?';
        db.query(query, [mealId, loggedInUserId], (error, results) => {
            if (error) {
                logger.error(`Error checking participant: ${error.message}`);
                return callback(error);
            }
            callback(null, results);
        });
    },

    deleteParticipant: (mealId, loggedInUserId, callback) => {
        const query = 'DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?';
        db.query(query, [mealId, loggedInUserId], (error, results) => {
            if (error) {
                logger.error(`Error deleting participant: ${error.message}`);
                return callback(error);
            }
            callback(null, { mealId, userId: loggedInUserId });
        });
    },

    getParticipants: (mealId, callback) => {
        const query = `SELECT id, firstName, lastName, emailAdress, phonenumber, isActive, street, city FROM user WHERE id IN ( SELECT userId FROM meal_participants_user WHERE mealId = ? )`;
        db.query(query, [mealId], (error, results) => {
            if (error) {
                logger.error(`Error fetching participants: ${error.message}`);
                return callback(error);
            }
            callback(null, results);
        });
    },

    getParticipantById: (mealId, participantId, callback) => {
        const query = `SELECT id, firstName, lastName, emailAdress, phonenumber, isActive, street, city FROM user WHERE id = ? AND id IN ( SELECT userId FROM meal_participants_user WHERE mealId = ? )`;
        db.query(query, [participantId, mealId], (error, results) => {
            if (error) {
                logger.error(`Error fetching participant by ID: ${error.message}`);
                return callback(error);
            }
            callback(null, results[0]);
        });
    }
}

module.exports = participantService;