'use strict';
const
  jwt = require('jsonwebtoken'),
  passwordHash = require('password-hash');

const handlers = {
  session: (request, response) => {
    let
      db = request.server.plugins['hapi-mongodb'].db,
      payload = request.payload,
      cache = request.server.plugins.login.getCache();

    db.collection('users').findOne({username: payload.username}, (err, user) => {
      if (err)
        return response().code(500);

      if (user !== null) {
        if (passwordHash.verify(payload.password, user.password)) {
          delete user.password;
          if (payload.session) {
            cache.set(user.username + '' + user._id, {
              account: user
            }, 0, (cacheErr) => {
              if (cacheErr)
                return response({status: false}).code(500);

              request.cookieAuth.set({
                sid: user.username + '' + user._id
              });
              return response({status: true}).code(200);
            });
          } else {
            let token = jwt.sign({_id: user._id}, process.env.SESSION_PRIVATE_KEY, { expiresIn: '30d'});
            return response({status: true, token: token}).code(200);
          }
        } else {
          return response({status: false, error: 'Username or Password is invalid'}).code(403);
        }
      } else {
        return response({status: false, error: 'Username or Password is invalid'}).code(403);
      }
    });
  },

  unsession: (request, response) => {
    let cache = request.server.plugins.login.getCache();
    if (request.auth.isAuthenticated) {
      cache.drop(request.auth.artifacts.sid, (err) => {
        if (err)
          return response({status: false, error: 'Something went wrong'}).code(500);

        request.cookieAuth.clear();
        return response({status: true}).code(200);
      });
    } else {
      return response({status: false}).code(403);
    }
  }
};

module.exports = handlers;
