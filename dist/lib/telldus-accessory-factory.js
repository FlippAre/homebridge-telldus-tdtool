'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TelldusDimmer = require('./telldus-dimmer');
var TelldusSwitch = require('./telldus-switch');
var TelldusDoor = require('./telldus-door');
var TelldusTemperature = require('./telldus-temperature');
var TelldusHumidity = require('./telldus-humidity');

var TelldusAccessoryFactory = function () {
  function TelldusAccessoryFactory(log, config, homebridge, db) {
    _classCallCheck(this, TelldusAccessoryFactory);

    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.db = db;
  }

  _createClass(TelldusAccessoryFactory, [{
    key: 'build',
    value: function build(rawAccessory) {
      var configuredAccessory = this.config.accessories.find(function (a) {
        return a.id === rawAccessory.id && a.type === rawAccessory.type;
      });
      if (configuredAccessory && configuredAccessory.model) {
        this.model = configuredAccessory.model;
      } else {
        var modelPair = rawAccessory.model ? rawAccessory.model.split(':') : ['N/A', 'N/A'];
        this.model = modelPair[0];
      }

      switch (this.model) {
        case 'selflearning-dimmer':
          return new TelldusDimmer(rawAccessory, this.log, this.homebridge, this.config, this.db);
          break;
        case 'codeswitch':
        case 'selflearning-switch':
          return new TelldusSwitch(rawAccessory, this.log, this.homebridge, this.config);
          break;
        case 'door':
          return new TelldusDoor(rawAccessory, this.log, this.homebridge, this.config);
          break;
        case 'temperaturehumidity':
          console.log('temperaturehumidity');
          if (configuredAccessory) {
            rawAccessory.name = configuredAccessory.name;
            var telldusTemperature = new TelldusTemperature(rawAccessory, this.log, this.homebridge, this.config, this.db);
            //let telldusHumidity = new TelldusHumidity(rawAccessory, this.log, this.homebridge, this.config)
            return telldusTemperature;
          }
          break;
        default:
          return null;
          break;
      }
      return null;
    }
  }]);

  return TelldusAccessoryFactory;
}();

module.exports = TelldusAccessoryFactory;