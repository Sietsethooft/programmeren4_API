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
                        allergenes: row.allergenes ? row.allergenes.split(',') : [], // Split allergenes into an array
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

                if (row.participantId) { // Only add participants if they exist
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

    getMealById: (mealId, callback) => { // UC-304
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
            WHERE meal.id = ?
        `;

        db.query(query, [mealId], (error, results) => {
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
                        allergenes: row.allergenes ? row.allergenes.split(',') : [], // Split allergenes into an array
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

                if (row.participantId) { // Only add participants if they exist
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

    getCookId: (mealId, callback) => {
        const query = `SELECT cookId FROM meal WHERE id = ?`;
        db.query(query, [mealId], (error, result) => {
            if (error) return callback(error);

            if (result.length === 0) return callback(null, null); // No meal found

            const cookId = result[0].cookId;
            callback(null, cookId);
        });
    },
    
    deleteMeal: (mealId, loggedInUserId, callback) => {
        const query = `DELETE FROM meal WHERE id = ? AND cookId = ?`;
        const params = [mealId, loggedInUserId];

        db.query(query, params, (error, result) => {
            if (error) return callback(error);

            callback(null, result);
        });
    },

    updateMeal: (mealId, mealData, callback) => {
        const allowedFields = ['name', 'description', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'dateTime', 'maxAmountOfParticipants', 'imageUrl', 'allergenes'];
        const updates = [];
        const params = [];

        // Dynamically build the update query based on provided fields
        allowedFields.forEach((field) => {
            if (mealData[field] !== undefined) {
                if (field === 'allergenes' && Array.isArray(mealData[field])) {
                    // Set the allergenes field as a comma-separated string
                    updates.push(`${field} = ?`);
                    params.push(mealData[field].join(',')); // Convert array to comma-separated string
                } else {
                    updates.push(`${field} = ?`);
                    params.push(mealData[field]);
                }
            }
        });

        if (updates.length === 0) { // For emurgencies
            return callback(new Error('No valid fields provided to update.'));
        }

        const query = `
            UPDATE meal
            SET ${updates.join(', ')}
            WHERE id = ?
        `;
        params.push(mealId); // Add mealId to the end of the params array

        db.query(query, params, (error, result) => {
            if (error) return callback(error);

            const updatedMeal = {
                id: mealId,
                ...mealData, // Only include the fields that were updated
            };

            callback(null, updatedMeal);
        });
    },
}

module.exports = mealService;