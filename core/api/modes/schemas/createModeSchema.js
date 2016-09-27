'use strict';

const Joi = require('joi');

const createModeSchema = Joi.object({
  name: Joi.string().required(),
  devices: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    state: Joi.boolean().required()
  })).required()
});

module.exports = createModeSchema;
