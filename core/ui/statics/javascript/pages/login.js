requirejs(['../core/network', '../core/notifier'], function (network, notifier) {
  var loginForm = document.querySelector('form#login-form');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    notifier.closeNotifications();

    var
      username = loginForm.querySelector('input[name="username"]').value,
      password = loginForm.querySelector('input[name="password"]').value;

    if (username === '') {
      return notifier.message('You need to fill out "Username"');
    }

    if (password === '') {
      return notifier.message('You need to fill out "Password"');
    }

    network.go({
      type: 'POST',
      url: '/api/users/login',
      json: true,
      params: JSON.stringify({username: username, password: password})
    }, function (error, result) {

      if (error || typeof result.error !== 'undefined') {
        return notifier.error({
          text: (typeof result.error !== 'undefined') ? result.error : 'There was some kind of error, please try again.'
        });
      }

      window.location = '/';
    });
  });
});
