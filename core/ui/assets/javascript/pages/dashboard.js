'use strict';
define([], () => {

  function toggleDevice (state, id) {
    let toggleType = 'deactivate';

    if (state) {
      toggleType = 'activate';
    }

    fetch ('/api/devices/' + id + '/' + toggleType, {
      credentials: 'same-origin',
      method: 'post'
    }).then((response) => {
      if (!response.ok) {
        console.log('Resp not ok');
        // Show error
      }
    }).catch((error) => {
      console.log('Oh god, why');
      // Show error
    });
  }

  const dashboard = {
    init: () => {
      const deviceList = document.querySelector('.fn-device-list');
      fetch('/api/devices', {
        credentials: "same-origin"
      }).then((response) => {
        if (response.ok) {
          response.json().then(function (responseObj) {
            responseObj.devices.forEach((device) => {
              let item = document.createElement('li');
              let itemOn = document.createElement('button');
              let itemOff = document.createElement('button');
              let itemSeparator = document.createElement('span');

              itemOn.innerHTML = 'On';
              itemOff.innerHTML = 'Off';
              itemSeparator.innerHTML = ' / ';

              item.innerHTML = device.name + ' - ';
              item.appendChild(itemOn);
              item.appendChild(itemSeparator);
              item.appendChild(itemOff);

              itemOn.addEventListener('click', toggleDevice.bind(null, true, device._id));
              itemOff.addEventListener('click', toggleDevice.bind(null, false, device._id));

              deviceList.appendChild(item);
            });

          });
        } else {
          console.log('Resp not ok');
          // Show error
        }
      }).catch(function (error) {
        console.log('Oh god, why');
        // Show error
      });
    }
  };

  return dashboard;

});
