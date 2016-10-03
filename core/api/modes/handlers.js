'use strict';
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

  /**
   * Update mode
   * @param {Object} request.payload
   * @param {String} request.payload.id
   * @param {String} request.payload.name
   * @param {Object[]} request.payload.devices
   * @param {String} request.payload.devices[].id
   * @param {Boolean} request.payload.devices[].state
   */
  updateMode: (request, response) => {
    let updateId = request.payload.id;
    delete request.payload.id;

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

      Mode.update({_id: updateId}, {$set: request.payload}, (error, mode) => {
        if (error) {
          return response(Boom.badImplementation('Could not update mode.'));
        }

        return response({
          modeUpdated: true
        }).code(200);
      });
    });
  },

  /**
   * Get mode
   * @param {Object} request.params
   * @param {String} request.params.id
   * @return {Object} response.mode
   */
  getMode: (request, response) => {
    Mode.findById(request.params.id, (error, mode) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch mode.'));
      }

      if (mode === null) {
        return response(Boom.notFound('Could not find mode.'));
      }

      return response({mode: mode});
    });
  },

  /**
   * Get modes
   * @param {Object} request.query
   * @param {String} request.query.from
   * @param {Integer} request.query.limit
   * @return {Array} response.modes
   */
  getModes: (request, response) => {
    let query = {};
    if (typeof request.query.from !== 'undefined') {
      query._id = {
        $gt: request.query.from
      };
    }

    Mode.find(query)
    .limit((request.query.limit ? parseInt(request.query.limit) : 20))
    .select('-__v').exec((error, modes) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch modes'));
      }

      return response({modes: modes}).code(200);
    });
  },

  /**
   * Activate mode
   */
  activateMode: (request, response) => {

  },


  deleteMode: (request, response) => {}
};
