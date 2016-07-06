requirejs(['../core/network', '../core/notifier', '/socket.io/socket.io.js', '../vendor/highlight.min'], function (network, notifier, io, highlight) {

  highlight.initHighlightingOnLoad();

  var
    socket = io('/debug'),
    debugListElem = document.querySelector('.fn-debug-list'),
    enterMessageElem = document.querySelector('.fn-enter-message'),
    fullsizeMessageElem = document.querySelector('.fn-fullsize-message'),
    convertProtocols = {
      'arctech_switch_old': 'kaku_switch_old'
    };

  enterMessageElem.querySelector('input').addEventListener('click', function (ev) {
    ev.preventDefault();

    if (fullsizeMessageElem.classList.contains('open')) {
      fullsizeMessageElem.classList.remove('open');
    } else {
      openFullsizeMessage(this.getAttribute('value'));
    }
    // Toggle a 'popup' that makes the JSON in the input easier to edit
  });

  enterMessageElem.querySelector('.fn-send-message').addEventListener('click', function (ev) {
    ev.preventDefault();

    // Send message to pilight
  });


  /**
   * Get messages from Pilight
   * @param {Lots}
   * Example: {"message":{"id":1,"unit":0,"state":"off"},"origin":"receiver","protocol":"arctech_switch_old","uuid":"0000-b8-27-eb-ab49f3","repeats":3}
   */
  socket.on('debugMsg', function (msgObj) {
    var
      item = document.createElement('li'),
      icon = document.createElement('i'),
      msg = document.createElement('pre');
      code = document.createElement('code');

    code.innerHTML = JSON.stringify(msgObj);
    msg.appendChild(code);

    highlight.highlightBlock(msg);

    //msg.innerHTML = highlight.highlightAuto(JSON.stringify(msgObj));
    item.appendChild(msg);

    item.addEventListener('click', selectMessage.bind(null, msgObj));

    debugListElem.appendChild(item);
  });

  /**
   * Select message and place it in input
   * @param {Object} itemObj
   */
  function selectMessage (itemObj) {
    enterMessageElem.querySelector('input').value = JSON.stringify(itemObj);
    enterMessageElem.querySelector('input').setAttribute('value', JSON.stringify(itemObj));
  }

  /**
   * Open up fullsize message and fill all the form-stuffies
   */
  function openFullsizeMessage (obj) {
    fullsizeMessageElem.classList.add('open');

    var objJSON = JSON.parse(obj);

    var deviceElem = fullsizeMessageElem.querySelector('#deviceid');
    var unitElem = fullsizeMessageElem.querySelector('#unitid');

    console.log(objJSON);

    deviceElem.value = objJSON.message.id;
    unitElem.value = objJSON.message.unit;
    

  }
});
