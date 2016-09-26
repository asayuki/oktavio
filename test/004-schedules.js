'use strict';
const Code = require('code');
const Lab = require('lab');
const Mongoose = require('mongoose');
const server = require('../oktavio.js');
const lab = exports.lab = Lab.script();
const Schedule = require('../core/api/schedules/model/schedule');

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
let createScheduleId = null;
let createScheduleModeId = null;
let testDevice = null;
let testMode = null;

lab.experiment('Schedules', () => {
  lab.before((done) => {
    Schedule.remove({}, function (error) {
      // First we need to login
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          username: testUser.username,
          password: testUser.password
        }
      }, (response) => {
        testUserArtifact = response.request.auth.artifacts.sid;

        // Then we need a device
        server.inject({
          method: 'GET',
          url: '/api/devices',
          credentials: testUser,
          artifacts: {
            sid: testUserArtifact
          }
        }, (deviceResponse) => {
          testDevice = deviceResponse.result.devices[0]._id;

          // Then we need a mode (but we haven't created that part of API yet)
          server.inject({
            method: 'GET',
            url: '/api/modes',
            credentials: testUser,
            artifacts: {
              sid: testUserArtifact
            }
          }, (modeResponse) => {
            //testMode = modeResponse.mode._id;

            done();
          });
        });
      });
    });
  });

  lab.test('Create schedule for Device POST /api/schedules', (done) => {
    let options = {
      method: 'POST',
      url: '/api/schedules',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        weekDay: 'all',
        time: 1800,
        type: 'device',
        typeId: testDevice,
        state: true
      }
    };

    server.inject(options, (response) => {
      createScheduleId = response.result.scheduleId;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.scheduleCreated).to.be.true();
      Code.expect(response.result.scheduleId).to.be.an.object();
      done();
    });
  });

  lab.test('Create schedule for Mode POST /api/schedules', (done) => {
    let options = {
      method: 'POST',
      url: '/api/schedules',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        weekDay: 'monday',
        time: 1800,
        type: 'mode',
        typeId: testMode
      }
    };

    server.inject(options, (response) => {
      createScheduleModeId = response.result.scheduleId;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.scheduleCreated).to.be.true();
      Code.expect(response.result.scheduleId).to.be.an.object();
      done();
    });
  });

  lab.test('Update schedule for Device POST /api/schedules', (done) => {
    let options = {
      method: 'PUT',
      url: '/api/schedules',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        time: 1345,
        state: false
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.scheduleUpdated).to.be.true();
      done();
    });
  });

  lab.test('Get schedule for Device GET /api/schedules/{id}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/schedules/' + createScheduleId,
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.schedule.time).to.equal(1345);
      Code.expect(response.result.schedule.state).to.be.false();
      done();
    });
  });

  lab.test('Get schedules GET /api/schedules', (done) => {
    let options = {
      method: 'GET',
      url: '/api/schedules',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.schedules).to.be.an.array();
      Code.expect(response.result.schedules).to.have.length(2);
      done();
    });
  });


  lab.test('Remove schedule of Device DELETE /api/schedules', (done) => {
    let options = {
      method: 'DELETE',
      url: '/api/schedules',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      },
      payload: {
        id: createScheduleId
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.scheduleRemoved).to.be.true();
      done();
    });
  });
});
