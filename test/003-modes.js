'use strict';
const Code = require('code');
const Lab = require('lab');
const Mongoose = require('mongoose');
const server = require('../oktavio.js');
const lab = exports.lab = Lab.script();
const Mode = require('../core/api/modes/model/mode');

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
let createModeId = null;
let testDevice = null;

lab.experiment('Modes', () => {
  lab.before((done) => {
    Mode.remove({}, function (error) {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          username: testUser.username,
          password: testUser.password
        }
      }, (response) => {
        testUserArtifact = response.request.auth.artifacts.sid;

        // We need a device to stuff into the mode
        server.inject({
          method: 'GET',
          url: '/api/devices',
          credentials: testUser,
          artifacts: {
            sid: testUserArtifact
          }
        }, (deviceResponse) => {
          testDevice = deviceResponse.result.devices[0]._id;

          done();
        });
      });
    });
  });

  lab.test('Create mode POST /api/modes', (done) => {
    let options = {
      method: 'POST',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        name: 'My mode',
        devices: [{
          id: testDevice,
          state: true
        }]
      }
    };

    server.inject(options, (response) => {

      console.log(response.result);

      createModeId = response.result.modeId;
      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.modeId).to.be.an.object();
      done();
    });
  });

  lab.test('Update mode PUT /api/modes', (done) => {
    let options = {
      method: 'PUT',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        id: createModeId,
        name: 'New name'
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.modeUpdated).to.be.true();
      done();
    });
  });

  lab.test('Get mode after update GET /api/modes/{id}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.mode.name).to.equal('New name');
      done();
    });
  });

  lab.test('Activate mode POST /api/modes/{id}/activate', (done) => {
    let options = {
      method: 'POST',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.modeActivated).to.be.true();
      done();
    });
  });

  lab.test('Get mode after activation GET /api/modes/{id}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.devices[0].state).to.be.true();
      done();
    });
  });

  lab.test('Delete mode DELETE /api/modes', (done) => {
    let options = {
      method: 'DELETE',
      url: '/api/modes',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        id: createModeId
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.modeRemoved).to.be.true();
      done();
    });
  });
});
