(function (window) {
  'use strict';

  var notifications = (function () {
    var classes = {
      'notification': {
        'container': 'notifier'
      }
    };

    /**
     * Get container with specified container class, or create it.
     * @param {string} type - Which type of classtype
     * @param {Boolean} create - If set to true it will create container if it does not exist
     * @return {Object|Boolean} - Returns container if it exists or create is true, otherwise false.
     */
    function getContainer (type, create) {
      var container = document.querySelector('.' + classes[type].container);

      if (container === null) {
        if (create) {
          container = document.createElement('div');

          container.classList.add(classes[type].container);
          document.querySelector('body').appendChild(container);
        } else {
          return false;
        }
      }

      return container;
    }

    /**
     * Remove notification from container
     * @param {Object} - Notification DOM element
     * @param {Object} - Container DOM element
     */
    function removeNotification (notification, container) {
      notification.classList.add('remove');
      setTimeout(function () {
        try {
          container.removeChild(notification);
        } catch (e) {}

        if (container.children.length === 0) {
          try {
            container.parentNode.removeChild(container);
          } catch (e) {}
        }
      }, 500);
    }

    /**
     * Create nofification
     * @param {Object} options - Options for notification
     * @param {string} options.type - Which type of notification
     * @param {string} options.text - Text for notification
     * @param {string} options.title - Optional if you want a title
     * @param {number} options.timer - Optional if you want notification to be autoremoved after x milliseconds
     */
    function createNotification (options) {
      var
        containerElem     = getContainer('notification', true),
        notificationElem  = document.createElement('div'),
        textElem          = document.createElement('p');

      notificationElem.classList.add('notification');
      containerElem.appendChild(notificationElem);

      // Add title if specified
      if (typeof options.title !== 'undefined' && options.title !== '') {
        var titleElem = document.createElement('p');
        titleElem.classList.add('notification-title');
        titleElem.innerHTML = options.title;
        notificationElem.appendChild(titleElem);
      }

      // Add text to notification
      textElem.innerHTML = options.text;
      textElem.classList.add('notification-text');
      notificationElem.appendChild(textElem);

      // Add eventlistener on click to remove
      notificationElem.addEventListener('click', removeNotification.bind(null, notificationElem, containerElem));

      // Add class to notification after a few ms, or it will not have a smooth feeling
      setTimeout(function () {
        notificationElem.classList.add(options.type);
      }, 100);

      // Set timer if specified
      if (typeof options.timer !== 'undefined' && options.timer > 0) {
        setTimeout(function () {
          removeNotification(notificationElem, containerElem);
        });
      }
    }

    /**
     * Close all
     * @param {string} Type - Which type of notification
     */
    function closeAll (type) {
      var container = getContainer(type);
      if (container) {
        try {
          container.parentNode.removeChild(container);
        } catch (e) {}
      }
    }


    // Notifications API
    return {
      createNotification: function (options) {
        createNotification(options);
      },

      closeNotifications: function () {
        closeAll('notification');
      }
    };

  })();

  /**
   * Notifier API
   */
  function Notifier () {
    return {
      success: function (options) {
        options.type = 'success';
        notifications.createNotification(options);
      },

      error: function (options) {
        options.type = 'error';
        notifications.createNotification(options);
      },

      message: function (options) {
        options.type = 'message';
        notifications.createNotification(options);
      },
      closeNotifications: function () {
        notifications.closeNotifications();
      }
    };
  }

  var notifier = new Notifier();

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = notifier;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return notifier;
    });
  } else if (!window.notifier) {
    window.notifier = notifier;
  }

})(typeof window !== 'undefined' ? window : this);
