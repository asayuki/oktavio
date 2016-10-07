'use strict';

const Boom = require('boom');
const NodeSchedule = require('node-schedule');
const createScheduleSchema = require('./schemas/createScheduleSchema');
const getScheduleSchema = require('./schemas/getScheduleSchema');
const updateScheduleSchema = require('./schemas/updateScheduleSchema');
const userFunctions = require('../users/utils/userFunctions');
const scheduleFunctions = require('./utils/scheduleFunctions');
const Schedule = require('./model/schedule');
const handlers = require('./handlers');

const isLoggedIn = userFunctions.isLoggedIn;
const verifyDeviceExists = scheduleFunctions.verifyDeviceExists;

exports.register = (server, options, next) => {

  function addZero (num) {
    return (num < 10) ? '0' + num : num;
  }

  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Run job every minute, and we shouldn't start it in testing mode
  if (!process.env.TESTING) {
    const job = NodeSchedule.scheduleJob('30 * * * * *', () => {

      let date = new Date();
      let day = weekDays[date.getDay()];
      let hour = addZero(date.getHours());
      let minute = addZero(date.getMinutes());

      Schedule.find({
        $or: [
          {
            weekDay: day,
            time: parseInt(hour + '' + minute)
          },
          {
            weekDay: 'all',
            time: parseInt(hour + '' + minute)
          }
        ]
      }, (error, jobs) => {

        console.log(jobs);

        // Here we might want exposes?
        // if Device:
        // server.plugins.modes.activateDevice(deviceID);

        // if Mode:
        // server.plugins.modes.activateMode(modeID);
      });
    });
  }

  server.route([
    {
      method: 'POST',
      path: '/api/schedules',
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
          payload: createScheduleSchema
        },
        pre: [
          {
            method: isLoggedIn
          },
          {
            method: verifyDeviceExists
          }
        ],
        handler: handlers.createSchedule
      }
    },
    {
      method: 'PUT',
      path: '/api/schedules',
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
          payload: updateScheduleSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.updateSchedule
      }
    },
    {
      method: 'GET',
      path: '/api/schedules/{id}',
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
          params: getScheduleSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.getSchedule
      }
    },
    {
      method: 'GET',
      path: '/api/schedules',
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
        handler: handlers.getSchedules
      }
    },
    {
      method: 'DELETE',
      path: '/api/schedules',
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
          payload: getScheduleSchema
        },
        pre: [
          {
            method: isLoggedIn
          }
        ],
        handler: handlers.deleteSchedule
      }
    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'schedules',
  version: '1.0.0',
  description: 'Schedules plugin for Oktavio',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT',
  dependencies: ['devices', 'modes']
};
