const logger = require('../util/Logger');
const db = require('../database/DBconfig');
const { createDatabaseError } = require('../util/ErrorHandler'); // Importeer de hulpfunctie


const userServices = {
    registerUser: (userData, callback) => {
        const { firstName, lastName, street, city, emailAdress, password, phonenumber } = userData; // Destructure userData
    
        const query = `
            INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phonenumber)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    
        db.query(query, [firstName, lastName, street, city, emailAdress, password, phonenumber], (error, results) => {
            if (error) {
                return callback(createDatabaseError(error)); // Use the createDatabaseError function to create a database error object
            }            
    
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
        const query = `
            SELECT * FROM user WHERE emailAdress = ?
        `;
    
        db.query(query, [emailAdress], (error, results) => {
            if (error) {
                return callback(createDatabaseError(error)); // Use the createDatabaseError function to create a database error object
            }
    
            if (results.length === 0) {
                return callback(null, null); // No user found with the given email address
            }
    
            logger.info('User found:', results[0]);
            return callback(null, results[0]); // Return the found user
        });
    },

    getAllUsers: (callback) => {
        const query = `
            SELECT * FROM user
        `;
    
        db.query(query, (error, results) => {
            if (error) {
                return callback(createDatabaseError(error)); // Use the createDatabaseError function to create a database error object
            }
    
            logger.info('All users retrieved successfully:', results);
            return callback(null, results); // Return all users
        });
    },
};

module.exports = userServices;