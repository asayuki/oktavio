'use strict';
const Boom = require('boom');
const Schedule = require('./model/schedule');

module.exports = {
  /**
   * Create schedule
   * @param {Object} request.payload
   * @param {String} request.payload.weekDay
   * @param {Integer} request.payload.time
   * @param {String} request.payload.type
   * @param {String} request.payload.typeId
   * @param {Boolean} request.payload.state
   */
  createSchedule: (request, response) => {
    let schedule = new Schedule();

    schedule.weekDay = request.payload.weekDay;
    schedule.time = request.payload.time;
    schedule.type = request.payload.type;
    schedule.typeId = request.payload.typeId;

    if (request.payload.type === 'device') {
      schedule.state = request.payload.state;
    }

    schedule.save((scheduleError, newSchedule) => {
      if (scheduleError) {
        return response(Boom.badImplementation('Could not create schedule'));
      }

      return response({
        scheduleCreated: true,
        scheduleId: newSchedule._id
      }).code(201);
    });
  },

  /**
   * Update schedule
   * @param {Object} request.payload
   * @param {String} request.payload.id
   * @param {String} request.payload.weekDay
   * @param {Integer} request.payload.time
   * @param {String} request.payload.type
   * @param {String} request.payload.typeId
   * @param {Boolean} request.payload.state
   */
  updateSchedule: (request, response) => {
    let updateId = request.payload.id;
    delete request.payload.id;

    Schedule.update({_id: updateId}, {$set: request.payload}, (error, schedule) => {
      if (error) {
        return response(Boom.badImplementation('Could not update schedule'));
      }

      return response({
        scheduleUpdated: true
      }).code(200);
    });
  },

  /**
   * Get schedule
   * @param {Object} request.params
   * @param {String} request.params.id
   * @return {Object} response.schedule
   */
  getSchedule: (request, response) => {
    Schedule.findById(request.params.id, (error, schedule) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch schedule'));
      }
      if (schedule === null) {
        return response(Boom.notFound('Could not find schedule'));
      }

      return response({schedule: schedule});
    });
  },

  /**
   * Get schedules
   * @param {Object} request.query
   * @param {String} request.query.from
   * @param {Integer} request.query.limit
   * @return {Array} response.schedules
   */
  getSchedules: (request, response) => {
    let query = {};
    if (typeof request.query.from !== 'undefined') {
      query._id = {
        $gt: request.query.from
      };
    }

    Schedule.find(query)
    .limit((request.query.limit ? parseInt(request.query.limit) : 20))
    .select('-__v').exec((error, schedules) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch schedules'));
      }

      return response({schedules: schedules}).code(200);
    });
  },

  /**
   * Delete schedule
   * @param {Object} request.payload
   * @param {String} request.payload.id
   */
  deleteSchedule: (request, response) => {
    Schedule.findByIdAndRemove(request.payload.id, (error) => {
      if (error) {
        return response(Boom.badImplementation('Error while removing schedule'));
      }

      return response({
        scheduleRemoved: true
      }).code(200);
    });
  }

};
