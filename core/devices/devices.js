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
   * Get device
   * @param {integer} request.params.id - Id of device
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
   * @param {Object}  request.params
   * @param {String}  request.params.name - Name of the device you're adding
   * @param {String}  request.params.protocol - Protocol of the device
   * @param {integer} request.params.unit_code - Unit code
   * @param {integer} request.params.unit_id - Unit id
   * @param {Boolean} request.params.active - Optional, if device is active or not active as of this moment
   */
  addDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

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
   * @param {Object}  request.params
   * @param {String}  request.params.id - ID of the device you're updating
   * @param {String}  request.params.name - Name of the device you're updating
   * @param {String}  request.params.protocol - Protocol of the device
   * @param {integer} request.params.unit_code - Unit code
   * @param {integer} request.params.unit_id - Unit id
   * @param {Boolean} request.params.active - Optional, if device is active or not active as of this moment
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

        devices.update({_id: new ObjectID(device._id)}, {$set: device}, (error) => {
          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          if (typeof device.active !== 'undefined') {
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

            if (device.active)
              sendObj.code.on = 1;
            else
              sendObj.code.off = 1;

            request.server.plugins.pilight.send(sendObj);
          }

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
