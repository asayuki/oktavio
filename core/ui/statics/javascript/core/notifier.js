(function (window) {
  'use strict';

  var notifications = (function () {
    var classes = {
      'prompt': {
        'container': 'notifier-prompt'
      },
      'notification': {
        'container': 'notifier'
      }
    };

    /**
     * Check if notifications container exists, if not create.
     *
     * @return {Object}
     */
    function checkAndCreateContainer (type) {
      if (document.querySelector('.' + classes[type].container) === null)
        return createContainer(type);
      else
        return document.querySelector('.' + classes[type].container);
    }

    /**
     * Create container and add container to DOM
     *
     * @return {Object};
     */
    function createContainer (type) {
      var div = document.createElement('div');

      div.classList.add(classes[type].container);
      document.querySelector('body').appendChild(div);

      return div;
    }

    /**
     * Get container for type
     *
     * @return {Object}
     */
    function getContainer (type) {
      var container = document.querySelector('.' + classes[type].container);
      if (container === null)
        return false;
      else
        return container;
    }

    /**
     * Remove notification from container
     * And remove container if it does not contain any more notifications
     */
    function removeNotification (notification, container) {
      notification.classList.remove('notification');
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

    // Notifications API
    return {
      closeAll: function (type) {
        var container = getContainer(type);
        if (container) {
          [].forEach.call(container.children, function (child) {
            try {
              child.classList.remove('notification');
              container.removeChild(child);
            } catch (e) {}
          });

          try {
            container.parentNode.removeChild(container);
          } catch (e) {}
        }
      },

      createNotification: function (type, text, timer) {
        var
          container       = checkAndCreateContainer('notification'),
          div             = document.createElement('div'),
          textTitle       = document.createElement('p');
        container.appendChild(div);

        // Add title to notification
        textTitle.innerHTML = text;
        textTitle.classList.add('notification-title');
        div.appendChild(textTitle);

        // Eventlisterner on click to remove
        div.addEventListener('click', removeNotification.bind(null, div, container), false);

        // Set classed after 100ms, or it will not have that smooth feeling.
        setTimeout(function () {
          div.classList.add(type, 'notification');
        }, 100);

        // If timer is set, remove notification after @timer ms
        if (typeof timer !== 'undefined' && timer !== 0) {
          setTimeout(function () {
            removeNotification(div, container);
          }, timer);
        }
      },

      createPrompt: function (text, callback) {
        var
          container       = checkAndCreateContainer('prompt'),
          div             = document.createElement('div'),
          textTitle       = document.createElement('p'),
          textField       = document.createElement('textarea'),
          buttonContainer = document.createElement('div'),
          saveButton      = document.createElement('button'),
          cancelButton    = document.createElement('button');

        // Set buttontexts & classes
        saveButton.innerHTML = 'Ok';
        saveButton.classList.add('save');
        cancelButton.innerHTML = 'Cancel';
        cancelButton.classList.add('cancel');

        // Add buttons to their container
        buttonContainer.classList.add('btn-container');
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);

        // Add title to prompt
        textTitle.innerHTML = text;
        textTitle.classList.add('notification-title');
        div.appendChild(textTitle);

        // Add textfield to prompt
        div.appendChild(textField);

        // Add buttonContainer to prompt
        div.appendChild(buttonContainer);

        // Add prompt to container
        container.appendChild(div);

        // Add eventlisteners for save and cancel buttons
        saveButton.addEventListener('click', function (e) {
          e.preventDefault();
          var textValue = textField.value;
          removeNotification(div, container);
          setTimeout(function () {
            callback(textField.value);
          }, 500);
        });

        cancelButton.addEventListener('click', function (e) {
          e.preventDefault();
          removeNotification(div, container);
          setTimeout(function () {
            callback(null);
          }, 500);
        });

        // Set classes after 100ms, or it will not have that smooth feeling.
        setTimeout(function () {
          div.classList.add('prompt', 'notification');
        }, 100);
      }
    };
  })();

  /**
   * Notifier public API
   *
   * @return {Object}
   */
  function Notifier () {
    return {
      prompt: function (text, callback) {
        notifications.createPrompt(text, callback);
      },

      success: function (text, timer) {
        notifications.createNotification('success', text, timer);
      },

      error: function (text, timer) {
        notifications.createNotification('error', text, timer);
      },

      message: function (text, timer) {
        notifications.createNotification('message', text, timer);
      },

      closeAllNotifications: function () {
        notifications.closeAll('notification');
      },

      closeAllPrompts: function () {
        notifications.closeAll('prompt');
      }
    };
  }

  /*
   * Boot it up
   */
  var notifier = new Notifier();

  // CommonJS
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = notifier;
  // AMD
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return notifier;
    });
  // Window
  } else if (!window.notifier) {
    window.notifier = notifier;
  }

})(typeof window !== 'undefined' ? window : this);
