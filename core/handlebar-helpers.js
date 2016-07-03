var helpers   = null;

helpers = [
  {
    name: 'random',
    func: () => {
      return parseInt(Math.random() * 10000, 10);
    }
  },
  {
    name: 'or',
    func: (v1, v2) => {
      return v1 || v2;
    }
  },
  {
    name: 'not',
    func: (v1, v2) => {
      return v1 !== v2;
    }
  },
  {
    name: 'eq',
    func: (v1, v2) => {
      return v1 === v2;
    }
  },
  {
    name: 'smaller',
    func: (v1, v2) => {
      return v2 < (v1-1);
    }
  },
  {
    name: 'larger',
    func: (v1, v2) => {
      return v1 > v2;
    }
  },
  {
    name: 'and',
    func: (v1, v2) => {
      return v1 && v2;
    }
  },
  {
    name: 'ifvalue',
    func: (conditional, options) => {
      if (conditional == options.hash.equals) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  },
  {
    name: 'concat',
    func: (s1, s2) => {
      return s1 + '' + s2;
    }
  }
];

module.exports = helpers;
