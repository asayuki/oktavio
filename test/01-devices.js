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
        protocol: 'kaku_switch_old',
        unit_id: 1,
        unit_code: 1
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.device).to.be.an.object();

      fs.writeFile(__dirname + '/deviceid.txt', response.result.device._id, (err) => {
        if (err)
          throw err;
        deviceID = response.result.device._id;
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
        unit_id: 2
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.device).to.be.an.object();
      expect(response.result.device.unit_id).to.be.equal(2);
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
      expect(response.result.device.unit_code).to.equal(1);
      done();
    });
  });
});
