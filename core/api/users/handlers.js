const Boom = require('boom');
const User = require('./model/user');
const hashPassword = require('./utils/userFunctions').hashPassword;

module.exports = {
  /**
   * Login
   * @param {Object} request.payload
   * @param {String} request.payload.username
   * @param {String} request.payload.password
   * @returns {Object} response
   * @returns {Boolean} response.loggedIn
   * @returns {String=} response.error
   */
  loginUser: (request, response) => {
    let cache = request.server.plugins.users.cache;
    let cacheId = request.pre.user.username.toLowerCase() + '' + request.pre.user._id;
    cache.set(cacheId, {
      account: request.pre.user
    }, 0, (error) => {
      if (error) {
        return response(Boom.badImplementation('Cache could not be set'));
      }

      request.cookieAuth.set({
        sid: cacheId
      });

      return response({
        loggedIn: true
      }).code(200);
    });
  },

  /**
   * Logout
   */
  logoutUser: (request, response) => {
    let cache = request.server.plugins.users.cache;
    if (request.auth.isAuthenticated) {
      cache.drop(request.auth.artifacts.sid, (error) => {
        if (error) {
          return response(Boom.badImplementation('Cache could not be dropped'));
        }

        request.cookieAuth.clear();

        return response({
          loggedOut: true
        }).code(200);
      });
    } else {
      return response({
        loggedOut: true
      }).code(200);
    }
  },

  /**
   * Create
   * @param {Object} request.payload
   * @param {String} request.payload.username
   * @param {String} request.payload.email
   * @param {String} request.payload.password
   * @returns {Object} response
   * @returns {Boolean} response.userCreated
   * @returns {String} response.userId
   */
  createUser: (request, response) => {
    let user = new User();
    user.email = request.payload.email;
    user.username = request.payload.username;

    hashPassword(request.payload.password, (error, hash) => {
      if (error) {
        return response(Boom.badImplementation('Could not create passwordhash, not save to continue'));
      }

      user.password = hash;

      user.save((userError, newUser) => {
        if (userError) {
          return response(Boom.badImplementation('Could not create user.'));
        }
        return response({
          userCreated: true,
          userId: newUser._id
        }).code(201);
      });
    });
  },

  /**
   * Update
   * @param {Object} request.payload
   * @param {Object} request.payload.id
   * @param {String} request.payload.username
   * @param {String} request.payload.email
   * @param {String} request.payload.password
   * @returns {Object} response
   * @returns {Boolean} response.userUpdated
   */
  updateUser: (request, response) => {
    function updateUser () {
      let updateId = request.payload.id;
      delete request.payload.id;

      User.update({_id: updateId}, {$set: request.payload}, (error, user) => {
        if (error) {
          return response(Boom.badImplementation('Could not update user.'));
        }

        return response({
          userUpdated: true
        }).code(200);
      });
    }

    if (typeof request.payload.password !== 'undefined') {
      hashPassword(request.payload.password, (error, hash) => {
        if (error) {
          return response(Boom.badImplementation('Could not create passwordhash, not save to continue'));
        }
        request.payload.password = hash;

        updateUser();
      });
    } else {
      updateUser();
    }
  },

  /**
   * Get user
   * @param {String} user
   * @returns {Object} response
   * @returns {Object} response.user
   */
  getUser: (request, response) => {
    User.findOne({
      $or: [
        {username: request.params.user},
        {email: request.params.user}
      ]
    }).select('-password -__v').exec((error, user) => {

      if (error) {
        return response(Boom.badImplementation('Could not fetch user.'));
      }
      if (!user) {
        return response(Boom.notFound('User does not exist.'));
      }
      return response({user: user}).code(200);
    });
  },
  /**
   * Get users
   * @param {Object} request.query
   * @param {String} request.query.from
   * @param {Integer} request.query.limit
   * @returns {Array} response.users
   */
  getUsers: (request, response) => {
    let query = {};

    if (typeof request.query.from !== 'undefined') {
      query._id = {
        $gt: request.query.from
      };
    }

    User.find(query)
    .limit((request.query.limit ? parseInt(request.query.limit) : 20))
    .select('-password -__v').exec((error, users) => {
      if (error) {
        return response(Boom.badImplementation('Could not fetch users.'));
      }

      return response({users: users}).code(200);
    });
  },
  /**
   * Delete
   * @param {Object} payload
   * @param {Object} payload.id
   * @return {Object} response
   * @return {Boolean} response.userDeleted
   */
  deleteUser: (request, response) => {
    User.findByIdAndRemove(request.payload.id, (error) => {
      if (error) {
        return response(Boom.badImplementation('Error while removing user'));
      }

      return response({
        userRemoved: true
      }).code(200);
    });
  }
};
