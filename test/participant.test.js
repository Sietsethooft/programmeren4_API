process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const e = require('express');
logger = require('../src/util/Logger');

const expect = chai.expect;

let token; // Variable to store the token for authenticated requests
let mealId; // Variable to store the meal ID for participant tests
let userId; // Variable to store the user ID for cleanup after tests

const userEmail = 'p.test@testcase.nl';
const userPassword = 'Testpassword1234';

const otherUserEmail = 'o.test@testcase.nl';
const otherUserPassword = 'OtherTestpassword1234';
let otherToken;
let otherUserId;

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
        firstName: 'Jan', 
        lastName: 'Klaasen', 
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

before((done) => {
    // Create a meal to use in participant tests
    chai.request(app)
        .post('/api/meal')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "Spaghetti Bolognese",
            description: "Klassieke Italiaanse pasta met rijke tomatensaus en gehakt.",
            dateTime: "2026-05-10 18:00:00",
            maxAmountOfParticipants: 1,
            imageUrl: "https://spaghettifoto.com",
            price: 10.00
        })
        .end((err, res) => {
            mealId = res.body.data.meal.id; // Store the meal ID for later use
            done();
        });
});

describe('UC-401: Create Participant', () => {
    // TC-401-1: Not authenticated
    it('TC-401-1 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .post(`/api/meal/${mealId}/participate`)
            .send({ userId: userId })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-401-2: Meal not found
    it('TC-401-2 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .post('/api/meal/999999/participate') // Non-existing meal ID
            .set('Authorization', `Bearer ${token}`)
            .send({ userId: userId })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found.');
                done();
            });
    });

    // TC-401-3: Successfully signed up for meal
    it('TC-401-3 Should return 200 when successfully signed up for meal', (done) => {
        chai.request(app)
            .post(`/api/meal/${mealId}/participate`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals(`User with ID ${userId} has signed up for meal with ID ${mealId}`);
                expect(res.body.data).to.have.property('participant');
                expect(res.body.data.participant).to.have.all.keys('mealId', 'userId');
                expect(res.body.data.participant.mealId).to.equal(mealId);
                expect(res.body.data.participant.userId).to.equal(userId);
                done();
            });
    });

    // TC-401-4: Meal has reached maximum number of participants
    it('TC-401-4 Should return 200 if meal has reached maximum number of participants', (done) => {
        chai.request(app)
            .post(`/api/meal/${mealId}/participate`)
            .set('Authorization', `Bearer ${otherToken}`) // Use other user to test
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal has reached maximum number of participants.');
                done();
            });
    });
});

describe('UC-402: Delete Participant', () => {
    // TC-402-1: Not authenticated

    // TC-402-2: Meal not found

    // TC-402-3: User is not a participant of this meal

    // TC-402-4: Successfully deleted participant
});

after((done) => {
    // Clean up: Delete the created meal first, then the user
    chai.request(app)
        .delete(`/api/meal/${mealId}`)
        .set('Authorization', `Bearer ${token}`)
        .end(() => {
            chai.request(app)
                .delete(`/api/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .end(() => {
                    chai.request(app)
                        .delete(`/api/user/${otherUserId}`)
                        .set('Authorization', `Bearer ${otherToken}`)
                        .end(() => {
                            done();
                        });
                });
        });
});