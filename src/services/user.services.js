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
                userId: results.insertId,
                firstName,
                lastName,
                street,
                city,
                emailAdress,
                phonenumber
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
    
        const allowedFields = ['firstName', 'lastName', 'isActive', 'emailAdress', 'city']; // All allowed fields for filtering
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
            SELECT user.id, firstName, lastName, emailAdress, phonenumber, street, city, GROUP_CONCAT(meal.name SEPARATOR '; ') AS meals
            FROM user
            LEFT JOIN meal ON meal.cookId = user.id AND meal.dateTime >= NOW()
            WHERE user.id = ?
            GROUP BY user.id;`; // SEPARATOR makes sure that the meals can be split.
    
        db.query(query, [userId], (error, result) => {
            if (error) return callback(error);
    
            if (result.length === 0) {
                // Return null if no user is found
                logger.info('No user found with ID:', userId);
                return callback(null, null);
            }
            
            const user = result[0]; // Get the first user from the result
    
            // Split the meals string into an array, or return an empty array if no meals exist
            user.meals = user.meals ? user.meals.split('; ') : [];
    
            logger.info('User found:', user);
            return callback(null, user); // Return the modified user object
        });
    },

    updateUser: (userId, userData, callback) => {
        const { firstName, lastName, street, city, emailAdress, password, phonenumber } = userData; // Destructure userData
    
        const query = `
            UPDATE user
            SET firstName = ?, lastName = ?, street = ?, city = ?, emailAdress = ?, password = ?, phonenumber = ?
            WHERE id = ?
        `;
    
        db.query(query, [firstName, lastName, street, city, emailAdress, password, phonenumber, userId], (error, results) => {
            if (error) return callback(error);
    
            logger.info('User updated successfully:', { userId, ...userData });
            return callback(null, { 
                firstName,
                lastName,
                street,
                city,
                emailAdress,
                phonenumber,
                password
            });
        });
    },

    deleteUser: (userId, callback) => {
        const query = `DELETE FROM user WHERE id = ?`;
    
        db.query(query, [userId], (error, result) => { // Gebruik result van de query
            if (error) return callback(error);
    
            logger.info('User deleted successfully:', { userId, affectedRows: result.affectedRows });
            return callback(null, result);
        });
    }
};

module.exports = userServices;