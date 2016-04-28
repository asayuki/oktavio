var extend = function ( defaults, options ) {
  var extended = {};
  var prop;
  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop];
    }
  }
  for (prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      extended[prop] = options[prop];
    }
  }
  return extended;
};


(function (window) {

  var defaults = {
    type: 'GET'
  };

  function Network () {
    return {
      go: function (options, callback) {
        options = extend(defaults, options);
        var request = new XMLHttpRequest();
        request.open(options.type, options.url, true);
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            if (request.status === 200 || request.status === 201) {
              var response = '';
              try {
                response = JSON.parse(request.responseText);
              } catch (e) {}
              if (typeof response === 'object') {
                callback(null, response);
              } else {
                callback(null, request.responseText);
              }
            } else {
              callback(true, false);
            }
          }
        };

        if (options.json) {
          request.setRequestHeader('Accept', 'application/json');
          request.setRequestHeader('Content-Type', 'application/json');
        }

        if (typeof options.headers !== 'undefined' && options.headers !== null) {
          for (var key in options.headers) {
            if (options.headers.hasOwnProperty(key)) {
              request.setRequestHeader(key, options.headers[key]);
            }
          }
        }

        if (options.type === 'POST' || options.type === 'PUT') {
          request.send(options.params);
        } else {
          request.send();
        }

        return request;
      }
    };
  }

  var network = new Network();

  // CommonJS
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = network;
  // AMD
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return network;
    });
  // Window
  } else if (!window.network) {
    window.network = network;
  }

})(typeof window !== 'undefined' ? window : this);
