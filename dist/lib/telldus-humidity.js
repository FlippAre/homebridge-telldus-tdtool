'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var telldus = require('telldus');
var TelldusAccessory = require('./telldus-accessory');
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
  function TelldusTemperature(data, log, homebridge, config) {
    _classCallCheck(this, TelldusTemperature);

    var _this = _possibleConstructorReturn(this, (TelldusTemperature.__proto__ || Object.getPrototypeOf(TelldusTemperature)).call(this, data, log, homebridge, config));

    _this.id = "humsensor" + data.id;
    _this.service = new _this.Service.HumiditySensor(_this.name);

    _this.service.getCharacteristic(_this.Characteristic.CurrentRelativeHumidity).on('get', _this.getCurrentHumidity.bind(_this));

    _this.meta.setCharacteristic(_this.Characteristic.Model, "HumiditySensor");

    var listener = telldus.addSensorEventListener(_this.listenToHumidity.bind(_this));

    return _this;
  }

  /**
   * Get the temperatur
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */


  _createClass(TelldusTemperature, [{
    key: 'getCurrentHumidity',
    value: function getCurrentHumidity(callback) {
      var _this2 = this;

      this.log("Getting humidity...");

      telldus.getSensors(function (err, sensors) {
        if (!!err) callback(err, null);
        var humiditySensor = sensors.find(function (sensor) {
          return "humsensor" + sensor.id === _this2.id;
        });
        var humidity = humiditySensor.data.find(function (data) {
          return data.type === "HUMIDITY";
        }).value;
        _this2.log("Humidity is: " + humidity);
        callback(null, parseFloat(humidity));
      });
    }
  }, {
    key: 'listenToHumidity',
    value: function listenToHumidity(deviceId, protocol, model, type, value, timestamp) {
      if ("humsensor" + deviceId == this.id && type == 2) {
        this.log('Got humidity update: ' + value + ' for ' + this.name);
        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity).setValue(parseFloat(value));
      }
    }
  }]);

  return TelldusTemperature;
}(TelldusAccessory);

module.exports = TelldusTemperature;