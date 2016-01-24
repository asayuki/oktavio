'use strict';
const
  Joi = require('joi'),
  handlers = require('./login');

exports.register = (plugin, options, next) => {
  const cache = plugin.cache({
    cache: 'octavioCache',
    expiresIn: 60*60*24*365
  });

  plugin.app.cache = cache;

  plugin.bind({
    cache: plugin.app.cache
  });

  plugin.expose('getCache', () => { return cache; });

  // Setup session strategy
  plugin.auth.strategy('session', 'cookie', {
    password: process.env.SESSION_PRIVATE_KEY,
    cookie: 'octavio-session',
    redirectTo: '/',
    ttl: 60*60*24*30,
    isSecure: false,
    clearInvalid: true,
    keepAlive: true,
    validateFunc: (request, session, callback) => {
      cache.get(session.sid, (err, cached) => {
        if (err)
          return callback(err, false);

        if (!cached)
          return callback(null, false)

        return callback(null, true, cached.account);
      });
    }
  });

  // Setup JWT strategy
  plugin.auth.strategy('token', 'jwt', {
    key: process.env.SESSION_PRIVATE_KEY,
    validateFunc: (request, decodedToken, callback) => {
      let db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
      db.collection('users').findOne({_id: new ObjectID(decodedToken._id)}, {password: 0}, (err, doc) => {
        if (err)
          return callback(err, false, {});

        if (doc === null)
          return callback(null, false, {});

        return callback(null, true, doc);
      });
    }
  });

  plugin.route([
    {
      method: 'POST',
      path: '/api/session',
      config: {
        handler: handlers.session,
        tags: ['api'],
        validate: {
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            session: Joi.boolean().valid(true, false).required()
          }
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cookie': { redirectTo: false },
          'hapi-auth-jwt': { redirectTo: false },
          'hapi-swagger': { payloadType: 'form' }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/unsession',
      config: {
        handler: handlers.unsession,
        tags: ['api'],
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': { redirectTo: false },
          'hapi-swagger': { payloadType: 'form' }
        }
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'login',
  version: '1.0.0',
  description: 'Login coreplugin',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
