const express = require('express')
const logger = require('./src/util/Logger');
const bodyParser = require('body-parser');
const db = require('./src/database/DBconfig');
const { errorHandler } = require('./src/util/ErrorHandler');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const mealRoutes = require('./src/routes/meal.routes');
const participantRoutes = require('./src/routes/participant.routes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


app.get('/info', (req, res) => {
    res.json({
        status: 200,
        message: 'Welcome to my Share-A-Meal API!',
        data: {
            studentName: 'Sietse t Hooft',
            studentNumber: '2213722',
            description: 'Dit is een zelfgemaakte API voor de Share-A-Meal opdracht.' +
            ' Deze API maakt gebruik van javascript & mysql.' +
            ' Voor de authenticatie wordt gebruik gemaakt van JWT tokens en bycrypt voor het hashen van wachtwoorden.' +
            ' Ook bevat deze API meerdere testen die zijn geschreven met Mocha en Chai.'
        }
    });
});

// Route connection
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mealRoutes);
app.use('/api', participantRoutes)

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
 });

module.exports = app;