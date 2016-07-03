'use strict';

exports.register = (plugin, options, next) => {

  plugin.route([
    /**
     * Statics
     */
    {
      method: 'GET',
      path: '/statics/{path*}',
      config: {
        handler: {
          directory: {
            path: './core/ui/statics'
          }
        },
        id: 'statics',
        state: {
          parse: true,
          failAction: 'ignore'
        }
      }
    },

    /**
     * Loginpage
     */
    {
      method: 'GET',
      path: '/login',
      config: {
        handler: (request, response) => {
          if (request.auth.isAuthenticated) {
            return response.redirect('/');
          }

          return response.view('login/login');
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        state: {
          parse: true,
          failAction: 'ignore'
        }
      }
    },

    /**
     * Dashboard
     */
    {
      method: 'GET',
      path: '/',
      config: {
        handler: (request, response) => {
          if (!request.auth.isAuthenticated) {
            return response.redirect('/login');
          }

          return response.view('pages/index', {page: {context: 'index'}});
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        state: {
          parse: true,
          failAction: 'ignore'
        }
      }
    },

    /**
     * Devices
     */
    {
      method: 'GET',
      path: '/devices',
      config: {
        handler: (request, response) => {
          if (!request.auth.isAuthenticated) {
            return response.redirect('/login');
          }

          return response.view('pages/devices', {page: {context: 'devices'}});
        },
        auth: {
          mode: 'try',
          strategies: ['session']
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        },
        state: {
          parse: true,
          failAction: 'ignore'
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  'name': 'ui',
  'version': '2.0.0',
  'description': 'UI plugin for Oktavio',
  'main': 'index.js',
  'author': 'neme <neme@whispered.se>',
  'license': 'MIT'
};
