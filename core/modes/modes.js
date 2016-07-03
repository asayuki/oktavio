'use strict';
const
  jwt = require('jsonwebtoken'),
  async = require('async'),
  extend = require('util')._extend;

/**
 * activateMode
 * Activates mode and triggers device-activation
 * @param {Object} plugins - Server plugins
 * @param {Object} mode - The mode we want to activate
 * @param {Function} callback
 * @return {Function} callback
 */
function activateMode (plugins, mode, callback) {
  let
    modesCollection = plugins['hapi-mongodb'].db.collection('modes'),
    devicesCollection = plugins['hapi-mongodb'].db.collection('devices'),
    ObjectID = plugins['hapi-mongodb'].ObjectID;

  modesCollection.updateMany({}, {$set: {active: false}}, (error) => {
    if (error) {
      callback('Database error.');
    }

    modesCollection.update({_id: new ObjectID(mode._id)}, {$set: {active: true}}, (error) => {
      if (error) {
        callback('Database error.');
      }

      getDevicesForMode(devicesCollection, ObjectID, mode.devices, (error, devices) => {
        let sendDeviceObj = null;
        async.each(devices, (device, cb) => {
          devicesCollection.update({_id: new ObjectID(device._id)}, {$set: {state: device.on}}, (error) => {
            if (error) {
              cb('Could not update device with ID "' + device._id + '".');
            }

            /* eslint-disable quotes */
            sendDeviceObj = {
              "action": "send",
              "code": {
                "protocol": [device.protocol],
                "id": device.unit_id,
                "unit": device.unit_code
              }
            };
            /* eslint-enable quotes */

            if (device.on) {
              sendDeviceObj.code.on = 1;
            } else {
              sendDeviceObj.code.off = 1;
            }

            plugins.pilight.send(sendDeviceObj);

            cb();
          });
        }, (error) => {
          if (error) {
            callback(error);
          }

          callback();
        });
      });
    });
  });
}

/**
 * getDevicesForMode
 * Return a list of all devices and their attributes based on a collection of ids.
 * @param {Object} devicesCollection - Database collection for devices
 * @param {Object} ObjectID - ObjectID function
 * @param {Array} devicesList - List of devices
 * @param {Function} callback
 * @return {Function} callback
 */
function getDevicesForMode (devicesCollection, ObjectID, devicesList, callback) {

  /*async.each(modes, (mode, callback) => {
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
  });*/

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
   * Retrieve currect active mode and total modes
   * @return {Object/null} response.mode - The mode which is currently active
   * @return (Number) response.numModes - Count of all modes
   */
  getActiveMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes');

      modesCollection.count({}, (error, totalModes) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        console.log(totalModes);

        modesCollection.findOne({active: true}, (error, mode) => {
          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          return response({
            mode: mode,
            numModes: totalModes
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

        return response({
          modes: modes,
          numModes: modes.length
        }).code(200);
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

        return response({
          mode: mode
        }).code(200);
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
            activateMode(request.server.plugins, mode.ops[0], (error) => {
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
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes'),
        devicesCollection = db.collection('devices'),
        payload = request.payload,
        modeId = new ObjectID(payload.id);

      modesCollection.findOne({_id: modeId}, (error, mode) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (mode === null) {
          return response({
            error: 'Could not find mode with ID "' + payload.id + '".'
          }).code(404);
        }

        delete payload.id;
        delete mode._id;

        mode = extend(mode, payload);

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
          modesCollection.update({_id: modeId}, {$set: mode}, (error) => {
            mode._id = modeId;
            if (error) {
              return response({
                error: 'Database error'
              }).code(500);
            }

            if (typeof payload.active !== 'undefined' && payload.active) {
              activateMode(request.server.plugins, mode, (error) => {
                if (error) {
                  return response({
                    error: error
                  }).code(500);
                }

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
   * Remove mode
   * @param {Object} request.payload
   * @param {String} request.payload.id - ID of mode for deletion
   */
  removeMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modesCollection = db.collection('modes');

      modesCollection.findOne({_id: new ObjectID(request.payload.id)}, (error, mode) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (mode === null) {
          return response({
            error: 'Could not find mode with ID "' + request.payload.id + '".'
          }).code(404);
        }

        modesCollection.remove({_id: new ObjectID(request.payload.id)}, (error) => {
          if (error) {
            return response({
              error: 'Database error.'
            }).code(500);
          }

          return response({
            removed: true
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
