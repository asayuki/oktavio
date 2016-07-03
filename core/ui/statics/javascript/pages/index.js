requirejs(['../core/network', '../core/notifier'], function (network, notifier) {

  var
    numOnDevicesElem = document.querySelector('.fn-active-devices'),
    numTotalDevicesElem = document.querySelector('.fn-total-devices'),
    numModesElem = document.querySelector('.fn-total-modes'),
    activeModeElem = document.querySelector('.fn-active-mode');

  network.go({
    type: 'GET',
    url: '/api/modes/active',
    json: true
  }, function (error, activeMode) {
    if (error) {
      return notifier.error({
        text: 'Something bad happend'
      });
    }
    numModesElem.innerHTML = activeMode.numModes;
    activeModeElem.innerHTML = activeMode.mode.name;
  });

  network.go({
    type: 'GET',
    url: '/api/devices/active',
    json: true
  }, function (error, activeDevices) {
    if (error) {
      return notifier.error({
        text: 'Something bad happend'
      });
    }

    numOnDevicesElem.innerHTML = activeDevices.numOnDevices;
    numTotalDevicesElem.innerHTML = activeDevices.numDevices;

  });
});
