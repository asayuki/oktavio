'use strict';

const Joi = require('joi');

const createDeviceSchema = Joi.object({
  name: Joi.string().required(),
  protocol: Joi.string().required(),
  unit_code: Joi.number().required(),
  unit_id: Joi.number().required(),
  state: Joi.boolean().default(false)
});

module.exports = createDeviceSchema;
