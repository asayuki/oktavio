'use strict';
const
  Joi = require('joi');
  //handlers = require('./modes');

exports.register = (plugin, options, next) => {
  plugin.route([
    // Get one mode
    {
      method: 'GET',
      path: '/api/modes/{id*}',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          params: Joi.object({
            id: Joi.string().required()
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cooke': {
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
    // Get multiple modes
    {
      method: 'GET',
      path: '/api/modes',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown()
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cooke': {
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
    // Create mode
    {
      method: 'POST',
      path: '/api/modes',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            name: Joi.string().required(),
            active: Joi.boolean().default(false),
            devices: Joi.array().items(Joi.object({
              id: Joi.string().required(),
              on: Joi.boolean().required()
            }))
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cooke': {
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
    // Update mode
    {
      method: 'PUT',
      path: '/api/modes',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            id: Joi.string().required(),
            name: Joi.string(),
            active: Joi.boolean(),
            devices: Joi.array().items(Joi.object({
              id: Joi.string().required(),
              on: Joi.boolean().required()
            }))
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cooke': {
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
    // Delete mode
    {
      method: 'DELETE',
      path: '/api/modes',
      config: {
        handler: (a, b) => {},
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            id: Joi.string().required()
          })
        },
        auth: {
          mode: 'try',
          strategies: ['session', 'token']
        },
        plugins: {
          'hapi-auth-cooke': {
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
  name: 'modes',
  version: '2.0.0',
  description: 'Modes coreplugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
