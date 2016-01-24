'use strict';

process.env.APP_TESTING = true;

const
  code = require('code'),
  Lab = require('lab'),
  lab = exports.lab = Lab.script(),
  suite = lab.suite,
  test = lab.test,
  before = lab.before,
  expect = code.expect,
  server = require('../octavio'),
  fs = require('fs');

suite('Test login', () => {

  /* Lets ensure server is started */
  before((done) => {
    let stopChecking, checking, checkAppstarted;

    checkAppstarted = () => {
      if (process.env.APP_STARTED)
        done();
        stopChecking();
    };

    stopChecking = () => {
      clearInterval(checking);
    }

    checking = setInterval(() => { checkAppstarted(); }, 1000);

  });

  test('POST /api/session (wrong credentials)', (done) => {
    let options = {
      method: 'POST',
      url: '/api/session',
      payload: {
        username: 'wronguser',
        password: 'wrongpassword',
        session: false
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(403);
      expect(response.result.status).to.equal(false);
      expect(response.result.error).to.be.a.string();
      done();
    });
  });

  test('POST /api/session (session)', (done) => {
    let options = {
      method: 'POST',
      url: '/api/session',
      payload: {
        username: process.env.TEST_USER,
        password: process.env.TEST_PASSWORD,
        session: true
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.status).to.equal(true);
      done();
    });
  });

  test('POST /api/session (token)', (done) => {
    let options = {
      method: 'POST',
      url: '/api/session',
      payload: {
        username: process.env.TEST_USER,
        password: process.env.TEST_PASSWORD,
        session: false
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.status).to.equal(true);
      expect(response.result.token).to.be.a.string();
      fs.writeFile(__dirname + '/testtoken.txt', response.result.token, (err) => {
        if (err)
          throw err;
        done();
      });
    });
  });

  /*test('GET /api/unsession', (done) => {
    let options = {
      method: 'GET',
      url: '/api/unsession'
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.status).to.equal(true);
      done();
    });
  });*/
});
