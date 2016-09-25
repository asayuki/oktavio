'use strict';

const Boom = require('boom');
const createDeviceSchema = require('./schemas/createDeviceSchema');
const getDeviceSchema = require('./schemas/getDeviceSchema');
const updateDeviceSchema = require('./schemas/updateDeviceSchema');
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
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.getDevices
      }
    },
    {
      method: 'GET',
      path: '/api/devices/{id}',
      config: {
        validate: {
          params: getDeviceSchema
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
        handler: handlers.getDevice
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
    },
    {
      method: 'PUT',
      path: '/api/devices',
      config: {
        validate: {
          payload: updateDeviceSchema
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
        handler: handlers.updateDevice
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
