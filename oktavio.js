'use strict';
if (!process.env.SKIP_DOTENV) {
  require('dotenv').load();
}

const Hapi = require('hapi');
const Mongoose = require('mongoose');
const Oktavio = new Hapi.Server({
  cache: [{
    name: 'oktavioCache',
    engine: require('catbox-redis'),
    host: (process.env.REDIS_HOST) ? process.env.REDIS_HOST : '127.0.0.1',
    port: (process.env.REDIS_PORT) ? process.env.REDIS_PORT : 6379,
    password: process.env.REDIS_PASSWORD,
    partition: process.env.REDIS_PARTITION
  }]
});

Oktavio.connection({
  host: process.env.HOST,
  port: process.env.PORT
});

// Note: add good-logger aswell
Oktavio.register([
  require('inert'),
  require('hapi-auth-cookie'),
  require('hapi-auth-jwt'),
  require('vision'),
  require('./core/api/users'),
  require('./core/api/devices'),
  require('./core/api/modes'),
  require('./core/api/schedules'),
  require('./core/api/pilight'),
  require('./core/ui')
], (error) => {
  if (error) {
    throw error;
  }

  Oktavio.views({
    engines: {
      jade: require('pug')
    },
    path: __dirname + '/core/ui/views',
    compileOptions: {
      pretty: true
    }
  });

  Oktavio.start((oktavioError) => {
    if (oktavioError) {
      throw oktavioError;
    }

    if (process.env.TESTING) {
      process.env.COMMENCE_TESTING = true;
    }

    console.log(`Oktav.IO started at: ${Oktavio.info.uri}`);

    Mongoose.connect(process.env.MONGO_URL + process.env.MONGO_DB, {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS
    }, (dbError) => {
      if (dbError) {
        throw dbError;
      }
    });
  });
});

module.exports = Oktavio;
