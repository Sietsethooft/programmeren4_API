const db = require('../database/DBconfig');
const logger = require('../util/Logger');

const authServices = {
    login: (emailAdress, callback) => {
        const query = 'SELECT * FROM user WHERE emailAdress = ?';
       
        db.query(query, [emailAdress], (error, result) => {
            if (error) return callback(error);

            logger.trace(result);
            callback(null, result);
        });
    }
};

module.exports = authServices;
