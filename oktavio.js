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
  inquirer = require('inquirer'),
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

// Setup host and port for application
oktavio.connection({
  host: (process.env.APP_HOST) ? process.env.APP_HOST : '127.0.0.1',
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
        isCached: (process.env.APP_PRODUCTION === 'true') ? process.env.APP_PRODUCTION : false
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
if (process.env.API_DOCUMENTATION)
  plugins.push({register: require('hapi-swagger'), options: swaggerOpt});

// Add plugins and error reporters to list to register
plugins.push(inert);

if (process.env.APP_PRODUCTION === 'true' || process.env.APP_TESTING === 'true')
  reporters.console = [{module: 'good-console', args: [{ error: '*' }]}];
else
  reporters.console = [{module: 'good-console', args: [{ error: '*', response: '*'}]}];

plugins.push({register: good, options: {reporters: reporters}});
plugins.push({register: require('hapi-mongodb'), options: {url: mongoURL, settings: { db: {'native_parser': false}}}});
plugins.push({register: require('hapi-auth-cookie')});
plugins.push({register: require('hapi-auth-jwt')});

// Add core plugins
plugins.push({register: require('./core/login')});
plugins.push({register: require('./core/users')});
plugins.push({register: require('./core/devices')});
plugins.push({register: require('./core/modes')});
plugins.push({register: require('./core/ui')});

if (process.env.PILIGHT_DONTLOAD !== 'true')
  plugins.push({register: require('./core/pilight')});


let startServer = () => {
  oktavio.start(() => {
    if (process.env.APP_TESTING === 'true') {
      oktavio.plugins.users.testUser(oktavio.plugins['hapi-mongodb'], (err) => {
        if (err)
          throw err;

        process.env.APP_STARTED = true;
      });
    } else {
      process.env.APP_STARTED = true;
      if (process.env.APP_PRODUCTION !== 'true')
        console.log('oktavio started at:', oktavio.info.uri);
    }
  });
};

oktavio.register(plugins, (err) => {
  if (err)
    throw err;

  if (process.env.APP_TESTING === 'true') {
    startServer();
  } else {
    oktavio.plugins.users.fetchNumberOfUsers(oktavio.plugins['hapi-mongodb'], (count) => {
      if (count >= 1) {
        startServer();
      } else {
        inquirer.prompt([
          {
            type: 'input',
            name: 'username',
            message: 'Username for the new user:',
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password for the new user:',
          }
        ]).then((userObj) => {
          oktavio.plugins.users.createUser(oktavio.plugins['hapi-mongodb'], userObj, (err) => {
            if (err)
              throw err;

            startServer();
          });
        });
      }
    });
  }
});

module.exports = oktavio;
