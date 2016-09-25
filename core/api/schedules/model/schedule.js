'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const scheduleModel = new Schema({
  weekDay: {
    type: String,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  typeId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  state: {
    type: Boolean
  }
});

scheduleModel.index({
  weekDay: 'text',
  time: 1
});

module.exports = Mongoose.model('Schedule', scheduleModel);
