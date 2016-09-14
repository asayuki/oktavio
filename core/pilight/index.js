'use strict';
const
  net = require('net'),
  socket = new net.Socket();

exports.register = (plugin, options, next) => {
  /*
   * onReceive
   * Takes a json-message and logs it in console stringified.
   */
  const onReceive = (message) => {
    if (process.env.APP_DEBUG === 'true') {
      console.log('Pilight received:', JSON.stringify(message));
    }
  };

  /*
   * send
   * Stringify json message and send it to socket.
   */
  const send = (message) => {
    if (socket) {
      socket.write(JSON.stringify(message) + '\n', 'utf8');
      return true;
    } else {
      return false;
    }
  };

  /*
   * onBeat
   * Beat!
   */
  const onBeat = () => {
    Beat();
  };

  /*
   * Beat
   * Send a heartbeat to socket every 5 seconds.
   */
  const Beat = () => {
    let beatTimeout = null;
    let sendBeat = () => {
      if (socket) {
        try {
          socket.write('HEART\n', 'utf8');
        } catch (error) {
          if (error) {
            console.log('Error:', error);
          }

          beatTimeout = setTimeout(() => {
            Beat();
          }, 5000);
        }
      } else {
        return false;
      }
    };

    sendBeat();
  };

  /*
   * createConnection
   * Creates the connection to the socket.
   */
  const createConnection = () => {
    socket.connect(process.env.PILIGHT_PORT, process.env.PILIGHT_HOST);
  };

  // On connect
  // Send a identify message to socket
  socket.on('connect', () => {
    /* eslint-disable quotes */
    send({
      "action": "identify",
      "options": {
        "receiver": 1,
        "config": 1
      },
      "uuid": "0000-d0-63-00-000000"
    });
    /* eslint-enable quotes */
  });

  // On close
  // Try and create a new connection
  socket.on('close', () => {
    socket.destroy();

    console.log('Connection to Pilight Daemon failed. Please wait while we try to establish a connection again.');

    setTimeout(() => {
      createConnection();
    }, 5000);
  });

  // On error
  // Do nothing.
  socket.on('error', () => {});

  // On data
  // Go through the buffer and try and parse the message.
  socket.on('data', ((that) => {
    let buffer = '';

    return (data) => {
      let messages, jsonMessage, reference;

      buffer += data.toString().replace(/\0/g, '');

      if (buffer[buffer.length - 2] === '\n' || buffer[buffer.length - 1] === '\n') {
        messages = buffer.slice(0, -1);
        reference = messages.split('\n');

        [].slice.call(reference).forEach((ref) => {
          jsonMessage = null;
          if (ref.length !== 0) {
            if (ref === 'BEAT') {
              onBeat();
            } else {
              try {
                jsonMessage = JSON.parse(ref);
              } catch (error) {
                console.log('Error in parsing Pilight response:', error, 'in "', ref, '"');
              }

              if (jsonMessage !== null) {
                onReceive(jsonMessage);
              }
            }
          }
        });

        buffer = '';
        return;
      }
    };
  })(socket));

  /*
   * Expose the send action so other plugins can use it.
   */
  plugin.expose('send', (action) => {
    send(action);
  });

  createConnection();

  next();

};

exports.register.attributes = {
  name: 'pilight',
  version: '2.0.0',
  description: 'Pilight coreplugin for Oktav.io',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
