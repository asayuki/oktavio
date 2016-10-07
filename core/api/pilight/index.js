'use strict';
const Net = require('net');
const Socket = Net.Socket();

exports.register = (server, options, next) => {
  /**
   * onReceive
   * Takes a JSON-Message and logs it in console.
   */
  const onReceive = (message) => {
    if (process.env.DEBUG) {
      console.log(`Pilight received: ${JSON.stringify(message)}`);
    }
  };

  /**
   * sendMessage
   */
  const sendMessage = (message) => {
    if (Socket.readyState === 'open') {
      Socket.write(JSON.stringify(message) + '\n', 'utf8');
      return true;
    } else {
      return (process.env.TESTING) ? true : false;
    }
  };

  /**
   * beat
   * Send new beat
   */
  const beat = () => {
    let beatTimeout = null;
    let sendBeat = () => {
      if (Socket.readyState === 'open') {
        try {
          Socket.write('HEART\n', 'utf8');
        } catch (error) {
          if (error) {
            console.log(`Error: ${error}`);
          }

          beatTimeout = setTimeout(() => {
            beat();
          }, 5000);
        }
      } else {
        return false;
      }
    };

    sendBeat();
  };

  /**
   * createConnection
   * Creates a connection to Pilight Daemon
   */
  const createConnection = () => {
    Socket.connect(process.env.PILIGHT_PORT, process.env.PILIGHT_HOST);
  };

  // On connect
  Socket.on('connect', () => {
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
  Socket.on('close', () => {
    Socket.destroy();

    console.log('Connection to Pilight Daemon failed. Trying to reconnect in a second or five.');

    setTimeout(() => {
      createConnection();
    }, 5000);
  });

  // On error
  Socket.on('error', () => {});

  // On data
  Socket.on('data', ((that) => {
    let buffer = '';

    return (data) => {
      let messages = null;
      let jsonMessage = null;
      let reference = null;

      buffer += data.toString().replace(/\0/g, '');

      if (buffer[buffer.length - 2] === '\n' || buffer[buffer.length - 1] === '\n') {
        messages = buffer.slice(0, -1);
        reference = messages.split('\n');

        reference.forEach((ref) => {
          jsonMessage = null;
          if (ref.length !== 0) {
            if (ref === 'BEAT') {
              beat();
            } else {
              try {
                jsonMessage = JSON.parse(ref);
              } catch (error) {
                console.log(`Error in parsing Pilight response: ${error} in ${ref}`);
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
  })(Socket));

  server.expose('send', (action, callback) => {
    callback(sendMessage(action));
  });

  if (!process.env.TESTING) {
    createConnection();
  }

  next();
};

exports.register.attributes = {
  name: 'pilight',
  version: '3.0.0',
  description: 'Pilight plugin for Oktav.IO',
  main: 'index.js',
  author: 'neme <neme@whispered.se>',
  license: 'MIT'
};
