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
  server = require('../oktavio'),
  fs = require('fs');

let token = null,
  userId = null;

suite('Test devices', () => {

  /* Lets ensure server is started */
  before((done) => {
    let stopChecking, checking, checkAppstarted;

    fs.readFile(__dirname + '/testtoken.txt', (err, testtoken) => {
      if (err)
        throw err;

      token = testtoken.toString();
    });

    checkAppstarted = () => {
      if (process.env.APP_STARTED)
        done();
        stopChecking();
    };

    stopChecking = () => {
      clearInterval(checking);
    };

    checking = setInterval(() => { checkAppstarted(); }, 1000);

  });

  test('POST /api/users (create User)', (done) => {
    const options = {
      method: 'POST',
      url: '/api/users',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        'username': 'labtest',
        'password': 'labpassword',
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.userCreated).to.equal(true);
      done();
    });
  });

  test('POST /api/users (create same user again)', (done) => {
    const options = {
      method: 'POST',
      url: '/api/users',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {'username': 'labtest', 'password': 'labpassword'}
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(422);
      expect(response.result.status).to.equal(false);
      done();
    });
  });

  test('GET /api/users/{username*} (get User)', (done) => {
    const options = {
      method: 'GET',
      url: '/api/users/labtest',
      headers: {
        Authorization: 'Bearer ' + token
      }
    };
    server.inject(options, (response) => {
      userId = response.result.user._id;
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.an.object();
      expect(response.result.user.username).to.equal('labtest');
      done();
    });
  });

  test('PUT /api/users (update User)', (done) => {
    const options = {
      method: 'PUT',
      url: '/api/users',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {'userid': userId, 'password': 'labpassword2'}
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.userUpdated).to.equal(true);
      done();
    });
  });

  test('DELETE /api/users (remove User)', {timoeut: '4000'}, (done) => {
    const options = {
      method: 'DELETE',
      url: '/api/users',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {'userid': userId}
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.userRemoved).to.equal(true);
      done();
    });
  });
});
