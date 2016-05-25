'use strict';
const
  Joi = require('joi'),
  handlers = require('./users');

exports.register = (plugin, options, next) => {

  plugin.route([
    {
      method: 'POST',
      path: '/api/users',
      config: {
        handler: handlers.createUser,
        tags: ['api', 'users'],
        validate: {
          headers: Joi.object({
            Authorization: Joi.string()
          }).unknown(),
          payload: Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().required()
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
  'name': 'users',
  'version': '1.0.0',
  'description': 'Users coreplugin for Oktavio',
  'main': 'index.js',
  'author': 'neme <neme@whispered.se>',
  'license': 'MIT'
};
