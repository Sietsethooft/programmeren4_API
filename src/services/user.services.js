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
            if (error) {
                return callback({
                    status: 500,
                    message: 'Database error: ' + error.message
                });
            }            
    
            logger.info('User registered successfully:', results.insertId);
            return callback(null, {
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
    }    
};

module.exports = userServices;