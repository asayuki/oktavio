'use strict';

const Joi = require('joi');

const getScheduleSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = getScheduleSchema;
