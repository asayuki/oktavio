'use strict';

const Joi = require('joi');

const updateScheduleSchema = Joi.object({
  id: Joi.string().required(),
  weekDay: Joi.string().valid(['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  time: Joi.number(),
  type: Joi.string().valid(['device', 'mode']),
  typeId: Joi.string(),
  state: Joi.boolean().when('type', {is: 'device', then: Joi.required(), otherwise: Joi.optional()})
});

module.exports = updateScheduleSchema;
