'use strict';

const Boom = require('boom');
const createDeviceSchema = require('./schemas/createDeviceSchema');

const handlers = require('./handlers');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'POST',
      path: '/api/devices',
      config: {
        validate: {
          payload: createDeviceSchema
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: handlers.createDevice
      }
    }
  ]);

  next();

};

exports.register.attribute = {
  name: 'devices',
  version: '2.0.1',
  description: 'Device plugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
