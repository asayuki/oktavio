'use strict';
const Code = require('code');
const Lab = require('lab');
const Mongoose = require('mongoose');
const server = require('../oktavio.js');
const lab = exports.lab = Lab.script();
const Device = require('../core/api/devices/model/device');

Mongoose.Promise = global.Promise;

let db = Mongoose.createConnection(process.env.MONGO_URL + process.env.MONGO_DB, {
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS
});

let testUser = {
  username: 'testuser',
  email: 'testuser@testmail.com',
  password: 'testpassword'
};

let testUserArtifact = null;
let createDeviceId = null;

lab.experiment('Devices', () => {

  lab.before((done) => {
    Device.remove({}, function (error) {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          username: testUser.username,
          password: testUser.password
        }
      }, (response) => {
        testUserArtifact = response.request.auth.artifacts.sid;

        done();
      });
    });
  });

  lab.test('Create device POST /api/devices', (done) => {
    let options = {
      method: 'POST',
      url: '/api/devices',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        name: 'Devicename',
        protocol: 'Deviceprotocol',
        unit_code: 1,
        unit_id: 2,
        state: false
      }
    };

    server.inject(options, (response) => {

      createDeviceId = response.result.deviceId;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.deviceId).to.be.an.object();
      done();

    });
  });

  lab.test('Create second device POST /api/devices', (done) => {
    let options = {
      method: 'POST',
      url: '/api/devices',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        name: 'Devicename #2',
        protocol: 'Deviceprotocol',
        unit_code: 2,
        unit_id: 3,
        state: true
      }
    };

    server.inject(options, (response) => {

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.deviceId).to.be.an.object();

      done();
    });
  });

  lab.test('Update Device PUT /api/devices', (done) => {
    let options = {
      method: 'PUT',
      url: '/api/devices',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        id: createDeviceId,
        state: true,
        name: 'Namedevice'
      }
    };

    server.inject(options, (response) => {

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.deviceUpdated).to.be.true();

      done();
    });
  });

  lab.test('Get Device GET /api/devices/{id}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/devices/' + createDeviceId,
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.device.name).to.equal('Namedevice');
      Code.expect(response.result.device.state).to.be.true();

      done();
    });
  });

  lab.test('Get Devices GET /api/devices', (done) => {
    let options = {
      method: 'GET',
      url: '/api/devices',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.devices).to.be.an.array();
      Code.expect(response.result.devices).to.have.length(2);

      done();
    });
  });

  lab.test('Remove Device DELETE /api/devices', (done) => {
    let options = {
      method: 'DELETE',
      url: '/api/devices',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        id: createDeviceId
      }
    };

    server.inject(options, (response) => {

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.deviceRemoved).to.be.true();

      done();
    });
  });

  /*
  lab.test('', (done) => {
    let options = {
      method: '',
      url: '',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {

      }
    };

    server.inject(options, (response) => {

      done();
    });
  });
  */
});
