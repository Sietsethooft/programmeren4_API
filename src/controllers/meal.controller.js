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
                data: result
            });
        });
    },

    getAllMeals: (req, res, next) => { // UC-303
        mealService.getAllMeals( (error, meals) => {
            if (error) return next(error); // This sends the error to the error handler in util.

            res.status(200).json({
                status: 200,
                message: 'Meals retrieved successfully',
                data: meals
            });
        });
    },
}

module.exports = mealController;