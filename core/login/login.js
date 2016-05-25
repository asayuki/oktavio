'use strict';
const
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt');

module.exports = {

  /**
   * Create a session
   * @param {Object} request.params
   * @param {String} request.params.username
   * @param {String} request.params.password
   * @return {Object} response
   */
  session: (request, response) => {
    if (!request.auth.isAuthenticated) {
      let
        db = request.server.plugins['hapi-mongodb'].db,
        cache = request.server.plugins.login.getCache(),
        payload = request.payload;

      db.collection('users').findOne({username: payload.username.toLowerCase()}, (error, user) => {
        if (error) {
          return response({
            error: 'Database error.'
          }).code(500);
        }

        if (user === null) {
          return response({
            error: 'Username or Password is incorrect'
          }).code(401);
        }

        bcrypt.compare(payload.password, user.password, (error, res) => {
          if (error && !res) {
            return response({
              error: 'Username or Password is incorrect'
            }).code(401);
          }

          delete user.password;

          if (typeof payload.token !== 'undefined' && payload.token) {
            let token = jwt.sign({
              _id: user._id
            }, process.env.SESSION_PRIVATE_KEY, {
              expiresIn: '365d'
            });

            return response({
              token: token
            }).code(200);
          } else {

            let usersid = user.username.toLowerCase() + '' + user._id;

            cache.set(usersid, {
              account: user
            }, 0, (error) => {
              if (error) {
                return response({
                  error: 'Session failed.'
                }).code(500);
              }

              request.cookieAuth.set({
                sid: usersid
              });

              return response({
                loggedIn: true
              }).code(200);
            });
          }
        });
      });
    } else {
      return response({
        error: 'Already authenticated.'
      }).code(401);
    }
  },

  /**
   * Destroys a session
   * @return {Object} response
   */
  unsession: (request, response) => {
    let cache = request.server.plugins.login.getCache();
    if (request.auth.isAuthenticated) {
      cache.drop(request.auth.artifacts.sid, (error) => {
        if (error) {
          return response({
            error: 'Session failed.'
          }).code(500);
        }

        request.cookieAuth.clear();

        return response({
          loggedOut: true
        }).code(200);
      });
    } else {
      return response({
        error: 'Not authenticated.'
      }).code(401);
    }
  }
};
