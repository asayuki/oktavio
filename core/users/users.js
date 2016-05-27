'use strict';
const
  bcrypt = require('bcrypt'),
  extend = require('util')._extend;

module.exports = {

  /**
   * Create user
   * @param {Object} request.payload
   * @param {String} request.payload.username - Username for the user
   * @param {String} request.payload.password - Password for the user
   * @return {Object} response
   * @return {Boolean} respone.userCreated - true / false
   */
  createUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        users = db.collection('users'),
        payload = request.payload;

      users.findOne({
        username: payload.username.toLowerCase()
      }, {password: 0}, (error, user) => {
        if (error) {
          return response({
            error: 'Database error.',
            userCreated: false
          }).code(500);
        }

        if (user !== null) {
          return response({
            error: 'Username already exists.',
            userCreated: false
          }).code(409);
        }

        bcrypt.hash(payload.password, 10, (error, hash) => {
          if (error) {
            return response({
              error: 'Could not create user.',
              userCreated: false
            }).code(500);
          }

          payload.password = hash;

          users.insert(payload, (error) => {
            if (error) {
              return response({
                error: 'Could not create user.',
                userCreated: false
              }).code(500);
            }

            return response({
              userCreated: true
            }).code(200);
          });
        });
      });
    } else {
      return response({
        error: 'Not authenticated'
      }).code(401);
    }
  },

  getUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let db = request.server.plugins['hapi-mongodb'].db;

      db.collection('users').findOne({username: request.params.username.toLowerCase()}, {password: 0}, (error, user) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (user === null) {
          return response({
            error: 'Could not find user.'
          }).code(404);
        }

        return response({
          user: user
        }).code(200);
      });
    } else {
      return response({
        error: 'Not authenticated'
      }).code(401);
    }
  },

  updateUser: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        users = db.collection('users'),
        payload = request.payload,
        updateUser = request.auth.credentials._id;

      console.log('payload:', payload);

      if (typeof payload.password !== 'undefined') {
        payload.password = bcrypt.hashSync(payload.password, 10);
      }

      if (typeof payload.id !== 'undefined') {
        updateUser = payload.id;
        delete payload.id;
      }

      users.findOne({
        _id: new ObjectID(updateUser)
      }, (error, user) => {
        console.log(extend(user, payload));

        return response({}).code(200);

      });

    } else {
      return response({
        error: 'Not authenticated'
      }).code(401);
    }
  },

  deleteUser: (request, response) => {

  }
};
