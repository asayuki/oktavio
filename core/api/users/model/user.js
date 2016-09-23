'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const userModel = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  username: {
    type: String,
    required: true,
    index: {
      unique:true
    }
  },
  password: {
    type: String,
    required: true
  }
});

userModel.index({ username: 'text', email: 'text' });

module.exports = Mongoose.model('User', userModel);
