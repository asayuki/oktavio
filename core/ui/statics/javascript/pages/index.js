requirejs(['../core/network', '../core/notifier'], function (network, notifier) {

  /**
   * Load page
   */
  var loadPage = function (page) {
    console.log('Load:', page);
  };


  var pages = document.querySelectorAll('input[name="pages"]');
  pages.forEach(function (page) {
    page.addEventListener('change', function (ev) {
      loadPage(ev.srcElement.getAttribute('data-load'));
    });
  });
});
