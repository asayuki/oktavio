'use strict';

const Joi = require('joi');

const updateUserSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().alphanum().min(2).max(30),
  email: Joi.string().email(),
  password: Joi.string()
});

module.exports = updateUserSchema;
