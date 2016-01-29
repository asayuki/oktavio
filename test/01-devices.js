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
    deviceID = null;

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

  test('GET /api/devices', (done) => {
    const options = {
      method: 'GET',
      url: '/api/devices',
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.devices).to.be.an.array();
      done();
    });
  });

  test('POST /api/devices', (done) => {
    const options = {
      method: 'POST',
      url: '/api/devices',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        name: 'Testdevice',
        device: {
          protocol: 'kaku_switch_old',
          id: 1,
          unit: 1
        }
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.deviceID).to.be.an.object();

      fs.writeFile(__dirname + '/deviceid.txt', response.result.deviceID, (err) => {
        if (err)
          throw err;
        deviceID = response.result.deviceID;
        done();
      });

    });
  });

  test('PUT /api/devices', (done) => {
    const options = {
      method: 'PUT',
      url: '/api/devices',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: deviceID,
        device: {
          id: 2
        }
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.deviceUpdated).to.equal(true);
      done();
    });
  });

  test('GET /api/devices/[DEVICE_ID]', (done) => {
    const options = {
      method: 'GET',
      url: '/api/devices/' + deviceID,
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.device.id).to.equal(2);
      done();
    });
  });
});
