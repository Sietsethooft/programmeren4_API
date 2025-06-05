process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const e = require('express');
logger = require('../src/util/Logger');

const expect = chai.expect;

const userEmail = 'j.klaasen@outlook.com';
const userPassword = 'ValidPassword1234';
let userId;
let token;

const otherUserEmail = 's.dewit@outlook.com'
const otherUserPassword = 'ValidPassword1234';
let otherUserId;
let otherToken;

let mealId;

chai.use(chaiHttp);

before((done) => { // Before all tests, create a user and log in to get a token
  chai.request(app)
    .post('/api/user')
    .send({ 
        firstName: 'Jan', 
        lastName: 'Klaasen', 
        street: 'Damstraat 1', 
        city: 'Amsterdam', 
        emailAdress: userEmail,
        password: userPassword,
        phonenumber: '06-12345678'})
    .end(() => {
      chai.request(app)
        .post('/api/login')
        .send({
            emailAdress: userEmail,
            password: userPassword
        })
        .end((err, res) => {
          token = res.body.data.token;
          userId = res.body.data.user.id;
          done();
        });
    });
});

before((done) => { // Before all tests, create a user and log in to get a token
  chai.request(app)
    .post('/api/user')
    .send({ 
        firstName: 'Sandra', 
        lastName: 'de Wit', 
        street: 'Damstraat 1', 
        city: 'Amsterdam', 
        emailAdress: otherUserEmail,
        password: otherUserPassword,
        phonenumber: '06-12345678'})
    .end(() => {
      chai.request(app)
        .post('/api/login')
        .send({
            emailAdress: otherUserEmail,
            password: otherUserPassword
        })
        .end((err, res) => {
          otherToken = res.body.data.token;
          otherUserId = res.body.data.user.id;
          done();
        });
    });
});

describe('UC-301 Create Meal', () => {
    // TC-301-1 Required fields are missing
    it('TC-301-1 Should return 400 if required fields are missing', (done) => {
        chai.request(app)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Spaghetti Bolognese",
                description: "Klassieke Italiaanse pasta met rijke tomatensaus en gehakt.",
                dateTime: "2026-05-10T18:00:00Z",
                maxAmountOfParticipants: 5,
                imageUrl: "https://spaghettifoto.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.contains('required');
                done();
            });
    });

    // TC-301-2 Not authenticated
    it('TC-301-2 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .post('/api/meal')
            .send({
                name: "Spaghetti Bolognese",
                description: "Klassieke Italiaanse pasta met rijke tomatensaus en gehakt.",
                dateTime: "2026-05-10T18:00:00Z",
                price: 12.50,
                maxAmountOfParticipants: 5,
                imageUrl: "https://spaghettifoto.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-301-3 Meal succesfully created
    it('TC-301-3 Should return 201 if meal succesfully created', (done) => {
        chai.request(app)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Spaghetti Bolognese",
                description: "Klassieke Italiaanse pasta met rijke tomatensaus en gehakt.",
                dateTime: "2026-05-10T18:00:00Z",
                price: 12.50,
                maxAmountOfParticipants: 5,
                imageUrl: "https://spaghettifoto.com"
            })
            .end((err, res) => {
                mealId = res.body.data.meal.id; // Store the meal ID for later tests
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.contains('Meal created successfully');
                expect(res.body.data).to.have.property('meal');
                expect(res.body.data.meal).to.include.keys('id', 'name', 'description', 'dateTime', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'maxAmountOfParticipants', 'imageUrl', 'allergenes', 'cook', 'participants');
                expect(res.body.data.meal.cook).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phoneNumber');
                done();
            });
    });
});

describe('UC-302 Update Meal', () => {
    // TC-302-1 Required fields are missing
    it('TC-302-1 Should return 400 if required fields are missing', (done) => {
        chai.request(app)
            .put(`/api/meal/${mealId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Spaghetti Bolognese",
                maxAmountOfParticipants: 5,
                imageUrl: "https://spaghettifoto2.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.contains('required');
                done();
            });
    });

    // TC-302-2 Not authenticated
    it('TC-302-2 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .put(`/api/meal/${mealId}`)
            .send({
                name: "Spaghetti Bolognese",
                maxAmountOfParticipants: 5,
                price: 12.50,
                imageUrl: "https://spaghettifoto2.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-302-3 Not the owner of the meal
    it('TC-302-3 Should return 403 if not the owner of the meal', (done) => {
        chai.request(app)
            .put(`/api/meal/${mealId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({
                name: "Spaghetti Bolognese",
                maxAmountOfParticipants: 5,
                price: 12.50,
                imageUrl: "https://spaghettifoto2.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('User is not the owner of this meal');
                done();
            });
    });

    // TC-302-4 Meal not found
    it('TC-302-4 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .put('/api/meal/999999')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Spaghetti Bolognese",
                maxAmountOfParticipants: 5,
                price: 12.50,
                imageUrl: "https://spaghettifoto2.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found');
                done();
            });
    });

    // TC-302-5 Meal successfully updated
    it('TC-302-5 Should return 200 if meal successfully updated', (done) => {
        chai.request(app)
            .put(`/api/meal/${mealId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Spaghetti Bolognese",
                maxAmountOfParticipants: 5,
                price: 12.50,
                imageUrl: "https://spaghettifoto2.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.contains('Meal updated successfully');
                expect(res.body.data).to.have.property('meal');
                expect(res.body.data.meal).to.include.keys('id', 'name', 'description', 'dateTime', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'maxAmountOfParticipants', 'imageUrl', 'allergenes', 'cook', 'participants');
                expect(res.body.data.meal.imageUrl).to.equal("https://spaghettifoto2.com");
                expect(res.body.data.meal.cook).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phoneNumber');
                done();
            });
    });
});

describe('UC-303 Get All Meals', () => {
    // TC-303-1 Retrieve all meals successfully
    it('TC-303-1 Should return 200 and all meals', (done) => {
        chai.request(app)
            .get('/api/meal')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals('Meals retrieved successfully');
                expect(res.body.data).to.have.property('meals');
                expect(res.body.data.meals).to.be.an('array').that.is.not.empty;
                expect(res.body.data.meals[0]).to.include.keys('id', 'name', 'description', 'dateTime', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'maxAmountOfParticipants', 'imageUrl', 'allergenes', 'cook', 'participants');
                expect(res.body.data.meals[0].cook).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phoneNumber');
                done();
            });
    });
});

describe('UC-304 Get Meal by ID', () => {
    // TC-304-1 Meal not found
    it('TC-304-1 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .get('/api/meal/999999')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found');
                done();
            });
    });

    // TC-304-2 Meal successfully found
    it('TC-304-2 Should return 200 if meal successfully found', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals('Meal retrieved successfully');
                expect(res.body.data).to.have.property('meal');
                expect(res.body.data.meal).to.include.keys('id', 'name', 'description', 'dateTime', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'maxAmountOfParticipants', 'imageUrl', 'allergenes', 'cook', 'participants');
                expect(res.body.data.meal.cook).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phoneNumber');
                done();
            });
    });
});

after((done) => { // After all tests, delete the user
    if (userId && token) {
        chai.request(app)
            .delete(`/api/user/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .end(() => {
                done();
            });
    } else {
        done();
    }
});

after((done) => { // After all tests, delete the user
    if (otherUserId && otherToken) {
        chai.request(app)
            .delete(`/api/user/${otherUserId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .end(() => {
                done();
            });
    } else {
        done();
    }
});