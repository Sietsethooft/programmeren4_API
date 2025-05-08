const logger = require('../util/Logger');
const db = require('../database/DBconfig');

const mealService = {
    createMeal: (mealData, loggedInUserId, callback) => { // UC-301
        const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl } = mealData;

        const query = `INSERT INTO meal (name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [name, description, price, dateTime, maxAmountOfParticipants, imageUrl, loggedInUserId];

        db.query(query, params, (error, result) => {
            if (error) return callback(error);

            const createdMeal = {
                id: result.insertId,
                ...mealData,
                cookId: loggedInUserId,
            };

            callback(null, createdMeal);
        });
    },

    getAllMeals: (callback) => { // UC-303
        const query = `SELECT * FROM meal`;

        db.query(query, (error, results) => {
            if (error) return callback(error);

            const meals = results.map(meal => ({
                id: meal.id,
                name: meal.name,
                description: meal.description,
                price: meal.price,
                dateTime: meal.dateTime,
                maxAmountOfParticipants: meal.maxAmountOfParticipants,
                imageUrl: meal.imageUrl,
                cookId: meal.cookId,
            }));

            callback(null, meals);
        });
    },
}

module.exports = mealService;