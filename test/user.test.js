process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const e = require('express');
logger = require('../src/util/Logger');

const expect = chai.expect;

chai.use(chaiHttp);

let token; // Variable to store the token for authenticated requests
let userId; // Variable to store the user ID for id requests
let userIdOtherPerson; // Variable to store another user's id for id requests

describe('UC-201 register', () => {
    // TC-201-1: Required field is missing
    it('TC-201-1: should return 400 if required field is missing', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({ firstName: 'Maria', lastName: 'Johnes' }) // missing emailAdress and password
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.contains('required');
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
                expect(res.body).to.have.property('message').that.equal('Validation error: EmailAdress is not in the correct format. An email address needs to follow the pattern: n.last@domain.com where lastname contains at least 2 characters.');
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
                emailAdress: 'm.johnes@test.com',
                password: 'notvalid', // invalid password
                phonenumber: '06-12345678'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Validation error: Password must be at least 8 characters long and include at least one uppercase letter and one number.');
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
                expect(res.body).to.have.property('message').that.equal('A user with this email address already exists.');
                done();
            });
    });

    // TC-201-5: User successfully registered
    //     it('TC-201-5: should return 201 and user data on succesfull register', (done) => {
    //      chai.request(app)
    //         .post('/api/user')
    //         .send({ 
    //             firstName: 'Maria', 
    //             lastName: 'Johnes', 
    //             street: '123 Main St', 
    //             city: 'Anytown', 
    //             emailAdress: 'm.johnes@test.com',
    //             password: 'ValidPassword1234',
    //             phonenumber: '06-12345678'
    //         })
    //         .end((err, res) => {
    //             expect(res).to.have.status(201);
    //             expect(res.body).to.have.property('data');
    //             expect(res.body).to.have.property('message').that.equal('User registered successfully');
    //             expect(res.body.data).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'phonenumber');
    //             done();
    //         });
    // });

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
                expect(res.body).to.have.property('message').that.equal('Email address and password are required.');
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
                expect(res.body).to.have.property('message').that.equal('Invalid password or email.');
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
                expect(res.body).to.have.property('message').that.equal('User not found.');
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
                expect(res.body).to.have.property('message').that.equal('Login successful.');
                expect(res.body.data).to.have.property('user');
                expect(res.body.data).to.have.property('token').that.is.a('string');
                expect(res.body.data.user).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'phonenumber');
                token = res.body.data.token; // Store the token for future requests
                done();
            });
    });
});

describe('UC-202 get all users', () => {
    // TC-202-1: get all users (minimal 2 users)
    it('TC-202-1: should return 200 and all users', (done) => {
        chai.request(app)
            .get('/api/user')
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('Users retrieved successfully');
                expect(res.body.data).to.have.property('users').that.is.an('array');
                expect(res.body.data.users.length).to.be.at.least(2); // Check if there are at least 2 users
                expect(res.body.data.users[0]).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phonenumber');
                userIdOtherPerson = res.body.data.users[0].id; // Store another user's email for later use
                done();
            });
    });

    // TC-202-2: get all users with invalid filter
    it('TC-202-2: should return 200 if filter is invalid', (done) => {
        chai.request(app)
            .get('/api/user?invalidFilter=123') // Invalid filter
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data')
                expect(res.body).to.have.property('message').that.equal('Users retrieved successfully');
                done();
            });
    });

    // TC-202-3: get all users with filter ‘isActive’=false
    it ('TC-202-3: should return 200 and users with isActive=false', (done) => {
        chai.request(app)
            .get('/api/user?isActive=false') // Filter for inactive users
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('Users retrieved successfully');
                expect(res.body.data).to.have.property('users').that.is.an('array');
                res.body.data.users.forEach(user => {
                    expect(user.isActive).to.equal(0); // Check if isActive is false (0)
                });
                expect(res.body.data.users.length).to.be.at.least(2); // Check if there are at least 2 users
                expect(res.body.data.users[0]).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phonenumber');
                done();
            });
    });

    // TC-202-4: get all users with filter ‘isActive’=true
    it ('TC-202-4: should return 200 and users with isActive=true', (done) => {
        chai.request(app)
            .get('/api/user?isActive=true') // Filter for active users
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('Users retrieved successfully');
                expect(res.body.data).to.have.property('users').that.is.an('array');
                res.body.data.users.forEach(user => {
                    expect(user.isActive).to.equal(1); // Check if isActive is true (1)
                });
                expect(res.body.data.users.length).to.be.at.least(2); // Check if there are at least 2 users
                expect(res.body.data.users[0]).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phonenumber');
                done();
            });
    });

    // TC-202-5: get all users with filter 'city=Amsterdam' and 'firstname=Maria'
    it ('TC-202-5: should return 200 and users with city=Amsterdam and firstname=Maria', (done) => {
        chai.request(app)
            .get('/api/user?city=Amsterdam&firstName=Maria') // Filter for users in Amsterdam with first name Maria
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('Users retrieved successfully');
                expect(res.body.data).to.have.property('users').that.is.an('array');
                res.body.data.users.forEach(user => {
                    expect(user.city).to.equal('Amsterdam'); // Check if city is Amsterdam
                    expect(user.firstName).to.equal('Maria'); // Check if first name is Maria
                });
                expect(res.body.data.users.length).to.be.at.least(2); // Check if there are at least 2 users
                expect(res.body.data.users[0]).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phonenumber');
                done();
            });
    });
});

