'use strict';
const
  jwt = require('jsonwebtoken'),
  async = require('async'),
  extend = require('util')._extend;

module.exports = {
  /**
   * Retrieve list of devices
   * @return {Object}  response
   * @return {Object}  response.devices - Array of devices
   * @return {integer} response.numDevices - Number of devices returned
   */
  getDevices: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

      devices.find({}).toArray((error, devicesArr) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        return response({
          devices: devicesArr,
          numDevices: devicesArr.length
        }).code(200);
      });
    } else {
      return response({
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Returns the number of active devices, and total devices
   */
  getActiveDevices: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

      devices.count({state: true}, (error, onCount) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        devices.count({}, (error, totalCount) => {
          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          return response({
            numOnDevices: onCount,
            numDevices: totalCount
          }).code(200);
        });
      });
    } else {
      return response({
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Get device
   * @param {String} request.params.id - Id of device
   * @return {Object} response
   * @return {Object} response.device - MongoDB-object of device or null if not found
   */
  getDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices');

      devices.findOne({_id: new ObjectID(request.params.id)}, (error, device) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        return response({
          device: device
        }).code(200);
      });
    } else {
      return response({
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Add device
   * @param {Object}  request.payload
   * @param {String}  request.payload.name - Name of the device you're adding
   * @param {String}  request.payload.protocol - Protocol of the device
   * @param {integer} request.payload.unit_code - Unit code
   * @param {integer} request.payload.unit_id - Unit id
   * @param {Boolean} request.payload.state - Optional, if device is active or not active as of this moment
   */
  addDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

      console.log(request.payload);

      //return;

      devices.insert(request.payload, (error, device) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        return response({
          device: device.ops[0]
        }).code(200);
      });
    } else {
      return response({
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Remove device
   * @param {Object} request.payload
   * @param {String} request.payload.id - Id of device
   */
  removeDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        modes = db.collection('modes');

      devices.findOne({_id: new ObjectID(request.payload.id)}, (error, device) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (device === null) {
          return response({
            error: 'Device not found.'
          }).code(404);
        }

        modes.find({devices: {$elemMatch: {id: request.payload.id}}}, {devices: true}).toArray((error, modesArr) => {
          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          async.each(modesArr, (mode, callback) => {

            let deviceIndex = mode.devices.map(function(e) { return e.id; }).indexOf(request.payload.id);
            mode.devices.splice(deviceIndex, 1);

            modes.update({_id: new ObjectID(mode._id)}, {$set: {devices: mode.devices}}, (error) => {
              if (error) {
                callback(true);
              }

              callback();
            });
          }, (error) => {
            if (error) {
              return response({
                error: 'Error while removing device from modes.'
              }).code(500);
            }

            devices.remove({_id: new ObjectID(request.payload.id)}, (error) => {
              if (error) {
                return response({
                  error: 'Database error while removing device.'
                }).code(500);
              }

              return response({
                removed: true
              }).code(200);
            });
          });
        });
      });

    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Update device
   * Will only update those fields that are in the payload.
   * @param {Object}  request.payload
   * @param {String}  request.payload.id - ID of the device you're updating
   * @param {String}  request.payload.name - Name of the device you're updating
   * @param {String}  request.payload.protocol - Protocol of the device
   * @param {integer} request.payload.unit_code - Unit code
   * @param {integer} request.payload.unit_id - Unit id
   * @param {Boolean} request.payload.state - Optional, if device is active or not active as of this moment
   */
  updateDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        payload = request.payload,
        pilightSend = false;

      devices.findOne({_id: new ObjectID(payload.id)}, (error, device) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (device === null) {
          return response({
            error: 'Device not found.'
          }).code(404);
        }

        device = extend(device, payload);

        delete device._id;
        delete device.id;

        devices.update({_id: new ObjectID(payload.id)}, {$set: device}, (error) => {

          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          if (typeof device.state !== 'undefined') {
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

            if (device.state) {
              sendObj.code.on = 1;
            } else {
              sendObj.code.off = 1;
            }

            request.server.plugins.pilight.send(sendObj);
          }

          device._id = payload.id;

          return response({
            device: device
          }).code(200);
        });
      });
    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  }
};
