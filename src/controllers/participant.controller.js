const mealService = require('../services/meal.services');
const participantService = require('../services/participant.services');
const logger = require('../util/Logger');

const participantController = {
    createParticipant: (req, res, next) => { // UC-401
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        mealService.getMealById(mealId, (error, meals) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!meals || meals.length === 0) { // Check if the meal exists
                logger.warn(`Meal with ID #${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: `Meal not found.`,
                    data: {}
                });
            }

            const meal = meals[0]; // Get the first meal from the result

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
    },

    deleteParticipant: (req, res, next) => { // UC-402
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        mealService.getMealById(mealId, (error, meals) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!meals || meals.length === 0) { // Check if the meal exists
                logger.warn(`Meal with ID #${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: `Meal not found.`,
                    data: {}
                });
            }

            participantService.checkParticipant(mealId, loggedInUserId, (error, participant) => {
                if (error) return next(error);

                if (!participant || participant.length === 0) { // Check if the user is a participant of the meal
                    logger.warn(`User with ID #${loggedInUserId} is not a participant of meal with ID #${mealId}`);
                    return res.status(404).json({
                        status: 404,
                        message: `User is not a participant of this meal.`,
                        data: {}
                    });
                }

                participantService.deleteParticipant(mealId, loggedInUserId, (error, result) => {
                    if (error) return next(error); // This sends the error to the error handler in util.
                    logger.info(`User with ID #${loggedInUserId} has unsubscribed from meal with ID #${mealId}`);
                    res.status(200).json({
                        status: 200,
                        message: `User with ID #${loggedInUserId} has unsubscribed from meal with ID #${mealId}`,
                        data: {participant: result}
                    });
                });
            });
        });
    },

    getParticipants: (req, res, next) => { // UC-403
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        mealService.getMealById(mealId, (error, meals) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!meals || meals.length === 0) { // Check if the meal exists
                logger.warn(`Meal with ID #${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: `Meal not found.`,
                    data: {}
                });
            }

            const meal = meals[0]; // Get the first meal from the result
            if (meal.cook.id !== loggedInUserId) { // Check if the logged-in user is the cook of the meal
                logger.warn(`User with ID #${loggedInUserId} is not the cook of meal with ID #${mealId}`);
                return res.status(403).json({
                    status: 403,
                    message: `You are not the owner of this meal.`,
                    data: {}
                });
            }

            participantService.getParticipants(mealId, (error, participants) => {
                if (error) return next(error); // This sends the error to the error handler in util.
                logger.info(`Fetched participants for meal with ID #${mealId}`);
                res.status(200).json({
                    status: 200,
                    message: `Participants fetched successfully.`,
                    data: {participants}
                });
            });
        });
    }
}

module.exports = participantController;