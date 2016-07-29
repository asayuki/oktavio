'use strict';
const
  Joi = require('joi'),
  handlers = require('./devices'),
  schedule = require('node-schedule');

exports.register = (plugin, options, next) => {

  let
    db = plugin.plugins['hapi-mongodb'].db,
    devicesColl = db.collection('devices'),
    weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const deviceJob = schedule.scheduleJob('30 * * * * *', () => {

    let date = new Date();
    let day = weekDays[date.getDay()];

    devicesColl.find(
      {
        [`schedule.${day}.hour`]: date.getHours(),
        [`schedule.${day}.minute`]: date.getMinutes()
      }
    ).toArray((error, devices) => {
      devices.forEach((device) => {
        /* eslint-disable quotes */
        let sendObj = {
          "action": "send",
          "code": {
            "protocol": [device.protocol],
            "id": device.unit_id,
            "unit": device.unit_code
          }
        };
        /* eslint-enable quotes */
        if (`schedule.${day}.state`) {
          sendObj.code.on = 1;
        } else {
          sendObj.code.off = 1;
        }

        console.log(sendObj);
      });
    });
  });

  const scheduleDaySchema = {
    hour: Joi.date().format('H').raw().example('15'),
    minute: Joi.date().format('m').raw().example('30'),
    state: Joi.boolean()
  };

  const scheduleSchema = {
    monday: Joi.object(scheduleDaySchema),
    tuesday: Joi.object(scheduleDaySchema),
    wednesday: Joi.object(scheduleDaySchema),
    thursday: Joi.object(scheduleDaySchema),
    friday: Joi.object(scheduleDaySchema),
    saturday: Joi.object(scheduleDaySchema),
    sunday: Joi.object(scheduleDaySchema)
  };

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
      path: '/api/devices/active',
      config: {
        handler: handlers.getActiveDevices,
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
            state: Joi.boolean(),
            schedule: Joi.object(scheduleSchema).optional().description('Default will be targeted everyday if set, otherwise it will check into days object and see if that day has a state it should activate.')
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
            state: Joi.boolean()
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
