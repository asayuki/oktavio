'use strict';
const Boom = require('boom');
const Device = require('./model/device');

module.exports = {

  activate: (id, pilight, callback) => {
    Device.findById(id, (error, device) => {
      if (error) {
        return callback(Boom.badImplementation('Could node fetch device'));
      }

      if (device === null) {
        return callback(Boom.notFound('Could not find device'));
      }

      /* eslint-disable quotes */
      let sendObj = {
        "action": "send",
        "code": {
          "protocol": [device.protocol],
          "id": device.unit_id,
          "unit": device.unit_code,
          "on": 1
        }
      };
      /* eslint-enable quotes */

      pilight.send(sendObj, (success) => {
        if (!success) {
          return callback(Boom.badImplementation('Could not activate device'));
        }

        Device.update({_id: request.params.id}, {$set: {state: true}}, (error, device) => {
          if (error) {
            return callback(Boom.badImplementation('Could not update device with new state. But activation went through.'));
          }

          return callback(null, true);
        });
      });
    });
  },

  deactivate: (id, pilight, callback) => {
    Device.findById(request.params.id, (error, device) => {
      if (error) {
        return callback(Boom.badImplementation('Could node fetch device'));
      }

      if (device === null) {
        return callback(Boom.notFound('Could not find device'));
      }

      /* eslint-disable quotes */
      let sendObj = {
        "action": "send",
        "code": {
          "protocol": [device.protocol],
          "id": device.unit_id,
          "unit": device.unit_code,
          "on": 0
        }
      };
      /* eslint-enable quotes */

      pilight.send(sendObj, (success) => {
        if (!success) {
          return callback(Boom.badImplementation('Could not deactivate device'));
        }

        Device.update({_id: request.params.id}, {$set: {state: false}}, (error, device) => {
          if (error) {
            return callback(Boom.badImplementation('Could not update device with new state. But deactivation went through.'));
          }

          return response(null, true);
        });
      });
    });
  }
};
