'use strict';

const Joi = require('joi');

const scheduleDaySchema = Joi.object({}).pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/, Joi.object({
  state: Joi.boolean()
}));

const scheduleSchema = {
  monday: scheduleDaySchema,
  tuesday: scheduleDaySchema,
  wednesday: scheduleDaySchema,
  thursday: scheduleDaySchema,
  friday: scheduleDaySchema,
  saturday: scheduleDaySchema,
  sunday: scheduleDaySchema
};

const updateDeviceSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  protocol: Joi.string(),
  unit_code: Joi.number(),
  unit_id: Joi.number(),
  state: Joi.boolean(),
  schedule: Joi.object(scheduleSchema).optional().description('Default will be targeted everyday if set, otherwise it will check into days object and see if that day has a state it should activate.')
});

module.exports = updateDeviceSchema;
