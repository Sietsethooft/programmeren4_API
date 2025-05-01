const express = require('express')
const logger = require('./src/util/Logger');
const db = require('./src/database/DBconfig')
const errorHandler = require('./src/util/ErrorHandler');
const dotenv = require('dotenv');
require('dotenv').config()

const app = express()
const app = express();
app.use(errorHandler);

// Test databaseverbinding
db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected!')
    }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
 });

module.exports = app;