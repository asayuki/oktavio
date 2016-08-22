'use strict';

const code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const suite = lab.suite;
const test = lab.test;
const before = lab.before;
const expect = code.expect;
const server = require('../oktavio');

suite('Test login', () => {

  /* Lets ensure server is started */
  before((done) => {
    let stopChecking, checking, checkAppstarted;

    checkAppstarted = () => {
      if (process.env.APP_STARTED) {
        done();
        stopChecking();
      }
    };

    stopChecking = () => {
      clearInterval(checking);
    };

    checking = setInterval(() => { checkAppstarted(); }, 1000);

  });

  test('Login user with token', (done) => {

    let options = {
      method: 'POST',
      url: '/api/users/login',
      payload: {
        username: process.env.TEST_USER,
        password: process.env.TEST_PASSWORD,
        token: true
      }
    };

    server.inject(options, (response) => {

      expect(response.statusCode).to.equal(200);
      expect(response.result.token).to.be.a.string();

      done();
    });

  });

});
