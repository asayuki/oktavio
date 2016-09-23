'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const deviceModel = new Schema({
  name: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  protocol: {
    type: String,
    required: true
  },
  unit_code: {
    type: Number,
    required: true
  },
  unit_id: {
    type: Number,
    required: true
  },
  state: {
    type: Boolean,
    required: true
  },
  schedule: [{
    monday: [Schema.Types.Mixed],
    tuesday: [Schema.Types.Mixed],
    wednesday: [Schema.Types.Mixed],
    thursday: [Schema.Types.Mixed],
    friday: [Schema.Types.Mixed],
    saturday: [Schema.Types.Mixed],
    sunday: [Schema.Types.Mixed]
  }]
});

deviceModel.index({
  name: 'text'
});

module.exports = Mongoose.model('Device', deviceModel);
