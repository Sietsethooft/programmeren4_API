process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const e = require('express');
logger = require('../src/util/Logger');

const expect = chai.expect;

const userEmail = 'j.klaasen@test.com';
const userPassword = 'ValidPassword1234';
let userId;
let token;

chai.use(chaiHttp);

before((done) => {
  chai.request(app)
    .post('/api/user')
    .send({ 
        firstName: 'Jan', 
        lastName: 'Klaasen', 
        street: '123 Main St', 
        city: 'Anytown', 
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
          logger.info(`Token: ${token}`);
          logger.info(`User ID: ${userId}`);
          done();
        });
    });
});

describe('UC-301 Create Meal', () => {
    // TC-301-1 Required fields are missing
    it('TC-301-1 Required fields are missing', (done) => {
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
    it('TC-301-2 Not authenticated', (done) => {
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
    it('TC-301-1 Required fields are missing', (done) => {
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
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.contains('Meal created successfully');
                expect(res.body.data).to.have.property('meal');
                expect(res.body.data.meal).to.include.keys('id', 'name', 'description', 'dateTime', 'isActive', 'isVega', 'isVegan', 'isToTakeHome', 'price', 'maxAmountOfParticipants', 'imageUrl', 'allergenes', 'cook', 'participants');
                done();
            });
    });
});


after((done) => {
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