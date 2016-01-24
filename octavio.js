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
  htmlEngine = handlebars.create(),
  swaggerOpt = {
    info: {
      version: '1'
    },
    pathPrefixSize: 2
  },
  plugins = [],
  reporters = [],
  octavio = new hapi.Server({
    cache: [{
      name: 'octavioCache',
      engine: catbox,
      host: (process.env.REDIS_HOST) ? process.env.REDIS_HOST : '127.0.0.1',
      port: (process.env.REDIS_PORT) ? process.env.REDIS_PORT : 6379,
      password: process.env.REDIS_PASSWORD,
      partition: process.env.REDIS_PARTITION
    }]
  });

/*
 * Register engine for Handlebars
 */
handlebarsLayout.register(htmlEngine);

/*
 * Setup host and port for application
 */
octavio.connection({
  host: (process.env.APP_HOST) ? process.env.APP_HOST : '127.0.0.1',
  port: (process.env.APP_PORT) ? process.env.APP_PORT : 8000
});

/*
 * Register viewspath
 */
octavio.register(vision, (err) => {
  if (err)
    throw err;

  octavio.views({
    engines: {
      html: {
        module: htmlEngine,
        isCached: (process.env.APP_PRODUCTION === 'true') ? process.env.APP_PRODUCTION : false
      }
    },
    compileMode: 'sync',
    relativeTo: __dirname,
    path: __dirname + '/ui',
    layoutPath: __dirname + '/ui',
    partialsPath: __dirname + '/ui'
  });
});

/*
 * Set up connectionstrings for MongoDB
 */
let mongoURL = null;
if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
  mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@' + (process.env.MONGO_HOST ? process.env.MONGO_HOST : '127.0.0.1') + ':' + (process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017') + '/' + process.env.MONGO_DB;
} else {
  mongoURL = 'mongodb://' + (process.env.MONGO_HOST ? process.env.MONGO_HOST : '127.0.0.1') + ':' + (process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017') + '/' + process.env.MONGO_DB;
}

/*
 * Add plugins and error reporters to list to register
 */
plugins.push(inert);

if (process.env.APP_PRODUCTION === 'true' || process.env.APP_TESTING === 'true') {
  reporters.push({reporter: require('good-file'), events: { error: '*' }, config: __dirname + 'octavo-error.log'});
} else {
  plugins.push({register: require('hapi-swagger'), options: swaggerOpt});
  reporters.push({reporter: require('good-console'), events: { error: '*', response: '*'}});
}

plugins.push({register: good, options: {reporters: reporters}});
plugins.push({register: require('hapi-mongodb'), options: {url: mongoURL, settings: { db: {'native_parser': false}}}});
plugins.push({register: require('hapi-auth-cookie')});
plugins.push({register: require('hapi-auth-jwt')});
plugins.push({register: require('./core/pilight')});
plugins.push({register: require('./core/login')});
plugins.push({register: require('./core/devices')});

octavio.register(plugins, (err) => {
  if (err)
    throw err;

  octavio.start(() => {
    process.env.APP_STARTED = true;
    if (process.env.APP_PRODUCTION !== 'true' && process.env.APP_TESTING !== 'true')
      console.log('OctavIO started at:', octavio.info.uri);
  });
})

module.exports = octavio;
