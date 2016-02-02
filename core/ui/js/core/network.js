'use strict';
/* jshint undef: false, unused: false */
class Network {
  constructor () {
    this.rc = new XMLHttpRequest();
    this.defaults = {type: 'GET'};
  }
  go (opt, callback) {
    let obj = Object.assign({}, this.defaults, opt);
    this.rc.open(obj.type, obj.url, true);
    this.rc.onreadystatechange = () => {
      if (this.rc.readyState === 4) {
        let response = '',
          responseStatus = (this.rc.status === 200 || this.rc.status === 201) ? false : true;
        try {
          response = JSON.parse(this.rc.responseText);
        } catch (e) {}
        if (typeof response == 'object') {
          callback(responseStatus, response);
        } else {
          callback(responseStatus, this.rc.responseText);
        }
      }
    };
    if (obj.json) {
      this.rc.setRequestHeader('Accept', 'application/json');
      this.rc.setRequestHeader('Content-Type', 'application/json');
    }
    if (typeof obj.headers !== 'undefined' && obj.headers !== null) {
      for (var key in obj.headers) {
        if (obj.headers.hasOwnProperty(key)) {
          this.rc.setRequestHeader(key, obj.headers[key]);
        }
      }
    }
    if (obj.type === 'POST' || obj.type === 'PUT') {
      this.rc.send(obj.params);
    } else {
      this.rc.send();
    }
  }
}
