'use strict';
const
  Joi = require('joi'),
  handlers = require('./login');

exports.register = (plugin, options, next) => {

  // Expire
  const expire = 1000 * 60 * 60 * 24 * 365;

  // Setup a cache that expires in one year
  const cache = plugin.cache({
    cache: 'oktavioCache',
    expiresIn: expire
  });

  // Bind cache to application
  plugin.app.cache = cache;
  plugin.bind({
    cache: plugin.app.cache
  });

  // Expose cache for other plugins
  plugin.expose('getCache', () => {
    return cache;
  });

  // Setup session & cookie strategy
  plugin.auth.strategy('session', 'cookie', {
    password: process.env.SESSION_PRIVATE_KEY,
    cookie: 'oktavio-session',
    redirectTo: '/',
    ttl: expire,
    isSecure: false,
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

  // Setup token strategy
  plugin.auth.strategy('token', 'jwt', {
    key: process.env.SESSION_PRIVATE_KEY,
    validateFunc: (request, token, callback) => {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

      db.collection('users').findOne({_id: new ObjectID(token._id)}, {password: 0}, (error, user) => {
        if (error) {
          return callback(error, false, {});
        }

        if (user === null) {
          return callback(null, false, {});
        }

        return callback(null, true, user);
      });
    }
  });

  // Setup some routes
  plugin.route([
    {
      method: 'POST',
      path: '/api/session',
      config: {
        handler: handlers.session,
        tags: ['api', 'session'],
        validate: {
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            token: Joi.boolean().valid(false, true)
          }
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          },
          'hapi-auth-jwt': {
            redirectTo: false
          },
          'hapi-swagger': {
            payloadType: 'form'
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/unsession',
      config: {
        handler: handlers.unsession,
        tags: ['api', 'session'],
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          },
          'hapi-auth-jwt': {
            redirectTo: false
          },
          'hapi-swagger': {
            payloadType: 'form'
          }
        }
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'login',
  version: '1.0.0',
  description: 'Login coreplugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
