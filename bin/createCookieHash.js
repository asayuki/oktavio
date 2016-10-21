'use strict';

function makeHash () {
  let hash = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++ ) {
    hash += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return hash;
}

console.log(makeHash());
