'use strict';
/* jshint undef: false, unused: false */
(() => {
  const nw = new Network();
  const loginForm = document.querySelector('form#loginform');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let
      username = loginForm.querySelector('input[name="username"]').value,
      password = loginForm.querySelector('input[name="password"]').value;

    if (username === '') {
      console.log('Tomt användarnamn');
      return;
    }

    if (password === '') {
      console.log('Tomt lösenord');
      return;
    }

    nw.go({
      type: 'POST',
      url: '/api/session',
      json: true,
      params: JSON.stringify({username: username, password: password, session: true})
    }, (err, result) => {
      console.log(err);
      console.log(result);
    });

  });
})();
