'use strict';

exports.register = (plugin, options, next) => {

  plugin.route([
    {
      method: 'GET',
      path: '/',
      config: {
        handler: (request, response) => {
          if (request.auth.isAuthenticated) {

            var modes=[{_id:"56e555de9bd4c710ea153f87",name:"all off",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]},{_id:"56e556739bd4c710ea153f88",name:"special",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]},{_id:"56e5567f9bd4c710ea153f89",name:"cinema",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]},{_id:"56e55a97dc705080ea5619d4",name:"nightmode",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]},{_id:"56e55a9fdc705080ea5619d5",name:"music",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]},{_id:"56e55aa6dc705080ea5619d6",name:"trance",icon:"nothing",devices:[{id:"56e555529bd4c710ea153f84",on:!0},{id:"56e555609bd4c710ea153f85",on:!0},{id:"56e5556b9bd4c710ea153f86",on:!0}]}];

            response.view('index', {modes: modes});
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
      path: '/statics/{path*}',
      config: {
        handler: {
          directory: {
            path: './core/ui/statics'
          }
        },
        id: 'statics'
      }
    }
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
