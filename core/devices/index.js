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
        tags: ['api', 'devices'],
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
      path: '/api/devices/{id}',
      config: {
        handler: handlers.getDevice,
        tags: ['api', 'devices'],
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
      method: 'POST',
      path: '/api/devices',
      config: {
        handler: handlers.addDevice,
        tags: ['api', 'devices'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            name: Joi.string().required(),
            protocol: Joi.string().required(),
            unit_code: Joi.number().required(),
            unit_id: Joi.number().required(),
            active: Joi.boolean()
          }).required()
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
            protocol: Joi.string(),
            unit_code: Joi.number(),
            unit_id: Joi.number(),
            active: Joi.boolean()
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
  name: 'devices',
  version: '2.0.0',
  description: 'Devices coreplugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
