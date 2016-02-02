'use strict';
const
  passwordHash  = require('password-hash');

const handlers = {
  getUser: (request, response, cb) => {
    if (request.auth.isAuthenticated) {
      let db = request.server.plugins['hapi-mongodb'].db,
        responseData = null;
      db.collection('users').findOne({'username': request.params.username}, {'password': 0}, (err, doc) => {
        if (err) { return response({status: false, error: 'Database error'}).code(500); }
        if (doc === null) {
          responseData = {status: false, error: 'Could not find user'};
          return (typeof cb !== 'undefined') ? cb(responseData) : response(responseData).code(404);
        }
        responseData = {user: doc};
        return response(responseData).code(200);
      });
    } else {
      return response({status: false});
    }
  },

  createUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let db = request.server.plugins['hapi-mongodb'].db,
        users = db.collection('users'),
        payload = request.payload;

      payload.password = passwordHash.generate(payload.password);
      users.findOne({'username': payload.username}, (err, doc) => {
        if (err) { return response({status: false, error: 'Database error'}).code(500); }
        if (doc !== null) { return response({status: false, error: 'Username already exists'}).code(422); }
        users.insert(payload, (err) => {
          if (err) { return response({status: false, error: 'Database error'}).code(500); }
          return response({status: true, userCreated: true}).code(200);
        });
      });
    } else {
      return response({status: false, isAuthenticated: false}).code(401);
    }
  },

  updateUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let db = request.server.plugins['hapi-mongodb'].db,
        users = db.collection('users'),
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        payload = request.payload;

      let setUserobject = function (data) {
        var userObj = {};
        if (typeof data.password !== 'undefined') {
          userObj.password = passwordHash.generate(data.password);
        }
        return userObj;
      };

      let userUpdate = null;
      /*if (typeof payload.userid !== 'undefined') {
        userUpdate = setUserobject(payload);
        users.update({_id: new ObjectID(payload.userid)}, {$set: userUpdate}, (err) => {
          if (err) { return response({status: false, error: 'Database error'}).code(500); }
          return response({status: true, userUpdated: true}).code(200);
        });
      } else {*/
        userUpdate = setUserobject(payload);
        users.update({_id: new ObjectID(request.auth.credentials._id)}, {$set: userUpdate}, (err) => {
          if (err) { return response({status: false, error: 'Database error'}).code(500); }
          return response({status: true, userUpdated: true});
        });
      /*}*/

    } else {
      return response({status: false, isAuthenticated: false}).code(401);
    }
  },

  removeUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let db = request.server.plugins['hapi-mongodb'].db,
        users = db.collection('users'),
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        payload = request.payload;

      users.findOne({_id: new ObjectID(payload.userid)}, (err, doc) => {
        if (err) { return response({status: false, error: 'Database error'}).code(500); }
        if (doc !== null) {
          users.remove({_id: new ObjectID(payload.userid)}, (err) => {
            if (err) { return response({status: false, error: 'Database error'}).code(500); }
            return response({status: true, userRemoved: true}).code(200);
          });
        } else {
          return response({status: false, error: 'User does not exist'});
        }
      });

    } else {
      return response({status: false, isAuthenticated: false}).code(401);
    }
  }
};

module.exports = handlers;
