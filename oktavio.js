'use strict';
require('dotenv').load();

const
  hapi = require('hapi'),
  handlebars = require('handlebars'),
  handlebarsLayout = require('handlebars-layout'),
  catbox = require('catbox-redis'),
  vision = require('vision'),
  inert = require('inert'),
  good = require('good'),
  Joi = require('joi'),
  //fs = require('fs'),
  //http2 = require('http2'),
  htmlEngine = handlebars.create(),
  swaggerOpt = {
    info: {
      title: 'Test API documentation',
      version: '1.0'
    },
    pathPrefixSize: 2
  },
  plugins = [],
  reporters = {},
  oktavio = new hapi.Server({
    cache: [{
      name: 'oktavioCache',
      engine: catbox,
      host: (process.env.REDIS_HOST) ? process.env.REDIS_HOST : '127.0.0.1',
      port: (process.env.REDIS_PORT) ? process.env.REDIS_PORT : 6379,
      password: process.env.REDIS_PASSWORD,
      partition: process.env.REDIS_PARTITION
    }]
  });

let
  mongoURL = null;

// Setup connectionstrings for MongoDB
if (process.env.MONGO_USER && process.env.MONGO_PASSWORD)
  mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@' + (process.env.MONGO_HOST ? process.env.MONGO_HOST : '127.0.0.1') + ':' + (process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017') + '/' + process.env.MONGO_DB;
else
  mongoURL = 'mongodb://' + (process.env.MONGO_HOST ? process.env.MONGO_HOST : '127.0.0.1') + ':' + (process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017') + '/' + process.env.MONGO_DB;

// Register engine for Handlebars
handlebarsLayout.register(htmlEngine);

/*
// Register http2
let listener = http2.createServer({
  key: fs.readFileSync(process.env.CERTIFICATES_DIR + 'example.com.key'),
  cert: fs.readFileSync(process.env.CERTIFICATES_DIR + 'example.com.crt')
});
if (!listener.address) {
  listener.address = function () {
    return this._server.address();
  }
}
listener.getConnections = function (cb) {
  process.nextTick(() => {
    cb(null, this._server._connections);
  })
};*/

// Setup host and port for application
oktavio.connection({
  //listener: listener,
  //tls: true,
  host: (process.env.APP_HOST) ? process.env.APP_HOST : 'localhost',
  port: (process.env.APP_PORT) ? process.env.APP_PORT : 8000
});

// Register viewspath
oktavio.register(vision, (err) => {
  if (err)
    throw err;

  oktavio.views({
    engines: {
      html: {
        module: htmlEngine,
        isCached: (process.env.APP_PRODUCTION === 'true') ? true : false
      }
    },
    compileMode: 'sync',
    relativeTo: __dirname,
    path: __dirname + '/core/ui/views',
    layoutPath: __dirname + '/core/ui/views',
    partialsPath: __dirname + '/core/ui/views'
  });
});

// Enable API Documentation
if (process.env.APP_PRODUCTION !== 'true') {
  plugins.push({register: require('hapi-swagger'), options: swaggerOpt});
}

// Add plugins and error reporters to list to register
plugins.push(inert);

if (process.env.APP_PRODUCTION === 'true' || process.env.APP_TESTING === 'true') {
  reporters.console = [{module: 'good-console', args: [{ error: '*' }]}, 'stdout'];
} else {
  reporters.console = [{module: 'good-console', args: [{ error: '*', response: '*'}]}, 'stdout'];
}

plugins.push({register: good, options: {ops: false, reporters: reporters}});
plugins.push({register: require('hapi-mongodb'), options: {url: mongoURL, settings: { db: {'native_parser': false}}}});
plugins.push({register: require('hapi-auth-cookie')});
plugins.push({register: require('hapi-auth-jwt')});

plugins.push({
  register: require('hapi-users-plugin'),
  options: {
    collection: 'users',
    session: true,
    token: true,
    session_private_key: 'ihugyuftdiwjerou234h52ökwemr23ASFDSGer63ergHTFHTR',
    cache_name: 'oktavioCache',
    extra_fields: {
      firstname: Joi.string().min(2).max(30),
      lastname: Joi.string().min(2).max(30)
    }
  }
});

plugins.push({register: require('./core/devices')});
plugins.push({register: require('./core/modes')});
plugins.push({register: require('./core/ui')});
plugins.push({register: require('./core/pilight')});


let startServer = () => {
  oktavio.start(() => {
    if (process.env.APP_TESTING === 'true') {
      oktavio.plugins.users.testUser(oktavio.plugins['hapi-mongodb'], (error) => {
        if (error) {
          throw error;
        }
        process.env.APP_STARTED = true;
      });
    } else {
      process.env.APP_STARTED = true;
      if (process.env.APP_PRODUCTION !== 'true') {
        console.log('oktavio started at:', oktavio.info.uri);
      }
    }
  });
  oktavio.on('request-internal', (request, event, tags) => {
    if (tags.error && tags.state) {
      console.log('Stateerror', event);
    }
  });
};

oktavio.register(plugins, (error) => {
  if (error) {
    throw error;
  }

  startServer();
});

module.exports = oktavio;
