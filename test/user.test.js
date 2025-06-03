process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

const expect = chai.expect;

chai.use(chaiHttp);

let token; // Variable to store the token for authenticated requests

describe('UC-101 Inloggen', () => {
    // TC-101-1: Verplicht veld ontbreekt
    it('TC-101-1: should return 400 if required field is missing', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: '' }) // missing password
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-101-2: Niet-valide wachtwoord
    it('TC-101-2: should return 400 if password is invalid', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'j.doe@server.com', password: 'wrongpassword' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-101-3: Gebruiker bestaat niet
    it('TC-101-3: should return 404 if user does not exist', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'nonexistent@server.com', password: 'SomePassword1' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-101-4: Gebruiker succesvol ingelogd
    it('TC-101-4: should return 200 and user data with token on successful login', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'j.doe@server.com', password: 'secret' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('user');
                expect(res.body.data).to.have.property('token').that.is.a('string');
                expect(res.body.data.user).to.include.keys('id', 'firstName', 'lastName', 'emailAdress');
                token = res.body.data.token; // Store the token for future requests
                done();
            });
    });
});