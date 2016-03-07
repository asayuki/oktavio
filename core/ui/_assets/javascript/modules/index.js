'use strict';
/* jshint undef: false, unused: false */
(() => {
  const
    nw = new Network(),
    devicesElem = document.querySelector('.fn-devices');

  const toggleDevice = (that, e) => {
    e.preventDefault();

    that.classList.toggle('on');


    nw.go({
      type: 'POST',
      url: '/api/devices/control',
      json: true,
      params: JSON.stringify({
        id: that.getAttribute('data-id'),
        on: (that.getAttribute('data-state') === 'true') ? false : true
      })
    }, (err, result) => {
      if (err)
        // Show error
        return;

      that.setAttribute('data-state', (that.getAttribute('data-state') === 'true') ? false : true);

      return;
    });
  };

  nw.go({
    type: 'GET',
    url: '/api/devices',
    json: true
  }, (err, devices) => {
    if (err)
      // Show error
      return;

    [].slice.call(devices.devices).forEach((device) => {
      let
        item = document.createElement('li'),
        itemName = document.createElement('span'),
        itemToggle = document.createElement('span');

      itemToggle.innerHTML = 'Toggle';
      itemName.innerHTML = device.name;

      if (device.current_state) {
        itemToggle.classList.add('on');
      }

      itemToggle.classList.add('toggle-device');
      itemToggle.setAttribute('data-id', device._id);
      itemToggle.setAttribute('data-state', device.current_state);
      itemToggle.addEventListener('click', toggleDevice.bind(null, itemToggle), false);

      item.appendChild(itemName);
      item.appendChild(itemToggle);

      devicesElem.appendChild(item);
    });
  })

})();
