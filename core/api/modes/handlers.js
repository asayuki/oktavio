const Boom = require('boom');
const Async = require('async');
const Mode = require('./model/mode');
const Device = require('../devices/model/device');

module.exports = {
  /**
   * Create mode
   * @param {Object} request.payload
   * @param {String} request.payload.name
   * @param {Object[]} request.payload.devices
   * @param {String} request.payload.devices[].id
   * @param {Boolean} request.payload.devices[].state
   */
  createMode: (request, response) => {

    let mode = new Mode();
    mode.name = request.payload.name;

    Async.each(request.payload.devices, (device, callback) => {
      Device.findById(device.id, (error, deviceObj) => {
        if (error) {
          callback(Boom.badImplementation('Could not fetch device for mode.'));
        }

        if (deviceObj === null) {
          callback(Boom.badImplementation(`Device with ID '${device.id}' does not exist.`));
        }

        callback();
      });
    }, (error) => {
      if (error) {
        return response(error);
      }

      mode.devices = request.payload.devices;
      mode.save((modeError, newMode) => {
        if (modeError) {
          return response(Boom.badImplementation('Could not create mode.'));
        }

        return response({
          modeCreated: true,
          modeId: newMode._id
        }).code(201);
      });
    });
  },
  updateMode: (request, response) => {},
  getMode: (request, response) => {},
  getModes: (request, response) => {},
  activateMode: (request, response) => {},
  deleteMode: (request, response) => {}
};
