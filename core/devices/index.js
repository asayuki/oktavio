'use strict';
const
  Joi = require('joi'),
  handlers = require('./devices');

exports.register = (plugin, options, next) => {
  plugin.route([
    {
      method: 'GET',
      path: '/api/devices',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'devices'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown()
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        state: {
          parse: true,
          failAction: 'ignore'
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          },
          'hapi-auth-jwt': {
            redirectTo: false
          },
          'hapi-swagger': {
            payloadType: 'json'
          }
        }
      }
    }
  ]);
  next();
};

exports.register.attributes = {
  name: 'devices',
  version: '1.0.1',
  description: 'Devices coremodule',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
