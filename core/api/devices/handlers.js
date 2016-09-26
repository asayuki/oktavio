const Boom = require('boom');
const Device = require('./model/device');

module.exports = {
  /**
   * Create device
   * @param {Object} request.payload
   * @param {String} request.payload.name
   * @param {String} request.payload.protocol
   * @param {Integer} request.payload.unit_code
   * @param {Integer} request.payload.unit_id
   * @param {Boolean} request.payload.state
   */
  createDevice: (request, response) => {

    let device = new Device();

    device.name = request.payload.name;
    device.protocol = request.payload.protocol;
    device.unit_code = request.payload.unit_code;
    device.unit_id = request.payload.unit_id;
    device.state = request.payload.state;

    device.save((deviceError, newDevice) => {
      if (deviceError) {
        return response(Boom.badImplementation('Could not create device.'));
      }

      return response({
        deviceCreated: true,
        deviceId: newDevice._id
      }).code(201);
    });

  },

  /**
   * Get devices
   * @param {Object} request.query
   * @param {String} request.query.from
   * @param {Integer} request.query.limit
   * @return {Array} response.devices
   */
  getDevices: (request, response) => {

    let query = {};
    if (typeof request.query.from !== 'undefined') {
      query._id = {
        $gt: request.query.from
      };
    }

    Device.find(query)
    .limit((request.query.limit ? parseInt(request.query.limit) : 20))
    .select('-__v').exec((error, devices) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch devices'));
      }

      return response({devices: devices}).code(200);
    });

  },

  /**
  * Update device
  * @param {Object} request.payload
  * @param {String} request.payload.id
  * @param {String} request.payload.name
  * @param {String} request.payload.protocol
  * @param {Integer} request.payload.unit_code
  * @param {Integer} request.payload.unit_id
  * @param {Boolean} request.payload.state
   */
  updateDevice: (request, response) => {
    let updateId = request.payload.id;
    delete request.payload.id;

    Device.update({_id: updateId}, {$set: request.payload}, (error, device) => {
      if (error) {
        return response(Boom.badImplementation('Could not update device.'));
      }

      return response({
        deviceUpdated: true
      }).code(200);
    });
  },

  /**
   * Get device
   * @param {Object} request.query
   * @param {String} request.query.id
   * @return {Object} response.device
   */
  getDevice: (request, response) => {
    Device.findById(request.params.id, (error, device) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch device'));
      }
      if (device === null) {
        return response(Boom.notFound('Could not find device'));
      }

      return response({device: device});
    });
  },

  /**
   * Remove device
   */
  deleteDevice: (request, response) => {
    Device.findByIdAndRemove(request.payload.id, (error) => {
      if (error) {
        return response(Boom.badImplementation('Error while removing device'));
      }

      return response({
        deviceRemoved: true
      }).code(200);
    });
  },

  /**
   * Activate device
   */
  activateDevice: (request, response) => {
    Device.findById(request.params.id, (error, device) => {
      if (error) {
        return response(Boom.badImplementation('Could node fetch device'));
      }

      if (device === null) {
        return response(Boom.notFound('Could not find device'));
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

      request.server.plugins.pilight.send(sendObj, (success) => {
        if (!success) {
          return response(Boom.badImplementation('Could not activate device'));
        }

        Device.update({_id: request.params.id}, {$set: {state: true}}, (error, device) => {
          if (error) {
            return response(Boom.badImplementation('Could not update device with new state. But activation went through.'));
          }

          return response({
            deviceActivated: true
          }).code(200);
        });
      });
    });
  },

  /**
   * Deactivate device
   */
  deactivateDevice: (request, response) => {
    Device.findById(request.params.id, (error, device) => {
      if (error) {
        return response(Boom.badImplementation('Could node fetch device'));
      }

      if (device === null) {
        return response(Boom.notFound('Could not find device'));
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

      request.server.plugins.pilight.send(sendObj, (success) => {
        if (!success) {
          return response(Boom.badImplementation('Could not deactivate device'));
        }

        Device.update({_id: request.params.id}, {$set: {state: false}}, (error, device) => {
          if (error) {
            return response(Boom.badImplementation('Could not update device with new state. But deactivation went through.'));
          }

          return response({
            deviceDeactivated: true
          }).code(200);
        });
      });
    });
  }
};
