'use strict';
const
  jwt = require('jsonwebtoken'),
  async = require('async'),
  extend = require('util')._extend;

// db.foo.updateMany({}, {$set: {lastLookedAt: Date.now() / 1000}})

/**
 * activateMode
 * Activates mode and triggers device-activation
 */
function activateMode (db, mode, callback) {
  //db.collection('modes').updateMany({}, {$set: {active: }})
}

/**
 * getDevicesForMode
 * Return a list of all devices and their attributes based on a collection of ids.
 * @param {Object} devicesCollection - Database collection for devices
 * @param {Object} ObjectID - ObjectID function
 * @param {Array} devicesList - List of devices
 * @param {Function} callback
 */
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

      modesCollection.find({}).toArray((error, modes) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        async.each(modes, (mode, callback) => {
          if (typeof mode.devices !== 'undefined' && mode.devices.length > 0) {
            let devices = getDevicesForMode(devicesCollection, ObjectID, mode.devices, (error, devices) => {
              if (error) {
                callback(true);
              }

              mode.devices = devices;
              callback();
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
    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * @param {String} request.params.id = Id of mode
   * @return {Object} response
   * @return {Object} response.device - MongoDB-object of device or null if not found
   */
  getMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes'),
        devicesCollection = db.collection('devices');

      modesCollection.findOne({_id: new ObjectID(request.params.id)}, (error, mode) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (typeof mode.devices !== 'undefined' && mode.devices.length > 0) {
          let devices = getDevicesForMode(devicesCollection, ObjectID, mode.devices, (error, devices) => {
            if (error) {
              return response({
                error: 'Database error.'
              }).code(500);
            }

            mode.devices = devices;

            return response({
              mode: mode
            }).code(200);
          });
        } else {
          return response({
            mode: mode
          }).code(200);
        }
      });
    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Add mode
   * @param {Object}  request.payload
   * @param {String}  request.payload.name - Name of mode
   * @param {Boolean} request.payload.active - Optional
   * @param {Array}   request.payload.devices - Array of devices that this mode should contain
   */
  addMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes'),
        devicesCollection = db.collection('devices'),
        payload = request.payload;

      // Lets check if all devices exists
      async.each(payload.devices, (device, callback) => {
        if (!ObjectID.isValid(device.id)) {
          callback('Device ID "' + device.id + '" is not valid.');
        }

        devicesCollection.findOne({_id: new ObjectID(device.id)}, (error, deviceObj) => {
          if (error) {
            callback('Database error.');
          }

          if (deviceObj === null) {
            callback('Device with ID "' + device.id + '" does not exist.');
          }

          callback();
        });
      }, (error) => {
        if (error) {
          return response({
            error: error
          }).code(500);
        }

        modesCollection.insert(payload, (error, mode) => {
          if (error) {
            return response({
              error: 'Database error'
            }).code(500);
          }

          if (typeof payload.active !== 'undefined' && payload.active) {
            activateMode(db, mode.ops[0], (error, done) => {
              if (error) {
                return response({
                  mode: mode.ops[0],
                  error: error
                }).code(500);
              }

              return response({
                mode: mode.ops[0]
              }).code(200);
            });
          } else {
            return response({
              mode: mode.ops[0]
            }).code(200);
          }
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
   * Update mode
   * Will only update those fields that are in the payload.
   * @param {Object}  request.payload
   * @param {String}  request.payload.id - ID of mode
   * @param {String}  request.payload.name - Name of mode
   * @param {Boolean} request.payload.active - Optional
   * @param {Array}   request.payload.devices - Array of devices that this mode should contain
   */
  updateMode: (request, response) => {
    if (request.auth.isAuthenticated) {

    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  },

  /**
   * Remove mode
   * @param {Object} request.payload
   * @param {String} request.payload.id - ID of mode for deletion
   */
  removeMode: (request, response) => {
    if (request.auth.isAuthenticated) {

    } else {
      return response({
        status: false,
        error: 'Not authenticated.'
      }).code(401);
    }
  }
};
