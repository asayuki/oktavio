'use strict';

const Joi = require('joi');

const deleteDeviceSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = deleteDeviceSchema;
