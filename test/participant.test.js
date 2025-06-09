process.env.DB_DATABASE = 'share-a-meal-testdb';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const e = require('express');
logger = require('../src/util/Logger');

const expect = chai.expect;

chai.use(chaiHttp);

describe('UC-401: Create Participant', () => {
    // TC-401-1: Not authenticated

    // TC-401-2: Meal not found

    // TC-401-3: Successfully signed up for meal

    // TC-401-4: Meal has reached maximum number of participants
});

describe('UC-402: Delete Participant', () => {
    // TC-402-1: Not authenticated

    // TC-402-2: Meal not found

    // TC-402-3: User is not a participant of this meal

    // TC-402-4: Successfully deleted participant
});