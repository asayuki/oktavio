'use strict';

const Boom = require('boom');
const Device = require('../../devices/model/device');
//const Modes = require('../../modes/model/mode');

function verifyDeviceExists (request, response) {
  if (request.payload.type === 'device') {
    Device.findById(request.payload.typeId, (error, user) => {
      if (error) {
        return response(Boom.badImplementation('Error while fetching device'));
      }

      if (user === null) {
        return response(Boom.badRequest('Device does not exist'));
      }

      return response(request.payload);
    });
  } else {
    return response(request.payload);
  }
}

module.exports = {
  verifyDeviceExists: verifyDeviceExists
};
