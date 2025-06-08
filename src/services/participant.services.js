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
    }
}

module.exports = participantService;