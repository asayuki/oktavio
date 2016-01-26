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

let token = null,
    deviceID = null,
    modeID = null;

suite('Test devices', () => {

  /* Lets ensure server is started */
  before((done) => {
    let stopChecking, checking, checkAppstarted;

    fs.readFile(__dirname + '/testtoken.txt', (err, testtoken) => {
      if (err)
        throw err;

      token = testtoken.toString();
    });

    fs.readFile(__dirname + '/deviceid.txt', (err, deviceid) => {
      if (err)
        throw err;

      deviceID = deviceid.toString();
    });

    fs.readFile(__dirname + '/modeid.txt', (err, modeid) => {
      if (err)
        throw err;

      modeID = modeid.toString();
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

  test('DELETE /api/devices', (done) => {
    const options = {
      method: 'DELETE',
      url: '/api/devices',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: deviceID
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.deviceRemoved).to.equal(true);
      done();
    });
  });

  test('DELETE /api/modes', (done) => {
    const options = {
      method: 'DELETE',
      url: '/api/modes',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: modeID
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.modeRemoved).to.equal(true);
      done();
    });
  });

});
