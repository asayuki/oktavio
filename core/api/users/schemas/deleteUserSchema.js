'use strict';

const Joi = require('joi');

const deleteUserSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = deleteUserSchema;
