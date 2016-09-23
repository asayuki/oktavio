'use strict';
const Code = require('code');
const Lab = require('lab');
const Bcrypt = require('bcrypt');
const Mongoose = require('mongoose');
const server = require('../oktavio.js');
const lab = exports.lab = Lab.script();
const User = require('../core/api/users/model/user');
const createUserSchema = require('../core/api/users/schemas/createUserSchema');

Mongoose.Promise = global.Promise;

let db = Mongoose.createConnection(process.env.MONGO_URL + process.env.MONGO_DB, {
  user: (process.env.MONGO_USER) ? process.env.MONGO_USER : '',
  pass: (process.env.MONGO_PASS) ? process.env.MONGO_PASS : ''
});

let testUser = {
  username: 'testuser',
  email: 'testuser@testmail.com',
  password: 'testpassword'
};

let testUserArtifact = null;
let createUserId = null;

// Hash
function hashPassword(password, cb) {
  Bcrypt.genSalt(10, (err, salt) => {
    Bcrypt.hash(password, salt, (err, hash) => {
      return cb(err, hash);
    });
  });
}

lab.experiment('Users', () => {
  lab.before((done) => {
    User.remove({}, function (error) {
      let user = new User();
      user.email = testUser.email;
      user.username = testUser.username;
      user.admin = false;

      hashPassword('testpassword', (err, hash) => {
        if (err) {
          throw err;
        }

        user.password = hash;

        user.save((err, user) => {
          if (err) {
            throw err;
          }

          done();
        });
      });
    });
  });

  lab.test('Login User (user) POST /api/users/login', (done) => {
    let options = {
      method: 'POST',
      url: '/api/users/login',
      payload: {
        username: testUser.username,
        password: testUser.password
      }
    };

    server.inject(options, (response) => {

      testUserArtifact = response.request.auth.artifacts.sid;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.loggedIn).to.be.true();
      done();
    });
  });

  lab.test('Create User POST /api/users', (done) => {
    let options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        username: 'newuser',
        email: 'newuser@testmail.com',
        password: 'testpassword'
      },
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      createUserId = response.result.userId;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(response.result.userCreated).to.be.true();
      Code.expect(response.result.userId).to.be.an.object();
      done();
    });
  });

  lab.test('Update User PUT /api/users', (done) => {
    let options = {
      method: 'PUT',
      url: '/api/users',
      payload: {
        id: createUserId,
        username: 'newuserupdate',
        password: 'testuserupdate',
        email: 'testuserupdate@testmail.com'
      },
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.userUpdated).to.be.true();
      done();
    });
  });

  lab.test('Get User with username GET /api/users/{username}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/users/newuserupdate',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.user).to.be.a.object();
      Code.expect(response.result.user.username).to.equal('newuserupdate');
      done();
    });
  });
  lab.test('Get User with email GET /api/users/{username}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/users/testuserupdate@testmail.com',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.user).to.be.a.object();
      Code.expect(response.result.user.username).to.equal('newuserupdate');
      done();
    });
  });

  lab.test('Remove User DELETE /api/users', (done) => {
    let options = {
      method: 'DELETE',
      url: '/api/users',
      payload: {
        id: createUserId
      },
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.userRemoved).to.be.true();
      done();
    });
  });

  lab.test('Fail Get User GET /api/users/{username}', (done) => {
    let options = {
      method: 'GET',
      url: '/api/users/newuserupdate',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('Logout User (user) GET /api/users/logout', (done) => {
    let options = {
      method: 'GET',
      url: '/api/users/logout',
      credentials: testUser,
      artifacts: {
        sid: testUserArtifact
      }
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result.loggedOut).to.be.true();
      done();
    });
  });
});
