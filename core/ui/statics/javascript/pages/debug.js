requirejs(['../core/network', '../core/notifier', '/socket.io/socket.io.js'], function (network, notifier, io) {

  var
    socket = io('/debug'),
    debugMessages = [],
    debugList = document.querySelector('.fn-debug-list'),
    debugSwitchTemplate = document.querySelector('#debugSwitchTemplate').innerHTML;

  var item = null;
  socket.on('debugMsg', function (msg) {
    if (debugMessages.indexOf(JSON.stringify({unit: msg.message.unit, id: msg.message.id, protocol: msg.protocol})) === -1) {
      debugMessages.push(JSON.stringify({unit: msg.message.unit, id: msg.message.id, protocol: msg.protocol}));

      createItem(msg);


      /*item = document.createElement('li');
      item.innerHTML = debugTemplate;

      item.querySelector('.unit').innerHTML = msg.message.unit;
      item.querySelector('.id').innerHTML = msg.message.id;
      item.querySelector('.protocol').innerHTML = msg.protocol;

      debugList.appendChild(item);*/

    }
    console.log(debugMessages);
  });

  function createItem (itemObj) {
    var
      item = document.createElement('li'),
      template = null;


    if (typeof itemObj.message.state !== 'undefined') {
      template = debugSwitchTemplate;
    }

  }

});
