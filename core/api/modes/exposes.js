'use strict';
const Boom = require('boom');
const Mode = require('./model/mode');
const Async = require('async');

module.exports = {
  activate: (mode, plugins, callback) => {
    Async.each(mode.devices, (device, asyncCB) => {
      if (device.state) {
        plugins.devices.activate(device.id, plugins.pilight, (aError, success) => {
          if (aError) {
            return asyncCB(aError);
          }

          return asyncCB();
        });
      } else {
        plugins.devices.deactivate(device.id, plugins.pilight, (daError, success) => {
          if (daError) {
            return asyncCB(daError);
          }

          return asyncCB();
        });
      }
    }, (error) => {
      if (error) {
        return callback(error);
      }

      return callback();
    });
  }
};
