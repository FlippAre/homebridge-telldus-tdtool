'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TelldusDimmer = require('./telldus-dimmer');
var TelldusSwitch = require('./telldus-switch');
var TelldusDoor = require('./telldus-door');

var TelldusAccessoryFactory = function TelldusAccessoryFactory(data, log, homebridge, config) {
  _classCallCheck(this, TelldusAccessoryFactory);

  var configuredAccessory = config.accessories.find(function (a) {
    return a.name === data.name;
  });
  if (configuredAccessory) {
    this.model = configuredAccessory.model;
  } else {
    var modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A'];
    this.model = modelPair[0];
  }

  switch (this.model) {
    case 'selflearning-dimmer':
      return new TelldusDimmer(data, log, homebridge, config);
      break;
    case 'codeswitch':
    case 'selflearning-switch':
      return new TelldusSwitch(data, log, homebridge, config);
      break;
    case 'door':
      console.log("door");
      return new TelldusDoor(data, log, homebridge, config);
    default:

  }
};

module.exports = TelldusAccessoryFactory;