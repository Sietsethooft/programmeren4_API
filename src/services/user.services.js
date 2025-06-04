const logger = require('../util/Logger');
const db = require('../database/DBconfig');

const userServices = {
    registerUser: (userData, callback) => {
        const { firstName, lastName, street, city, emailAdress, password, phonenumber } = userData; // Destructure userData
    
        const query = `
            INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phonenumber)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    
        db.query(query, [firstName, lastName, street, city, emailAdress, password, phonenumber], (error, results) => {
            if (error) return callback(error);            
    
            logger.info('User registered successfully:', results.insertId);
            return callback(null, { // Return the inserted user data with the generated ID
                id: results.insertId,
                firstName,
                lastName,
                street,
                city,
                emailAdress,
                phonenumber,
                password,
                isActive: 1 // Default value for isActive
              });
        });
    },

    findUserByEmail: (emailAdress, callback) => {
        const query = `SELECT * FROM user WHERE emailAdress = ?`;
    
        db.query(query, [emailAdress], (error, results) => {
            if (error) return callback(error);
    
            if (results.length === 0) {
                return callback(null, null); // No user found with the given email address
            }
    
            logger.info('User found:', results[0]);
            return callback(null, results[0]); // Return the found user
        });
    },

    getAllUsers: (filters = {}, callback) => { 
        let query = 'SELECT id, firstName, lastName, emailAdress, phonenumber, isActive, street, city FROM user';
        const values = []; 
    
        const allowedFields = ['firstName', 'lastName', 'isActive', 'emailAdress', 'city', 'street', 'phonenumber']; // All allowed fields for filtering
        const filterKeys = Object.keys(filters).filter(key => allowedFields.includes(key)); // Filter keys based on allowed fields
        
        if (filterKeys.length > 2) {
            return callback(new Error('You can only filter on a maximum of 2 fields.'));
        }
        
        if (filterKeys.length > 0) {
            const conditions = filterKeys.map(key => {
                let value = filters[key];
    
                // Special handling for isActive to convert "true"/"false" to 1/0
                if (key === 'isActive') {
                    value = value === 'true' ? 1 : 0;
                }
    
                values.push(value);
                return `${key} = ?`;
            });
    
            query += ' WHERE ' + conditions.join(' AND ');
        }
    
        db.query(query, values, (error, results) => {
            if (error) return callback(error);
            
            logger.info('All users retrieved successfully:', results);
            return callback(null, results);
        });
    },

    getUserById: (userId, callback) => {
        const query = `
            SELECT user.id, firstName, lastName, emailAdress, phonenumber, street, city, user.isActive, GROUP_CONCAT(meal.name SEPARATOR '; ') AS meals
            FROM user
            LEFT JOIN meal ON meal.cookId = user.id AND meal.dateTime >= NOW()
            WHERE user.id = ?
            GROUP BY user.id;`; // SEPARATOR makes sure that the meals can be split.
    
        db.query(query, [userId], (error, result) => {
            if (error) return callback(error);
    
            if (result.length === 0) return callback(null, null); // No users found
            
            const user = result[0]; // Get the first user from the result
    
            // Split the meals string into an array, or return an empty array if no meals exist
            user.meals = user.meals ? user.meals.split('; ') : [];
    
            logger.info('User found:', user);
            return callback(null, user); // Return the modified user object
        });
    },

    updateUser: (userId, userData, callback) => {
        const allowedFields = ['firstName', 'lastName', 'street', 'city', 'emailAdress', 'password', 'phonenumber']; // Allowed fields for updating
        const updates = [];
        const params = [];
        // Dynamically build the update query based on provided fields
        allowedFields.forEach((field) => {
            if (userData[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(userData[field]);
            }
        });

        if (updates.length === 0) { // For emergency
            return callback(new Error('No valid fields provided to update.'));
        }

        const query = `
            UPDATE user
            SET ${updates.join(', ')}
            WHERE id = ?
        `;
        params.push(userId); // Add mealId to the end of the params array

        params.push(userId);

        db.query(query, params, (error, results) => {
            if (error) return callback(error);

            // Haal de volledige gebruiker op na update
            db.query(
                `SELECT id, firstName, lastName, street, city, emailAdress, password, phonenumber, isActive FROM user WHERE id = ?`,
                [userId],
                (err, rows) => {
                    if (err) return callback(err);
                    if (!rows.length) return callback(new Error('User not found after update.'));
                    logger.info('User updated successfully:', rows[0]);
                    return callback(null, rows[0]);
                }
            );
        });
    },

    deleteUser: (userId, callback) => {
        const query = `DELETE FROM user WHERE id = ?`;
    
        db.query(query, [userId], (error, result) => { // Uses the result from the query to check if the user was deleted
            if (error) return callback(error);
    
            logger.info('User deleted successfully:', { userId, affectedRows: result.affectedRows });
            return callback(null, result);
        });
    }
};

module.exports = userServices;