'use strict';
const
  Joi = require('joi'),
  handlers = require('./modes');

exports.register = (plugin, options, next) => {

  plugin.route([
    {
      method: 'GET',
      path: '/api/modes',
      config: {
        handler: handlers.getModes,
        tags: ['api'],
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
          'hapi-auth-cookie': { redirectTo: false },
          'hapi-auth-jwt': { redirectTo: false },
          'hapi-swagger': { payloadType: 'form' }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/modes',
      config: {
        handler: handlers.createMode,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            name: Joi.string().required(),
            icon: Joi.string().required(),
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
          'hapi-auth-cookie': { redirectTo: false },
          'hapi-auth-jwt': { redirectTo: false },
          'hapi-swagger': { payloadType: 'json' }
        }
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'modes',
  version: '1.0.0',
  description: 'Modes coreplugin',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
