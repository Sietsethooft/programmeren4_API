process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
logger = require('../src/util/Logger');

const expect = chai.expect;

chai.use(chaiHttp);

let token; // Variable to store the token for authenticated requests
let userId; // Variable to store the user ID for id requests

describe('UC-201 register', () => {
    // TC-201-1: Required field is missing
    it('TC-201-1: should return 400 if required field is missing', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({ firstName: 'Maria', lastName: 'Johnes' }) // missing emailAdress and password
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-201-2: Invalid email address
    it ('TC-201-2: should return 400 if email address is invalid', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({ 
                firstName: 'Maria', 
                lastName: 'Johnes', 
                street: '123 Main St', 
                city: 'Anytown', 
                emailAdress: 'invalidemail', // invalid email
                password: 'ValidPassword1',
                phonenumber: '1234567890'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-201-3: Invalid password
    it('TC-201-3: should return 400 if password is invalid', (done) => {
         chai.request(app)
            .post('/api/user')
            .send({ 
                firstName: 'Maria', 
                lastName: 'Johnes', 
                street: '123 Main St', 
                city: 'Anytown', 
                emailAdress: 'm.Johnes@test.com',
                password: 'notvalid', // invalid password
                phonenumber: '06-12345678'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-201-4: User already exists
        it('TC-201-4: should return 403 if user already exists', (done) => {
         chai.request(app)
            .post('/api/user')
            .send({ 
                firstName: 'Maria', 
                lastName: 'Johnes', 
                street: '123 Main St', 
                city: 'Anytown', 
                emailAdress: 'j.doe@server.com',
                password: 'ValidPassword1234',
                phonenumber: '06-12345678'
            })
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-201-5: User successfully registered
        it('TC-201-5: should return 201 and user data on succesfull register', (done) => {
         chai.request(app)
            .post('/api/user')
            .send({ 
                firstName: 'Maria', 
                lastName: 'Johnes', 
                street: '123 Main St', 
                city: 'Anytown', 
                emailAdress: 'm.johnes@test.com',
                password: 'ValidPassword1234',
                phonenumber: '06-12345678'
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'phonenumber');
                userId = res.body.data.id; // Store the user ID for future requests
                done();
            });
    });

});

describe('UC-101 log in', () => {
    // TC-101-1: Required field is missing
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

    // TC-101-2: Not valid password
    it('TC-101-2: should return 400 if password is invalid', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'm.Johnes@test.com', password: 'wrongpassword' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-101-3: User does not exist
    it('TC-101-3: should return 404 if user does not exist', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'nonexistent@server.com', password: 'ValidPassword1234' })
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                done();
            });
    });

    // TC-101-4: User successfully logged in and got token
    it('TC-101-4: should return 200 and user data with token on successful login', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ emailAdress: 'm.Johnes@test.com', password: 'ValidPassword1234' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('user');
                expect(res.body.data).to.have.property('token').that.is.a('string');
                expect(res.body.data.user).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'phonenumber');
                token = res.body.data.token; // Store the token for future requests
                done();
            });
    });
});