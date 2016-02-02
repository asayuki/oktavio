'use strict';
const
  Joi         = require('joi'),
  handlers    = require('./users'),
  passwordHash = require('password-hash');

Joi.objectId = require('joi-objectid')(Joi);

exports.register = (plugin, options, next) => {

  plugin.expose('get', (req, res, callback) => {
    handlers.getUser(req, res, (data) => {
      return callback(data);
    });
  });

  plugin.expose('fetchNumberOfUsers', (mongodb, callback) => {
    let db = mongodb.db;
    db.collection('users').count((err, count) => {
      callback(count);
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