describe('UC-203 get user by profile', () => {
    // TC-203-1: Get user profile without authentication
    it('TC-203-1: should return 401 if user is not authenticated', (done) => {
        chai.request(app)
            .get('/api/user/profile')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Access token is missing or invalid.');
                done();
            });
    });

    // TC-203-2: Get user profile with valid token
    it('TC-203-2: should return 200 and user profile data', (done) => {
        chai.request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                userId = res.body.data.id; // Store the user ID for future requests
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('User profile retrieved successfully');
                expect(res.body.data).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'phonenumber', 'meals');	
                done();
            });
    });
});

describe('UC-204 get user by id', () => {
    // TC-204-1: Get user by id without authentication
    it('TC-204-1: should return 401 if user is not authenticated', (done) => {
        chai.request(app)
            .get(`/api/user/${userId}`) // Use the stored userId from registration
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Access token is missing or invalid.');
                done();
            });
    });
    
    // TC-204-2: Get user by non-existing id
    it('TC-204-2: should return 404 if user does not exist', (done) => {
        chai.request(app)
            .get('/api/user/999949309') // invalid user ID
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('User not found');
                done();
            });
    });

    // TC-204-3: Get user by id with valid token
    it('TC-204-3: should return 200 and user data for valid user ID', (done) => {
        chai.request(app)
            .get(`/api/user/${userId}`) // Use the stored userId from registration
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('User retrieved successfully');
                expect(res.body.data).to.include.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'phonenumber', 'meals');
                done();
            });
    });
});

describe('UC-205 update user', () => {
    // TC-205-1: Emailadress field is missing
    it('TC-205-1: should return 400 if emailAdress field is missing', (done) => {
        chai.request(app)
            .put(`/api/user/${userId}`) // Use the stored userId from registration
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .send({ firstName: 'Maria', lastName: 'Johnes', phonenumber: '06-87654321' }) // missing emailAdress
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Validation error: EmailAdress is not in the correct format. An email address needs to follow the pattern: n.last@domain.com where lastname contains at least 2 characters.');
                done();
            });
    });

    // TC-205-2 User is not the owner
    it('TC-205-2: should return 403 if user is not the owner', (done) => {
        chai.request(app)
            .put(`/api/user/${userIdOtherPerson}`) // Use the stored userId from another user
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .send({ firstName: 'John', lastName: 'Doe', emailAdress: 'j.doe@outlook.com', phonenumber: '06-87654321' }) // Trying to update another user's profile
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('User is not the owner of this account');
                done();
            });
    });

    // TC-205-3: Phonenumber is not valid
    it('TC-205-3: should return 400 if phonenumber is not valid', (done) => {
        chai.request(app)
            .put(`/api/user/${userId}`) // Use the stored userId from registration
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .send({ firstName: 'Maria', lastName: 'Johnes', emailAdress: 'm.johnes@test.com', phonenumber: '08-87654321' }) // invalid phonenumber
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Validation error: Phonenumber must start with 06 and contain 10 digits.');
                done();
            });
    });
    
    // TC-205-4: User not found
    it ('TC-205-4: should return 404 if user does not exist', (done) => {
        chai.request(app)
            .put('/api/user/999949309') // invalid user ID
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .send({ firstName: 'Maria', lastName: 'Johnes', emailAdress: 'm.johnes@test.com'})
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('User not found');
                done();
            });
    });

    // TC-205-5: User not authenticated
    it('TC-205-5: should return 401 if user is not authenticated', (done) => {
        chai.request(app)
            .put(`/api/user/${userId}`) // Use the stored userId from registration
            .send({ firstName: 'Maria', lastName: 'Johnes', emailAdress: 'm.johnes@test.com'})
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('data').that.deep.equals({});
                expect(res.body).to.have.property('message').that.equal('Access token is missing or invalid.');
                done();
            })
    });

    // TC-205-6: User successfully updated
    it('TC-205-6: should return 200 and updated user data on successful update', (done) => {
        chai.request(app)
            .put(`/api/user/${userId}`) // Use the stored userId from registration
            .set('Authorization', `Bearer ${token}`) // Use the token for authentication
            .send({emailAdress: 'm.johnes@test.com', street: 'damstraat 1'})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('message').that.equal('User updated successfully');
                expect(res.body.data).to.include.keys('id','street','emailAdress');
                done();
            });
    });
});

// describe('UC-206 delete user', () => {

// });