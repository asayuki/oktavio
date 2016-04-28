'use strict';
/* jshint undef: false, unused: false */
/* global document, network */
(function () {
  function toggleDevice(id, state, toggle) {
    network.go({
      type: 'POST',
      url: '/api/devices/control',
      params: JSON.stringify({id: id, on: state}),
      json: true
    }, function (err, res) {
      console.log(res);
    });
  }

  var deviceList = document.querySelector('.fn-devices');
  var modesList = document.querySelector('.fn-modes');

  network.go({
    url: '/api/devices/html'
  }, function (err, res) {
    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = res;

    [].slice.call(tmpDiv.querySelectorAll('.retro-toggle-container')).forEach(function (toggle) {
      deviceList.appendChild(toggle);
      var toggleId = toggle.getAttribute('data-id');
      toggle.querySelector('label[for="d' + toggleId + 'off"]').addEventListener('click', toggleDevice.bind(null, toggleId, false, toggle));
      toggle.querySelector('label[for="d' + toggleId + 'on"]').addEventListener('click', toggleDevice.bind(null, toggleId, true, toggle));
    });
  });

  network.go({
    url: '/api/modes/html'
  }, function (err, res) {
    modesList.innerHTML = res;
  });

})();
