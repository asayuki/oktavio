const Boom = require('boom');
const Schedule = require('./model/schedule');

module.exports = {
  /**
   * Create schema
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
  }
};
