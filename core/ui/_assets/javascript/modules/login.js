'use strict';
/* jshint undef: false, unused: false */
(function () {
  var loginForm = document.querySelector('form#loginform');
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    notifier.closeAllNotifications();

    var
      username = loginForm.querySelector('input[name="username"]').value,
      password = loginForm.querySelector('input[name="password"]').value;

    if (username === '')
      return notifier.message('Empty username');

    if (password === '')
      return notifier.message('Empty password');

    network.go({
      type: 'POST',
      url: '/api/session',
      json: true,
      params: JSON.stringify({username: username, password: password, session: true})
    }, function (err, result) {
      if (err || (typeof result.error !== 'undefined'))
        return notifier.error((typeof result.error !== 'undefined') ? result.error : err);

      window.location = '/';
    });
  });
})();
