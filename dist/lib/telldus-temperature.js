'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var telldus = require('telldus');
var TelldusAccessory = require('./telldus-accessory');
var RateLimiter = require('limiter').RateLimiter;
/**
 * An Accessory convenience wrapper.
 */

var TelldusTemperature = function (_TelldusAccessory) {
  _inherits(TelldusTemperature, _TelldusAccessory);

  /**
   * Inject everything used by the class. No the neatest solution, but nice for
   * testing purposes, and avoiding globals as we don't know anything about
   * Service, Characteristic and other Homebridge things that are injected
   * into exported provider function.
   *
   * @param  {object}  data       The object representation of the device.
   * @param  {hap.Log} log        The log to use for logging.
   * @param  {API}     homebridge The homebridge API, with HAP embedded
   * @param  {object}  config     Configuration object passed on from initial
   *                              instantiation.
   */
  function TelldusTemperature(data, log, homebridge, config, db) {
    _classCallCheck(this, TelldusTemperature);

    var _this = _possibleConstructorReturn(this, (TelldusTemperature.__proto__ || Object.getPrototypeOf(TelldusTemperature)).call(this, data, log, homebridge, config));

    _this.id = "sensor" + data.id;
    _this.service = new _this.Service.TemperatureSensor(_this.name);
    _this.db = db;

    _this.service.addCharacteristic(_this.Characteristic.CurrentRelativeHumidity);

    // Should work with negative values
    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).props.minValue = -50;

    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).on('get', _this.getCurrentTemperature.bind(_this));

    _this.service.getCharacteristic(_this.Characteristic.CurrentRelativeHumidity).on('get', _this.getCurrentHumidity.bind(_this));

    _this.meta.setCharacteristic(_this.Characteristic.Model, "TemperatureSensor");

    _this.limiter = new RateLimiter(1, 30 * 1000); //limit to once ever 30s

    return _this;
  }

  /**
   * Get the temperatur
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */


  _createClass(TelldusTemperature, [{
    key: 'getCurrentTemperature',
    value: function getCurrentTemperature(callback) {
      var _this2 = this;

      this.log("Getting temperature...");

      telldus.getSensors(function (err, sensors) {
        if (!!err) callback(err, null);
        var temperaturSensor = sensors.find(function (sensor) {
          return "sensor" + sensor.id === _this2.id;
        });
        var temperature = temperaturSensor.data.find(function (data) {
          return data.type === "TEMPERATURE";
        }).value;
        _this2.log("Temperatur is: " + temperature);
        callback(null, parseFloat(temperature));
      });
    }

    /**
    * Get the humidity
    *
    * @param  {Function}           callback       To be invoked when result is
    *                                             obtained.
    */

  }, {
    key: 'getCurrentHumidity',
    value: function getCurrentHumidity(callback) {
      var _this3 = this;

      this.log("Getting humidity...");

      telldus.getSensors(function (err, sensors) {
        if (!!err) callback(err, null);
        var temperaturSensor = sensors.find(function (sensor) {
          return "sensor" + sensor.id === _this3.id;
        });
        var humidity = temperaturSensor.data.find(function (data) {
          return data.type === "HUMIDITY";
        }).value;
        _this3.log("Humidity is: " + humidity);
        callback(null, parseFloat(humidity));
      });
    }
  }, {
    key: 'respondToEvent',
    value: function respondToEvent(type, value) {
      var _this4 = this;

      this.limiter.removeTokens(1, function () {
        if (type == 1) {
          _this4.log('Got temperatur update: ' + value + ' for ' + _this4.name);
          _this4.service.getCharacteristic(_this4.Characteristic.CurrentTemperature).setValue(parseFloat(value));
          var datetime = new Date().toISOString();
          _this4.db.run('INSERT INTO sensor(sensor_id, type , datetime, value)\n                     VALUES(' + _this4.id + ', \'temperatur\', date(\'' + datetime + '), ' + value + '\')');
        } else {
          _this4.log('Got humidity update: ' + value + ' for ' + _this4.name);
          _this4.service.getCharacteristic(_this4.Characteristic.CurrentRelativeHumidity).setValue(parseFloat(value));
        }
      });
    }
  }]);

  return TelldusTemperature;
}(TelldusAccessory);

module.exports = TelldusTemperature;