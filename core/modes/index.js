'use strict';
const
  Joi = require('joi'),
  handlers = require('./modes');

exports.register = (plugin, options, next) => {

  plugin.route([
    {

    }
  ]);

  next();

};

exports.register.attributes = {
  name: 'modes',
  version: '1.0.0',
  description: 'Modes coreplugin',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
