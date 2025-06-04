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