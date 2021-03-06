'use strict';

const Boom = require('boom');
const createModeSchema = require('./schemas/createModeSchema');
const updateModeSchema = require('./schemas/updateModeSchema');
const getModeSchema = require('./schemas/getModeSchema');
const userFunctions = require('../users/utils/userFunctions');
const handlers = require('./handlers');
const exposes = require('./exposes');

const isLoggedIn = userFunctions.isLoggedIn;

exports.register = (server, options, next) => {

  server.expose('activate', exposes.activate);

  server.route([
    {
      method: 'POST',
      path: '/api/modes',
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
        validate: {
          payload: createModeSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.createMode
      }
    },
    {
      method: 'PUT',
      path: '/api/modes',
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
        validate: {
          payload: updateModeSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.updateMode
      }
    },
    {
      method: 'GET',
      path: '/api/modes/{id}',
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
        validate: {
          params: getModeSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.getMode
      }
    },
    {
      method: 'POST',
      path: '/api/modes/{id}/activate',
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
        validate: {
          params: getModeSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.activateMode
      }
    },
    {
      method: 'GET',
      path: '/api/modes',
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
        handler: handlers.getModes
      }
    },
    {
      method: 'DELETE',
      path: '/api/modes',
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
        validate: {
          payload: getModeSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.deleteMode
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'modes',
  version: '2.0.1',
  description: 'Mode plugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT',
  dependencies: 'devices'
};
