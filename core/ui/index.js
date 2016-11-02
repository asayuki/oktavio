'use strict';

const Boom = require('boom');
const userFunctions = require('../api/users/utils/userFunctions');
//const handlers = require('./handlers');
//const exposes = require('./exposes');

const isLoggedIn = userFunctions.isLoggedIn;

exports.register = (server, options, next) => {

  // Route all statics
  server.route({
    method: 'GET',
    path: '/statics/{path*}',
    config: {
      handler: {
        directory: {
          path: './core/ui/statics'
        }
      },
      id: 'statics'
    }
  });

  // Route all views
  server.route([
    /*{
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
    }*/
    {
      method: 'GET',
      path: '/login',
      config: {
        handler: (request, response) => {
          return response.view('pages/login');
        }
      }
    },
    {
      method: 'GET',
      path: '/',
      config: {
        auth: {
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        handler: (request, response) => {
          return response.view('pages/dashboard');
        }
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'ui',
  version: '1.0.0',
  description: 'UI plugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
