'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TelldusAccessoryFactory = require('./lib/telldus-accessory-factory');
var telldus = require('telldus');
var TelldusDoor = require('./lib/telldus-door');
var TelldusTemperature = require('./lib/telldus-temperature');

/**
 * Platform wrapper that fetches the accessories connected to the
 * Tellstick via the CLI tool tdtool.
 */

var TelldusTDToolPlatform = function () {
  function TelldusTDToolPlatform(log, config, homebridge) {
    _classCallCheck(this, TelldusTDToolPlatform);

    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.telldusAccessoryFactory = new TelldusAccessoryFactory(log, config, homebridge);
  }

  _createClass(TelldusTDToolPlatform, [{
    key: 'accessories',
    value: function accessories(callback) {
      var _this = this;

      this.log('Loading devices...');
      telldus.getDevices(function (err, devices) {
        if (err) {
          console.log('Error: ' + err);
        } else {
          // The list of devices is returned
          var len = devices.length;
          _this.log('Found ' + (len || 'no') + ' item' + (len != 1 ? 's' : '') + ' of type "device".');
          telldus.getSensors(function (err, sensors) {
            if (err) {
              console.log('Error: ' + err);
            } else {
              var sensorLen = sensors.length;
              _this.log('Found ' + (sensorLen || 'no') + ' item' + (sensorLen != 1 ? 's' : '') + ' of type "sensors".');

              var rawAccessories = devices.concat(sensors.map(function (s) {
                s.type = 'SENSOR';
                return s;
              }));

              var telldusAccessories = rawAccessories.map(function (accessory) {
                return _this.telldusAccessoryFactory.build(accessory);
              }).filter(function (a) {
                return a != null;
              });
              _this.addEventListener(telldusAccessories);
              callback(telldusAccessories); //flatten)
            }
          });
        }
      });
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(telldusAccessories) {
      var listener = telldus.addRawDeviceEventListener(function (controllerId, data) {
        eventData = data.split(";").reduce(function (prev, property) {
          prev['' + property.split(":")[0]] = property.split(":")[1];
          return prev;
        }, {});

        if (eventData.class == "sensor") {
          eventData.id = 'sensor' + eventData.id;
        }

        a = telldusAccessories.find(function (accessory) {
          return accessory.id == eventData.id;
        });
        if (a instanceof TelldusDoor) {
          a.respondToEvent(eventData.state);
        } else if (a instanceof TelldusTemperature) {
          a.respondToEvent(eventData.temp);
        }
      });
    }
  }]);

  return TelldusTDToolPlatform;
}();

/*
 * Register the Telldus tdtool platform as this module.
 */


module.exports = function (homebridge) {
  homebridge.registerPlatform('homebridge-telldus-tdtool', "Telldus-TD-Tool", TelldusTDToolPlatform);
};