'use strict';
const
  Joi = require('joi'),
  handlers = require('./modes');

exports.register = (plugin, options, next) => {

  plugin.route([
    {
      method: 'GET',
      path: '/api/modes/{id}',
      config: {
        handler: handlers.getMode,
        tags: ['api', 'modes'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          params: {
            id: Joi.string().required()
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
      path: '/api/modes',
      config: {
        handler: handlers.getModes,
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
      path: '/api/modes/active',
      config: {
        handler: handlers.getActiveMode,
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
      method: 'POST',
      path: '/api/modes',
      config: {
        handler: handlers.addMode,
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
      method: 'PUT',
      path: '/api/modes',
      config: {
        handler: handlers.updateMode,
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
      method: 'DELETE',
      path: '/api/modes',
      config: {
        handler: handlers.removeMode,
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
  name: 'modes',
  version: '2.0.0',
  description: 'Modes coreplugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
