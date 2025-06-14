const mealService = require('../services/meal.services');
const logger = require('../util/Logger');
const validation = require('../util/Validation');

const mealController = {
    createMeal: (req, res, next) => { // UC-301
        const mealData = req.body;
        const loggedInUserId = req.user.userId; // Get the userId from the token

        const { error } = validation.createMealValidation(mealData); // Validate the meal data
        if (error) {
            return res.status(400).json({
            status: 400,
            message: error.message,
            data: {}
            });
        } 

        mealService.createMeal(mealData, loggedInUserId, (error, result) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            res.status(201).json({
                status: 201,
                message: 'Meal created successfully',
                data: {meal: result}
            });
        });
    },

    updateMeal: (req, res, next) => { // UC-302
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token
        const mealData = req.body;   

        const { error } = validation.updateMealValidation(mealData); // Validate the meal data
            if (error) {
                return res.status(400).json({
                    status: 400,
                    message: error.message,
                    data: {}
                });
            }

        mealService.getCookId(mealId, (error, cookId) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!cookId) {
                logger.warn(`Meal with ID ${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: 'Meal not found',
                    data: {}
                });
            }

            if (loggedInUserId !== cookId) {
                logger.warn(`User with ID ${loggedInUserId} is not the owner of meal with ID ${mealId}`);
                return res.status(403).json({
                    status: 403,
                    message: "User is not the owner of this meal",
                    data: {}
                });
            }

            mealService.updateMeal(mealId, mealData, (error, result) => {
                if (error) return next(error); // This sends the error to the error handler in util.

                res.status(200).json({
                    status: 200,
                    message: 'Meal updated successfully',
                    data: {meal: result}
                });
            });

        });
    },

    getAllMeals: (req, res, next) => { // UC-303
        mealService.getAllMeals( (error, meals) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            res.status(200).json({
                status: 200,
                message: 'Meals retrieved successfully',
                data: {meals}
            });
        });
    },

    getMealById: (req, res, next) => { // UC-304
        const mealId = parseInt(req.params.mealId, 10);

        mealService.getMealById(mealId, (error, results) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            result = results[0]; // Get the first meal from the result
            if (!result) {
                logger.warn(`Meal with ID ${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: 'Meal not found',
                    data: {}
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Meal retrieved successfully',
                data: {meal: result}
            });
        });
    },

    deleteMeal: (req, res, next) => { // UC-305
        const mealId = parseInt(req.params.mealId, 10);
        const loggedInUserId = req.user.userId; // Get the userId from the token

        mealService.getCookId(mealId, (error, cookId) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            if (!cookId) {
                logger.warn(`Meal with ID ${mealId} not found`);
                return res.status(404).json({
                    status: 404,
                    message: 'Meal not found',
                    data: {}
                });
            }

            if (loggedInUserId !== cookId) {
                logger.warn(`User with ID ${loggedInUserId} is not the owner of meal with ID ${mealId}`);
                return res.status(403).json({
                    status: 403,
                    message: "User is not the owner of this meal",
                    data: {}
                });
            }

            mealService.deleteMeal(mealId, loggedInUserId, (error, result) => {
                if (error) return next(error); // This sends the error to the error handler in util.

                res.status(200).json({
                    status: 200,
                    message: `Meal with ID ${mealId} deleted successfully`,
                    data: {}
                });
            });
        });
    }
}

module.exports = mealController;