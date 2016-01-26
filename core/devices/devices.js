'use strict';
const
  jwt = require('jsonwebtoken'),
  passwordHash = require('password-hash'),
  async = require('async');

const handlers = {
  getDevices: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

      devices.find({}).toArray((err, devicesArr) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        return response({devices: devicesArr, numDevices: devicesArr.length}).code(200);
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  addDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        devices = db.collection('devices');

      devices.insert(request.payload, (err, newDevice) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        return response({status: true, deviceID: newDevice.ops[0]._id}).code(200);
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  updateDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        payload = request.payload;

      devices.findOne({_id: new ObjectID(payload.id)}, (err, device) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (device === null)
          return response({status: false, error: 'Could not find device with ID ' + payload.id});

        if (typeof payload.name !== 'undefined')
          device.name = payload.name;

        if (typeof payload.device !== 'undefined') {
          if (typeof payload.device.id !== 'undefined')
            device.device.id = payload.device.id;

          if (typeof payload.device.protocol !== 'undefined')
            device.device.protocol = payload.device.protocol;

          if (typeof payload.device.unit !== 'undefined')
            device.device.unit = payload.device.unit;
        }

        devices.update({_id: new ObjectID(device._id)}, {'$set': device}, (err) => {
          if (err)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, deviceUpdated: true}).code(200);
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  getDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices');

      devices.findOne({_id: new ObjectID(request.params.id)}, (err, device) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        return response(device).code(200);
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  removeDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        modes = db.collection('modes');

      let remove = () => {
        devices.remove({_id: new ObjectID(request.payload.id)}, (removeErr) => {
          if (removeErr)
            return response({status: false, error: 'Database error'}).code(500);

          return response({status: true, deviceRemoved: true}).code(200);
        });
      };

      devices.findOne({_id: new ObjectID(request.payload.id)}, (err, device) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (device === null)
          return response({status: false, error: 'Could not find device with ID ' + request.payload.id}).code(500);

        // We also need to check modes if they might contain the device
        modes.find({devices: {$elemMatch: {id: request.payload.id}}}, {devices: true}).toArray((err, modesArr) => {
          if (err)
            return response({status: false, error: 'Database error'}).code(500);

          if (modesArr.length > 0) {
            async.each(modesArr, (mode, callback) => {
              let deviceIndex;
              for (let i = 0; i < mode.devices.length; ++i) {
                if (mode.devices[i].id === request.payload.id) {
                  deviceIndex = i;
                  break;
                }
              }
              mode.devices.splice(deviceIndex, 1);
              modes.update({_id: new ObjectID(mode._id)}, {$set: {devices: mode.devices}}, (err) => {
                if (err)
                  return response({status: false, error: 'Database error'}).code(500);

                remove();
              });
            }, (err) => {
              if (err)
                return response({status: false, error: err}).code(500);

              remove();
            });
          } else {
            remove();
          }
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  controlDevice: (request, response) => {
    if (request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        ObjectID = request.server.plugins['hapi-mongodb'].ObjectID,
        devices = db.collection('devices'),
        payload = request.payload;

      devices.findOne({_id: new ObjectID(payload.id)}, (err, device) => {
        if (err)
          return response({status: false, error: 'Database error'}).code(500);

        if (device === null)
          return response({status: false, error: 'Could not find device with ID ' + payload.id}).code(500);

        let sendObj = {
          "action": "send",
          "code": {
            "protocol": [device.device.protocol],
            "id": device.device.id,
            "unit": device.device.unit
          }
        };

        if (payload.on)
          sendObj.code.on = 1;
        else
          sendObj.code.off = 1;

        request.server.plugins.pilight.send(sendObj);

        return response({status: true}).code(200);

      });

    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  }
};

module.exports = handlers;
