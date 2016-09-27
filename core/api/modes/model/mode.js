'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const modeModel = new Schema({
  name: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  devices: [{
    id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    state: {
      type: Boolean,
      required: true
    }
  }]
});

modeModel.index({
  name: 'text'
});

module.exports = Mongoose.model('Mode', modeModel);
