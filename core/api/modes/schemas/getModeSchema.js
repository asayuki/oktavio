'use strict';

const Joi = require('joi');

const getModeSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = getModeSchema;
