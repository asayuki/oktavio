'use strict';

const Boom = require('boom');
const createDeviceSchema = require('./schemas/createDeviceSchema');
const getDeviceSchema = require('./schemas/getDeviceSchema');
const updateDeviceSchema = require('./schemas/updateDeviceSchema');
const deleteDeviceSchema = require('./schemas/deleteDeviceSchema');
const userFunctions = require('../users/utils/userFunctions');
const handlers = require('./handlers');
const exposes = require('./exposes');

const isLoggedIn = userFunctions.isLoggedIn;

exports.register = (server, options, next) => {

  server.expose('activate', exposes.activate);
  server.expose('deactivate', exposes.deactivate);

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
      path: '/api/devices/{id}/activate',
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
        handler: handlers.activateDevice
      }
    },
    {
      method: 'POST',
      path: '/api/devices/{id}/deactivate',
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
        handler: handlers.deactivateDevice
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
    },
    {
      method: 'DELETE',
      path: '/api/devices',
      config: {
        validate: {
          payload: deleteDeviceSchema
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
        handler: handlers.deleteDevice
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
