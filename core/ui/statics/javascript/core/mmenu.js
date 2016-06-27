(function (window) {
  function Mmenu () {

    var
      hamburgler = document.querySelector('.fn-hamburgler'),
      menu = document.querySelector('.main-menu');

    if (hamburgler !== null && menu !== null) {
      hamburgler.addEventListener('click', function (e) {
        e.preventDefault();

        menu.classList.toggle('visible');
      });
    }

  }

  var mmenu = new Mmenu();

  // CommonJS
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = mmenu;
  // AMD
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return mmenu;
    });
  // Window
  } else if (!window.mmenu) {
    window.mmenu = mmenu;
  }

})(typeof window !== 'undefined' ? window : this);
