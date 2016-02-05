'use strict';
const
  Joi         = require('joi'),
  handlers    = require('./users'),
  bcrypt      = require('bcrypt');

Joi.objectId = require('joi-objectid')(Joi);

exports.register = (plugin, options, next) => {

  plugin.expose('get', (req, res, callback) => {
    handlers.getUser(req, res, (data) => {
      return callback(data);
    });
  });

  plugin.expose('fetchNumberOfUsers', (mongodb, callback) => {
    let db = mongodb.db;
    db.collection('users').count({"username": {$ne: (process.env.TEST_USER !== '') ? process.env.TEST_USER : 'testuser'}}, (err, count) => {
      callback(count);
    });
  });

  plugin.expose('testUser', (mongodb, callback) => {
    let db = mongodb.db;
    db.collection('users').findOne({"username": process.env.TEST_USER}, (err, testuser) => {
      if (err)
        callback("Error while checking testuser");

      if (testuser === null) {
        bcrypt.hash(process.env.TEST_PASSWORD, 8, (err, hash) => {
          if (err)
            callback("Error while hasing password");

          db.collection('users').insert({"username": process.env.TEST_USER, "password": hash}, (err) => {
            if (err)
              callback("Error while creating testuser");

            callback(null);
          });
        });
      } else {
        callback(null);
      }
    });
  });

  plugin.expose('createUser', (mongodb, payload, callback) => {
    let db = mongodb.db,
      users = db.collection('users');

    payload.password = passwordHash.generate(payload.password);
    users.insert(payload, (err) => {
      if (err)
        return callback('Database error');

      return callback(null);
    });
  });

  plugin.route([
    {
      method: 'GET',
      path: '/api/users/{username}',
      config: {
        handler: handlers.getUser,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          params: {
            username: Joi.string().required()
          }
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
          'hapi-auth-jwt': {redirectTo: false},
          'hapi-swagger': {payloadType: 'form'}
        }
      }
    },
    {
      method: 'POST',
      path: '/api/users',
      config: {
        handler: handlers.createUser,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().required()
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
          'hapi-auth-jwt': {redirectTo: false},
          'hapi-swagger': {payloadType: 'form'}
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/users',
      config: {
        handler: handlers.updateUser,
        tags: ['api'],
        description: 'This only updates the password for the logged in person right now. Use with caution UserID it not in use atm',
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            userid: Joi.objectId(),
            password: Joi.string()
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
          'hapi-auth-jwt': {redirectTo: false},
          'hapi-swagger': {payloadType: 'form'}
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/users',
      config: {
        handler: handlers.removeUser,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            userid: Joi.string().required()
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
          'hapi-auth-jwt': {redirectTo: false},
          'hapi-swagger': {payloadType: 'form'}
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  'name': 'users',
  'version': '1.0.0',
  'description': 'users plugin',
  'main': 'index.js',
  'author': 'neme <neme@whispered.se>',
  'license': 'MIT'
};
