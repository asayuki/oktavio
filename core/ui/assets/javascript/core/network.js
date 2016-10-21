((window) => {

  class Network () {

    constructor (ops) {

      let request = new XMLHttpRequest();
      request.open(ops.type, ops.url, true);
      

    }

  }

})(typeof window !== 'undefined' ? window : this);
