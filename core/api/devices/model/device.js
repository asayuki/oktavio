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
  }
});

deviceModel.index({
  name: 'text'
});

module.exports = Mongoose.model('Device', deviceModel);
