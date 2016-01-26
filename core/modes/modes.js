'use strict';
const
  jwt = require('jsonwebtoken'),
  passwordHash = require('password-hash'),
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
    }
  },

  updateMode: (request, response) => {

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
            return response({status: false, error: 'Databse error'}).code(500);

          return response({status: true, modeRemoved: true}).code(200);
        });
      });
    } else {
      return response({status: false, notAuthenticated: true}).code(403);
    }
  },

  addDeviceToMode: (request, response) => {

  },

  removeDeviceFromMode: (request, response) => {

  }

};

module.exports = handlers;
