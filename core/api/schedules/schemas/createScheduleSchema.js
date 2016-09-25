'use strict';

const Joi = require('joi');

const createScheduleSchema = Joi.object({
  weekDay: Joi.string().valid(['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).required(),
  time: Joi.number().required(),
  type: Joi.string().valid(['device', 'mode']).required(),
  typeId: Joi.string().required(),
  state: Joi.boolean().when('type', {is: 'device', then: Joi.required(), otherwise: Joi.optional()})
});

module.exports = createScheduleSchema;
