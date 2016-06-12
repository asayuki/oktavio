'use strict';
const
  jwt = require('jsonwebtoken'),
  async = require('async'),
  extend = require('util')._extend;

function getDevicesForMode (devicesCollection, ObjectID, devicesList, callback) {

  let deviceIds = [];

  devicesList.forEach((device) => {
    deviceIds.push(new ObjectID(device.id));
  });

  devicesCollection.find({
    _id: {
      $in: deviceIds
    }
  }).toArray((error, devices) => {
    if (error) {
      callback(true);
    }

    devicesList.forEach((device) => {
      devices.forEach((deviceObj) => {
        if (String(deviceObj._id) === device.id) {
          deviceObj.on = device.on;
        }
      });
    });
    callback(null, devices);
  });
}

module.exports = {

  /**
   *  Retrieve list of modes
   * @return {Object}  response
   * @return {Object}  response.modes - Array of modes
   * @return {integer} response.numModes - Number of modes returned
   */
  getModes: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes'),
        devicesCollection = db.collection('devices');

        // db.devices.find({id: {$in: [1, 2, 5]}})
      modesCollection.find({}).toArray((error, modes) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        let modeDevices = null,
          deviceIds = null;

        async.each(modes, (mode, callback) => {
          deviceIds = [];
          if (typeof mode.devices !== 'undefined' && mode.devices.length > 0) {
            let devices = getDevicesForMode(devicesCollection, ObjectID, mode.devices, (error, devices) => {
              if (error) {
                callback(true);
              } else {
                mode.devices = devices;
                callback();
              }
            });
          } else {
            callback();
          }
        }, (error) => {
          if (error) {
            return response({
              error: 'Database error'
            }).code(500);
          }

          return response({
            modes: modes,
            numModes: modes.length
          }).code(200);
        });
      });
    }
  },

  /**
   * @param {String} request.params.id = Id of mode
   * @return {Object} response
   * @return {Object} response.device - MongoDB-object of device or null if not found
   */
  getMode: (request, response) => {

  },

  /**
   * Add mode
   * @param {Object}  request.payload
   * @param {String}  request.payload.name - Name of mode
   * @param {Boolean} request.payload.active - Optional
   * @param {Array}   request.payload.devices - Array of devices that this mode should contain
   */
  addMode: (request, response) => {

  },

  /**
   * Update mode
   * Will only update those fields that are in the payload.
   * @param {Object}  request.payload
   * @param {String}  request.payload.id - ID of mode
   * @param {String}  request.payload.name - Name of mode
   * @param {Boolean} request.payload.active - Optional
   * @param {Array}   request.payload.devices - Array of devices that this mode should contain
   */
  updateMode: (request, response) => {

  },

  /**
   * Remove mode
   * @param {Object} request.payload
   * @param {String} request.payload.id - ID of mode for deletion
   */
  removeMode: (request, response) => {

  }
};
