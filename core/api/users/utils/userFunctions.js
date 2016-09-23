'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt');
const User = require('../model/user');

function verifyUniqueUser (request, response) {
  User.findOne({
    $or: [
      {email: request.payload.email},
      {username: request.payload.username}
    ]
  }, (error, user) => {
    if (user) {
      if (user.username === request.payload.username) {
        return response(Boom.badRequest('Username taken'));
      }
      if (user.email === request.payload.email) {
        return response(Boom.badRequest('Email taken'));
      }
    }

    return response(request.payload);
  });
}

function verifyUserExists (request, response) {
  User.findById(request.payload.id, (error, user) => {
    if (error) {
      return response(Boom.badImplementation('Error while fetching user'));
    }

    if (user === null) {
      return response(Boom.badRequest('User does not exist'));
    }

    return response(request.payload);
  });
}

function verifyCredentials (request, response) {
  const password = request.payload.password;
  User.findOne({
    $or: [
      {email: request.payload.email},
      {username: request.payload.username}
    ]
  }, (error, user) => {
    if (user !== null) {
      Bcrypt.compare(password, user.password, (passwordError, isValid) => {
        if (isValid) {
          return response(user);
        } else {
          return response(Boom.badRequest('Incorrect password.'));
        }
      });
    } else {
      return response(Boom.badRequest('Incorrect username or email.'));
    }
  });
}

function hashPassword(password, callback) {
  Bcrypt.genSalt(10, (error, salt) => {
    Bcrypt.hash(password, salt, (error, hash) => {
      return callback(error, hash);
    });
  });
}

module.exports = {
  verifyUniqueUser: verifyUniqueUser,
  verifyCredentials: verifyCredentials,
  verifyUserExists: verifyUserExists,
  hashPassword: hashPassword
};
