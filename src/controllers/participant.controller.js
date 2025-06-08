const mealService = require('../services/meal.services');
const participantService = require('../services/participant.services');
const logger = require('../util/Logger');

const participantController = {
    createParticipant: (req, res, next) => { // UC-401
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        mealService.getMealById(mealId, (error, meal) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!meal) { // Check if the meal exists
                logger.warn(`Meal with ID #${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: `Meal not found.`,
                    data: {}
                });
            }

            if (!Array.isArray(meal.participants)) { // Ensure participants is an array
                meal.participants = [];
            }
             
            if (meal.participants.length >= meal.maxParticipants) { // Check if the meal has reached the maximum number of participants
                logger.warn(`Meal with ID #${mealId} has reached the maximum number of participants`);
                return res.status(200).json({
                    status: 200,
                    message: `This meal has reached the maximum number of participants.`,
                    data: {}
                });
            }

            participantService.createParticipant(mealId, loggedInUserId, (error, result) => {
                if (error) return next(error); // This sends the error to the error handler in util.    
                logger.info(`User with ID #${loggedInUserId} has signed up for meal with ID #${mealId}`);
                res.status(201).json({
                    status: 201,
                    message: `User with ID #${loggedInUserId} has signed up for meal with ID #${mealId}`,
                    data: {participant: result}
                });
            });
        });
    }
}

module.exports = participantController;