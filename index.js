(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function(require) {
      factory(require, require('exports'), require('module'))
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(require, exports, module);
  }
}(function (require, exports, module) {

  var validation = require('perspective-core').validation;

  function validateMessage(message) {
    try {
      message = JSON.parse(message);
    } catch (e) {
      return {errors: {json: "Could not parse json"}};
    }

    var errors = validation(message, {
      event: {
        required: true
      },
      channel: {
        required: true
      }
    });

    if (errors) {
      return errors;
    }

    return message;
  }

  var channels = {};

  function getCallback(channelString, event) {
    var channel = channels[channelString];

    if (!channel) {
      return null;
    }

    var callbacks = channel[event];
    if (!callbacks) {
      return null;
    }

    return callbacks;
  }

  function addCallbackToEventOnChannel(channelString, event, callback) {
    var channel = channels[channelString] = channels[channelString] || {};
    var callbacks = channel[event] =  channel[event] || [];

    if (typeof callback !== 'function') {
      return {errors: {callback: "Need to be a function"}};
    }

    var index = callbacks.indexOf(callback);
    if (index === 2) {
      return {errors: {callback: "Already exists"}};
    }

    callbacks.push(callback);
  }

  function removeCallbackForEventOnChannel(channelString, event, callback) {
    var channel = channels[channelString];
    if (!channel) return true;

    var callbacks = channel[event];
    if (!callbacks || callbacks.length === 0) return true;

    var index = callbacks.indexOf(callback);
    if (index === -1) return true;

    callbacks.splice(index, 1);

    return true;
  }

  function callCallbacksForMessage(message) {
    var message = validateMessage(message);
    if (message.errors) {
      return message.errors;
    }

    var callbacks = getCallback(message.channel, message.event);

    if (!callbacks)  {
      return {
        errors: {
          noListeners: "There where no listeners for event '" + message.event + "' on channel '" + message.channel + "'"
        }
      };
    }

    callbacks.forEach(function(callback) {
      callback(message);
    });
  }

  function createJSONString(channel, event, data) {
    var contextData = {channel: channel, event: event, data: data};
    return JSON.stringify(contextData);
  }

  module.exports = {
    createJSONString: createJSONString,
    callCallbacksForMessage: callCallbacksForMessage,
    addCallbackToEventOnChannel: addCallbackToEventOnChannel,
    removeCallbackForEventOnChannel: removeCallbackForEventOnChannel
  };

}));