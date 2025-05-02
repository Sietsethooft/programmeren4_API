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
            if (err) return callback(err);            
    
            logger.info('User registered successfully:', results.insertId);
            return callback(null, { // Return the inserted user data with the generated ID
                userId: results.insertId,
                firstName,
                lastName,
                street,
                city,
                emailAdress,
                password,
                phonenumber
              });
        });
    },

    findUserByEmail: (emailAdress, callback) => {
        const query = `SELECT * FROM user WHERE emailAdress = ?`;
    
        db.query(query, [emailAdress], (error, results) => {
            if (err) return callback(err);
    
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
    
        db.query(query, values, (err, results) => {
            if (err) return callback(err);
            
            logger.info('All users retrieved successfully:', results);
            return callback(null, results);
        });
    },
};

module.exports = userServices;