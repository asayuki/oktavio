'use strict';

const Joi = require('joi');

const updateModeSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  devices: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    state: Joi.boolean().required()
  }))
});

module.exports = updateModeSchema;
