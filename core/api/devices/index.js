'use strict';

const Boom = require('boom');
const createDeviceSchema = require('./schemas/createDeviceSchema');
const userFunctions = require('../users/utils/userFunctions');
const handlers = require('./handlers');

const isLoggedIn = userFunctions.isLoggedIn;

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'GET',
      path: '/api/devices',
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
        handler: handlers.getDevices
      }
    },
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
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.createDevice
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'devices',
  version: '2.0.1',
  description: 'Device plugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
