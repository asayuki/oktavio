requirejs(['../core/network', '../core/notifier'], (network, notifier) => {
  let loginForm = document.querySelector('form#login-form');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    let
      username = loginForm.querySelector('input[name="username"]').value,
      password = loginForm.querySelector('input[name="password"]').value;

    if (username === '') {
      return;
    }

    if (password === '') {
      return; // Notify
    }

    network.go({
      type: 'POST',
      url: '/api/users/login',
      json: true,
      params: JSON.stringify({username: username, password: password})
    }, (error, result) => {

      console.log(error, result);

      if (error || typeof result.error !== 'undefined') {
        console.log(error);
        console.log(result.error);
        return notifier.error(result.error); // Notify
      }

      //window.location = '/';
    });
  });
});
