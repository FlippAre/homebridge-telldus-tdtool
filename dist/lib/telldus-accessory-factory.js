'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TelldusDimmer = require('./telldus-dimmer');
var TelldusSwitch = require('./telldus-switch');
var TelldusDoor = require('./telldus-door');
var TelldusTemperature = require('./telldus-temperature');

var TelldusAccessoryFactory = function TelldusAccessoryFactory(data, log, homebridge, config) {
  _classCallCheck(this, TelldusAccessoryFactory);

  var configuredAccessory = config.accessories.find(function (a) {
    return a.id === data.id && a.type === data.type;
  });
  if (configuredAccessory && configuredAccessory.model) {
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
      return new TelldusDoor(data, log, homebridge, config);
    case 'temperaturehumidity':
      if (configuredAccessory.id == data.id) {
        data.name = configuredAccessory.name;
        return new TelldusTemperature(data, log, homebridge, config);
      }
    default:

  }
};

module.exports = TelldusAccessoryFactory;