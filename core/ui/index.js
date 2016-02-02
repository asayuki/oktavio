'use strict';

exports.register = (plugin, options, next) => {

  plugin.route([
    {
      method: 'GET',
      path: '/',
      config: {
        handler: (request, response) => {
          if (request.auth.isAuthenticated) {
            response.view('index');
          } else {
            response.redirect('/login');
          }
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
        }
      }
    },
    {
      method: 'GET',
      path: '/login',
      config: {
        handler: (request, response) => {
          if (!request.auth.isAuthenticated) {
            response.view('login');
          } else {
            response.redirect('/');
          }
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {redirectTo: false},
        }
      }
    },
    {
      method: 'GET',
      path: '/js/{path*}',
      config: {
        handler: {
          directory: {
            path: './core/ui/js'
          }
        },
        id: 'adminjs'
      }
    },
  ]);

  next();
};

exports.register.attributes = {
  'name': 'ui',
  'version': '1.0.0',
  'description': 'ui plugin',
  'main': 'index.js',
  'author': 'neme <neme@whispered.se>',
  'license': 'MIT'
};
