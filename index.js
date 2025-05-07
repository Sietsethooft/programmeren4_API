const express = require('express')
const logger = require('./src/util/Logger');
const bodyParser = require('body-parser');
const db = require('./src/database/DBconfig');
const { errorHandler } = require('./src/util/ErrorHandler');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Welcome to the API of Share-A-Meal!',
        data: {
            name: 'Share-A-Meal API',
            version: '1.0.0',
            description: 'This is the API for Share-A-Meal, a platform for sharing meals.',
        }
    });
});

app.get('/test-error', (req, res, next) => {
    next({ status: 400, message: 'Test error' });
});


// Route connection
app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
 });

module.exports = app;