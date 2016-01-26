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

suite('Test modes', () => {

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

  test('GET /api/modes', (done) => {
    const options = {
      method: 'GET',
      url: '/api/modes',
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.modes).to.be.an.array();
      done();
    });
  });

  test('POST /api/modes', (done) => {
    const options = {
      method: 'POST',
      url: '/api/modes',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        name: 'Testmode',
        icon: 'flower',
        devices: [
          {
            id: deviceID,
            on: true
          }
        ]
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.modeID).to.be.an.object();

      fs.writeFile(__dirname + '/modeid.txt', response.result.modeID, (err) => {
        if (err)
          throw err;
        modeID = response.result.modeID;
        done();
      });

    });
  });

  test('PUT /api/modes', (done) => {
    const options = {
      method: 'PUT',
      url: '/api/modes',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: modeID,
        name: 'Testmode updated',
        icon: 'power',
        devices: []
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.modeUpdated).to.equal(true);
      done();
    });
  });

  test('POST /api/modes/addDevice', (done) => {
    const options = {
      method: 'POST',
      url: '/api/modes/addDevice',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: modeID,
        device: {
          id: deviceID,
          on: true
        }
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.deviceAdded).to.equal(true);
      done();
    });
  });

  test('GET /api/modes/[MODE_ID]', (done) => {
    const options = {
      method: 'GET',
      url: '/api/modes/' + modeID,
      headers: {
        Authorization: 'Bearer ' + token
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.name).to.equal('Testmode updated');
      expect(response.result.icon).to.equal('power');
      expect(response.result.devices.length).to.be.above(0);
      done();
    });
  });

  test('DELETE /api/modes/removeDevice', (done) => {
    const options = {
      method: 'POST',
      url: '/api/modes/removeDevice',
      headers: {
        Authorization: 'Bearer ' + token
      },
      payload: {
        id: modeID,
        deviceId: deviceID
      }
    };

    server.inject(options, (response) => {
      expect(response.statusCode).to.equal(200);
      expect(response.result.deviceRemoved).to.equal(true);
      done();
    });
  });



});
