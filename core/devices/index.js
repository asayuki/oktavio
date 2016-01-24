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
        handler: handlers.getDevices,
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
      path: '/api/devices',
      config: {
        handler: handlers.addDevice,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            name: Joi.string().required(),
            device: Joi.object({
              protocol: Joi.string().required(),
              unit: Joi.number().required(),
              id: Joi.number().required()
            }).required()
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
    },
    {
      method: 'PUT',
      path: '/api/devices',
      config: {
        handler: handlers.updateDevice,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            id: Joi.string().required(),
            name: Joi.string(),
            device: Joi.object({
              protocol: Joi.string(),
              unit: Joi.number(),
              id: Joi.number(),
            })
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
    },
    {
      method: 'GET',
      path: '/api/devices/{id*}',
      config: {
        handler: handlers.getDevice,
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
      method: 'DELETE',
      path: '/api/devices',
      config: {
        handler: handlers.removeDevice,
        tags: ['api'],
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
          'hapi-auth-cookie': { redirectTo: false },
          'hapi-auth-jwt': { redirectTo: false },
          'hapi-swagger': { payloadType: 'form' }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/devices/control',
      config: {
        handler: handlers.controlDevice,
        tags: ['api'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            id: Joi.string().required(),
            on: Joi.boolean()
          })
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
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'devices',
  version: '1.0.0',
  description: 'Devices coreplugin',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
