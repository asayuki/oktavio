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
   * @param {Object} request.payload.schedule
   * @param {Object} request.payload.schedule.[weekday]
   * @param {Object} request.payload.schedule.[weekday].[time]
   * @param {Boolean} request.payload.schedule.[weekday].[time].state
   */
  createDevice: (request, response) => {

    let device = new Device();

    device.name = request.payload.name;
    device.protocol = request.payload.protocol;
    device.unit_code = request.payload.unit_code;
    device.unit_id = request.payload.unit_id;
    device.state = request.payload.state;
    device.schedule = request.payload.schedule;

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

  }

  /**
   * Get device
   */

  /**
   * Remove device
   */

  /**
   * Update device
   */
};