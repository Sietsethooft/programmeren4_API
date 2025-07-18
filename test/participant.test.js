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

describe('UC-403: Get Participants', () => {
    // TC-403-1: Not authenticated
    it('TC-403-1 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-403-2: Meal not found
    it('TC-403-2 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .get('/api/meal/999999/participants') // Non-existing meal ID
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found.');
                done();
            });
    });

    // TC-403-3: Not the owner of the meal
    it('TC-403-3 Should return 403 if not the owner of the meal', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants`)
            .set('Authorization', `Bearer ${otherToken}`) // Use other user to test
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('You are not the owner of this meal.');
                done();
            });
    });

    // TC-403-4: Successfully fetched participants
    it('TC-403-4 Should return 200 when successfully fetched participants', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals('Participants fetched successfully.');
                expect(res.body.data).to.have.property('participants').that.is.an('array').with.length.greaterThan(0);
               
                res.body.data.participants.forEach(element => {
                    expect(element).to.have.all.keys('id', 'firstName', 'lastName', 'emailAdress', 'phonenumber', 'isActive', 'street', 'city');
                });

                done();
            });
    });
});

describe('UC-404: Get Participant by ID', () => {
    // TC-404-1: Not authenticated
    it('TC-404-1 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants/${userId}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-404-2: Meal not found
    it('TC-404-2 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .get('/api/meal/999999/participants/1') // Non-existing meal ID
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found.');
                done();
            });
    });

    // TC-404-3: Not the owner of the meal
    it('TC-404-3 Should return 403 if not the owner of the meal', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants/${userId}`)
            .set('Authorization', `Bearer ${otherToken}`) // Use other user to test
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('You are not the owner of this meal.');
                done();
            });
    });

    // TC-404-4: Participant not found
    it('TC-404-4 Should return 404 if participant not found', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants/999999`) // Non-existing participant ID
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Participant not found.');
                done();
            });
    });

    // TC-404-5: Successfully fetched participant
    it('TC-404-5 Should return 200 when successfully fetched participant', (done) => {
        chai.request(app)
            .get(`/api/meal/${mealId}/participants/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals('Participant fetched successfully.');
                expect(res.body.data).to.have.property('participant');
                expect(res.body.data.participant).to.have.all.keys('id', 'firstName', 'lastName', 'emailAdress', 'phonenumber', 'isActive', 'street', 'city');
                done();
            });
    });
});

describe('UC-402: Delete Participant', () => { // It is not between the 401 and 403, because otherwise other tests will fail.
    // TC-402-1: Not authenticated
    it('TC-402-1 Should return 401 if not authenticated', (done) => {
        chai.request(app)
            .delete(`/api/meal/${mealId}/participate`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Access token is missing or invalid.');
                done();
            });
    });

    // TC-402-2: Meal not found
    it('TC-402-2 Should return 404 if meal not found', (done) => {
        chai.request(app)
            .delete('/api/meal/999999/participate') // Non-existing meal ID
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('Meal not found.');
                done();
            });
    });

    // TC-402-3: User is not a participant of this meal
    it('TC-402-3 Should return 404 if user is not a participant of this meal', (done) => {
        chai.request(app)
            .delete(`/api/meal/${mealId}/participate`)
            .set('Authorization', `Bearer ${otherToken}`) // Use other user to test
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equals('User is not a participant of this meal.');
                done();
            });
    });

    // TC-402-4: Successfully deleted participant
    it('TC-402-4 Should return 200 when successfully unsubscribed from meal', (done) => {
        chai.request(app)
            .delete(`/api/meal/${mealId}/participate`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equals(`User with ID ${userId} has unsubscribed from meal with ID ${mealId}`);
                expect(res.body.data).to.have.property('participant');
                expect(res.body.data.participant).to.have.all.keys('mealId', 'userId');
                expect(res.body.data.participant.mealId).to.equal(mealId);
                expect(res.body.data.participant.userId).to.equal(userId);
                done();
            });
    });
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