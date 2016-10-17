'use strict';
define([], () => {

  const login = {
    init: () => {
      const loginForm = document.querySelector('form.login-form');

      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let username = loginForm.querySelector('input[name="username"]').value;
        let password = loginForm.querySelector('input[name="password"]').value;

        if (username === '' || password === '') {
          return false;
        }


        fetch('/api/users/login', {
          method: 'post',
          body: JSON.stringify({
            username: username,
            password: password
          })
        }).then((response) => {
          console.log(response);
        });
      });
    }
  };

  return login;

});
