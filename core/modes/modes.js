'use strict';
const
  jwt = require('jsonwebtoken'),
  async = require('async');

const handlers = {
  getModes: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        modes = db.collection('modes');

      modes.find({}).toArray((err, modesArr) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        return response({modes: modesArr, numModes: modesArr.length}).code(200);
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  getMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modes = db.collection('modes');

      modes.findOne({_id: new ObjectID(request.params.id)}, (err, mode) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        return response(mode).code(200);
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  createMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        modes = db.collection('modes'),
        payload = request.payload;

      let create = () => {
        modes.insert(payload, (err, newMode) => {
          if (err)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, modeID: newMode.ops[0]._id}).code(200);
        });
      };

      if (payload.devices.length > 0) {
        async.each(payload.devices, (device, callback) => {
          if (ObjectID.isValid(device.id)) {
            devices.findOne({_id: new ObjectID(device.id)}, (err, deviceDoc) => {
              if (err)
                callback('Database error');

              if (deviceDoc === null)
                callback('Could not find device with ID ' + device.id);
              else
                callback();
            });
          } else {
            callback('Device ID ' + device.id + ' is not valid');
          }
        }, (err) => {
          if (err)
            return response({status: false, error: err}).code(500);

          create();
        });
      } else {
        create();
      }
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  updateMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        modes = db.collection('modes'),
        payload = request.payload,
        updateObj = {};

      let update = () => {
        modes.update({_id: new ObjectID(payload.id)}, {$set: updateObj}, (err) => {
          if (err)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, modeUpdated: true}).code(200);
        });
      };

      if (typeof payload.name !== 'undefined')
        updateObj.name = payload.name;

      if (typeof payload.icon !== 'undefined')
        updateObj.icon = payload.icon;

      if (typeof payload.devices !== 'undefined') {
        async.each(payload.devices, (device, callback) => {
          if (ObjectID.isValid(device.id)) {
            devices.findOne({_id: new ObjectID(device.id)}, (err, deviceDoc) => {
              if (err)
                callback('Database error');

              if (deviceDoc === null)
                callback('Could not find device with ID ' + device.id);
              else
                callback();
            });
          } else {
            callback('Device ID ' + device.id + ' is not valid');
          }
        }, (err) => {
          if (err)
            return response({status: false, error: err}).code(500);

          updateObj.devices = payload.devices;
          update();
        });
      } else {
        update();
      }

    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  removeMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modes = db.collection('modes'),
        payload = request.payload;

      modes.findOne({_id: new ObjectID(payload.id)}, (err, mode) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (mode === null)
          return response({status: false, error: 'Could not find mode with ID ' + payload.id}).code(500);

        modes.remove({_id: new ObjectID(payload.id)}, (removeErr) => {
          if (removeErr)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, modeRemoved: true}).code(200);
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  addDeviceToMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modes = db.collection('modes'),
        payload = request.payload;

      modes.findOne({_id: new ObjectID(payload.id)}, (err, mode) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (mode === null)
          return response({status: false, error: 'Could not find mode with ID ' + payload.id}).code(500);

        let deviceIndex = null, i;
        for (i = 0; i < mode.devices.length; ++i) {
          if (mode.devices[i].id === payload.device.id) {
            deviceIndex = i;
            break;
          }
        }

        if (deviceIndex !== null)
          return response({status: false, error: 'Device already exists in this mode'}).code(200);

        mode.devices.push(payload.device);
        modes.update({_id: new ObjectID(mode._id)}, {$set: {devices: mode.devices}}, (updateErr) => {
          if (updateErr)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, deviceAddedToMode: true}).code(200);
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  removeDeviceFromMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        modes = db.collection('modes'),
        payload = request.payload;

      modes.findOne({_id: new ObjectID(payload.id)}, (err, mode) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (mode === null)
          return response({status: false, error: 'Could not find mode with ID ' + payload.id}).code(500);

        let deviceIndex, i;
        for (i = 0; i < mode.devices.length; ++i) {
          if (mode.devices[i].id === payload.deviceId) {
            deviceIndex = i;
            break;
          }
        }

        mode.devices.splice(deviceIndex, 1);
        modes.update({_id: new ObjectID(mode._id)}, {$set: {devices: mode.devices}}, (updateErr) => {
          if (updateErr)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, deviceRemovedFromMode: true}).code(200);
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  activateMode: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        general = db.collection('general'),
        modes = db.collection('modes'),
        devices = db.collection('devices'),
        payload = request.payload,
        targetMode = null,
        sendDevices = [];

      async.series([
        (callback) => {
          modes.findOne({_id: new ObjectID(payload.id)}, (err, mode) => {
            if (err)
              return callback('Database error');

            if (mode === null)
              return callback('Could not find mode with ID ' + payload.id);

            targetMode = mode;

            return callback();
          });
        },
        (callback) => {
          general.update({type: 'settings'}, {$set: {currentMode: new ObjectID(payload.id)}}, (err) => {
            if (err)
              return callback('Database error');

            return callback();
          });
        }
      ], (err) => {
        if (err)
          return response({status: false, error: err}).code(500);

        async.each(targetMode.devices, (device, callback) => {
          var deviceID = new ObjectID(device.id);
          devices.findOne({_id: deviceID}, (deviceErr, deviceDoc) => {
            if (deviceErr)
              return callback('Database error whilst fetching device ' + device.id);

            let changeState = true;
            if (typeof deviceDoc.current_state !== undefined) {
              if (deviceDoc.current_state === device.on)
                changeState = false
            }
            if (changeState) {
              devices.update({_id: deviceID}, {$set: {current_state: device.on}}, (updateErr) => {
                if (updateErr)
                  return callback('Database error whilst updating current state of device ' + device.id);

                let sendObj = {
                  "action": "send",
                  "code": {
                    "protocol": [deviceDoc.device.protocol],
                    "id": deviceDoc.device.id,
                    "unit": deviceDoc.device.unit
                  }
                };

                if (device.on)
                  sendObj.code.on = 1;
                else
                  sendObj.code.off = 1;

                sendDevices.push(sendObj);

                return callback();

              });
            } else {
              return callback()
            }
          });
        }, (err) => {
          if (err)
            return response ({status: false, error: err}).code(500);

          [].slice.call(sendDevices).forEach((sendObj) => {
            request.server.plugins.pilight.send(sendObj);
          });

          return response({status: true}).code(200);
        });
      });
    }
  }
};

module.exports = handlers;
