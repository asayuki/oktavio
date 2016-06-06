'use strict';
const
  net = require('net'),
  socket = new net.Socket();

exports.register = (plugin, options, next) => {

  const createConnection = () => {
    socket.connect(process.env.PILIGHT_PORT, process.env.PILIGHT_HOST);
  };

  createConnection();

  // Fix error handeling
  //socket.on('error', (error) => {
  //  setTimeout(() => {
  //    console.log('Wait while we try again.');
  //  }, 2000);
  //});

  socket.on('connect', () => {
    sayHello();
    startHeartbeat();
  });

  socket.on('close', () => {
    socket.destroy();
    createConnection();
  });

  socket.on('data', ((that) => {
    let buffer = '';
    return (data) => {
      let messages, e, i, jsonMsg, len, msg, ref;
      buffer += data.toString().replace(/\0/g, '');
      if (buffer[buffer.length - 2] === '\n' || buffer[buffer.length -1] === '\n') {
        messages = buffer.slice(0, -1);
        ref = messages.split('\n');
        for (i = 0, len = ref.length; i < len; i++) {
          msg = ref[i];
          if (msg.length !== 0) {
            if (msg === 'BEAT') {
              onBeat();
            } else {
              jsonMsg = null;
              try {
                jsonMsg = JSON.parse(msg);
              } catch (err) {
                console.log('Error in parsing Pilight response:', err, 'in "', msg, '"');
              }
              if (jsonMsg !== null) {
                onReceive(jsonMsg);
              }
            }
          }
        }
        return buffer = '';
      }
    };
  })(socket));

  const sayHello = () => {
    send({
      "action": "identify",
      "options": {
        "config":1
      },
      "uuid":"0000-d0-63-00-000000"
    });
  };

  const onReceive = (message) => {
    //console.log('Pilight Received:', JSON.stringify(message));
  };

  const onBeat = () => {
    startHeartbeat();
  };

  const send = (message) => {
    if (socket) {
      socket.write(JSON.stringify(message) + "\n", 'utf8');
      return true;
    } else {
      return false;
    }
  };

  const startHeartbeat = () => {
    let heartbeatTimeout = null;
    let sendHeartbeat = () => {
      if (socket) {
        try {
          socket.write("HEART\n", 'utf8');
        } catch (err) {
          if (err)
            console.log('Err:', err);

          heartbeatTimeout = setTimeout(() => {
            sendHeartbeat();
          }, 5000);
        }
      } else {
        return false;
      }
    };
    heartbeatTimeout = setTimeout(() => {
      sendHeartbeat();
    }, 5000);
  };

  /*
   * Exposes
   */
  plugin.expose('send', (action) => {
    send(action);
  });

  next();

};

exports.register.attributes = {
  name: 'pilight',
  version: '1.0.0',
  description: 'Pilight coreplugin',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
