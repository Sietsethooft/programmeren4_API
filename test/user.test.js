const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

const expect = chai.expect;

chai.use(chaiHttp);

