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
        const query = `
            SELECT 
                meal.id AS mealId, 
                meal.name AS mealName, 
                meal.description, 
                meal.isActive AS mealIsActive, 
                meal.isVega, 
                meal.isVegan, 
                meal.isToTakeHome, 
                meal.dateTime, 
                meal.maxAmountOfParticipants, 
                meal.price, 
                meal.imageUrl, 
                meal.allergenes, 
                user.id AS cookId, 
                user.firstName AS cookFirstName, 
                user.lastName AS cookLastName, 
                user.street AS cookStreet, 
                user.city AS cookCity, 
                user.isActive AS cookIsActive, 
                user.emailAdress AS cookEmailAdress, 
                user.phoneNumber AS cookPhoneNumber,
                participant.id AS participantId,
                participant.firstName AS participantFirstName,
                participant.lastName AS participantLastName,
                participant.street AS participantStreet,
                participant.city AS participantCity,
                participant.isActive AS participantIsActive,
                participant.emailAdress AS participantEmailAdress,
                participant.phoneNumber AS participantPhoneNumber
            FROM meal
            JOIN user ON meal.cookId = user.id
            LEFT JOIN meal_participants_user AS mpu ON meal.id = mpu.mealId
            LEFT JOIN user AS participant ON mpu.userId = participant.id
        `;

        db.query(query, (error, results) => {
            if (error) return callback(error);

            // Transform the results to match the desired structure
            const mealsMap = new Map();

            results.forEach((row) => {
                if (!mealsMap.has(row.mealId)) {
                    mealsMap.set(row.mealId, {
                        id: row.mealId,
                        name: row.mealName,
                        description: row.description,
                        isActive: row.mealIsActive,
                        isVega: row.isVega,
                        isVegan: row.isVegan,
                        isToTakeHome: row.isToTakeHome,
                        dateTime: row.dateTime,
                        maxAmountOfParticipants: row.maxAmountOfParticipants,
                        price: row.price,
                        imageUrl: row.imageUrl,
                        allergenes: row.allergenes ? row.allergenes.split(',') : [],
                        cook: {
                            id: row.cookId,
                            firstName: row.cookFirstName,
                            lastName: row.cookLastName,
                            street: row.cookStreet,
                            city: row.cookCity,
                            isActive: row.cookIsActive,
                            emailAdress: row.cookEmailAdress,
                            phoneNumber: row.cookPhoneNumber,
                        },
                        participants: [],
                    });
                }

                if (row.participantId) {
                    mealsMap.get(row.mealId).participants.push({
                        id: row.participantId,
                        firstName: row.participantFirstName,
                        lastName: row.participantLastName,
                        street: row.participantStreet,
                        city: row.participantCity,
                        isActive: row.participantIsActive,
                        emailAdress: row.participantEmailAdress,
                        phoneNumber: row.participantPhoneNumber,
                    });
                }
            });

            const meals = Array.from(mealsMap.values());
            callback(null, meals);
        });
    },
}

module.exports = mealService;