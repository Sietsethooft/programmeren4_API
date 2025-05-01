const express = require('express')
const logger = require('./src/util/Logger');
const db = require('./src/database/DBconfig');
const errorHandler = require('./src/util/ErrorHandler');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/user.routes');
require('dotenv').config();

const app = express();
app.use(errorHandler);

// Route connection
app.use('/api', userRoutes);

// Test databaseConnection
db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected!')
    }
})

const port = process.env.PORT || 3000;



app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
 });

module.exports = app;