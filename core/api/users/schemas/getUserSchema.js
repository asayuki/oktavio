'use strict';

const Joi = require('joi');

const getUserSchema = Joi.alternatives().try(
  Joi.string().alphanum().min(2).max(30).required(),
  Joi.string().email().required()
);

module.exports = getUserSchema;
