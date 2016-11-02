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
          credentials: "same-origin",
          body: JSON.stringify({
            username: username,
            password: password
          })
        }).then((response) => {
          if (response.ok) {
            window.location = '/';
          } else {
            console.log('Resp not ok');
            // Show error
          }
        }).catch(function (error) {
          console.log('Oh god, why');
          // Show error
        });
      });
    }
  };

  return login;

});
