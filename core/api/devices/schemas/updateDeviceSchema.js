'use strict';

const Joi = require('joi');

const updateDeviceSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  protocol: Joi.string(),
  unit_code: Joi.number(),
  unit_id: Joi.number(),
  state: Joi.boolean()
});

module.exports = updateDeviceSchema;
