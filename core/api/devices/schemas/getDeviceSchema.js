'use strict';

const Joi = require('joi');

const getDeviceSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = getDeviceSchema;
