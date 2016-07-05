requirejs(['../core/network', '../core/notifier', '/socket.io/socket.io.js'], function (network, notifier, io) {
  var
    deviceListElem = document.querySelector('.fn-device-list'),
    deviceTemplate = document.querySelector('#deviceTemplate').innerHTML;

  function toggleDevice (id, event) {

    console.log(id);
    console.log(event.target.checked);

    network.go({
      type: 'PUT',
      url: '/api/devices',
      json: true,
      params: JSON.stringify({id: id, state: event.target.checked})
    }, function (error, device) {
      console.log(device);
    });

  }

  network.go({
    type: 'GET',
    url: '/api/devices',
    json: true
  }, function (error, devices) {
    if (error) {
      return notifier.error({
        text: 'Something bad happend'
      });
    }

    var deviceItem = null;

    devices.devices.forEach(function (device) {
      // Create device item
      deviceItem = document.createElement('li');
      deviceItem.innerHTML = deviceTemplate;

      // Set device name
      deviceItem.querySelector('.fn-device-name').innerHTML = device.name;

      // Set some ids for checkbox and label
      var
        deviceInput = deviceItem.querySelector('input'),
        deviceLabel = deviceItem.querySelector('label');

      deviceInput.setAttribute('id', device._id);
      deviceLabel.setAttribute('for', device._id);

      // Set state
      if (device.state) {
        deviceInput.checked = true;
      }

      deviceInput.addEventListener('change', toggleDevice.bind(null, device._id));

      // Add device item to dom
      deviceListElem.appendChild(deviceItem);
    });
  });
});
