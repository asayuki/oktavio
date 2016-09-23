'use strict';

const Boom = require('boom');
const loginUserSchema = require('./schemas/loginUserSchema');
const createUserSchema = require('./schemas/createUserSchema');
const updateUserSchema = require('./schemas/updateUserSchema');
const getUserSchema = require('./schemas/getUserSchema');
const deleteUserSchema = require('./schemas/deleteUserSchema');
const handlers = require('./handlers');
const userFunctions = require('./utils/userFunctions');
const verifyCredentials = userFunctions.verifyCredentials;
const verifyUniqueUser = userFunctions.verifyUniqueUser;
const verifyUserExists = userFunctions.verifyUserExists;

exports.register = (server, options, next) => {
  const cache = server.cache({
    cache: 'oktavioCache',
    expiresIn: 2147483647
  });
  server.app.cache = cache;
  server.bind({
    cache: server.app.cache
  });

  // Settings up session-strategy
  server.auth.strategy('session', 'cookie', {
    password: process.env.COOKIE_HASH,
    cookie: process.env.COOKIE_NAME,
    redirectTo: '/',
    ttl: 2147483647,
    isSecure: (process.env.PRODUCTION) ? true : false,
    clearInvalid: true,
    keepAlive: true,
    validateFunc: (request, session, callback) => {
      cache.get(session.sid, (error, cached) => {
        if (error) {
          return callback(error, false);
        }

        if (!cached) {
          return callback(null, false);
        }

        return callback(null, true, cached.account);
      });
    }
  });

  // Expose getUser
  server.expose('getUser', handlers.getUser);
  server.expose('cache', cache);

  server.route([
    {
      method: 'POST',
      path: '/api/users/login',
      config: {
        validate: {
          payload: loginUserSchema
        },
        pre: [
          {
            method: verifyCredentials,
            assign: 'user'
          }
        ],
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.loginUser
      }
    },
    {
      method: 'GET',
      path: '/api/users/logout',
      config: {
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.logoutUser
      }
    },
    {
      method: 'POST',
      path: '/api/users',
      config: {
        validate: {
          payload: createUserSchema
        },
        pre: [
          {
            method: verifyUniqueUser,
          }
        ],
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.createUser
      }
    },
    {
      method: 'PUT',
      path: '/api/users',
      config: {
        validate: {
          payload: updateUserSchema
        },
        pre: [
          {
            method: verifyUniqueUser,
          }
        ],
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.updateUser
      }
    },
    {
      method: 'GET',
      path: '/api/users/{user}',
      config: {
        validate: {
          params: {
            user: getUserSchema
          }
        },
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.getUser
      }
    },
    {
      method: 'GET',
      path: '/api/users',
      config: {
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.getUsers
      }
    },
    {
      method: 'DELETE',
      path: '/api/users',
      config: {
        validate: {
          payload: deleteUserSchema
        },
        pre: [
          {
            method: verifyUserExists,
          }
        ],
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.deleteUser
      }
    }
  ]);

  next();

};


exports.register.attributes = {
  name: 'users',
  version: '1.0.0',
  description: 'User API',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  licence: 'MIT'
};
