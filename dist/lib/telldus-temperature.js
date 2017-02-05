'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var telldus = require('telldus');
var TelldusAccessory = require('./telldus-accessory');
var inherits = require('util').inherits;

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
    var Characteristic = homebridge.hap.Characteristic;

    var DailyMaxTemperature = function DailyMaxTemperature() {
      Characteristic.call(this, 'Daily Max Temperature', '422693A4-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps({
        format: Characteristic.Formats.FLOAT,
        unit: Characteristic.Units.CELSIUS,
        maxValue: 100,
        minValue: -100,
        minStep: 0.1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    };
    inherits(DailyMaxTemperature, Characteristic);

    var DailyMinTemperature = function DailyMinTemperature() {
      Characteristic.call(this, 'Daily Min Temperature', '422693A5-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps({
        format: Characteristic.Formats.FLOAT,
        unit: Characteristic.Units.CELSIUS,
        maxValue: 100,
        minValue: -100,
        minStep: 0.1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    };
    inherits(DailyMinTemperature, Characteristic);

    _this.service.addCharacteristic(_this.Characteristic.CurrentRelativeHumidity);
    _this.service.addCharacteristic(DailyMaxTemperature);
    _this.service.addCharacteristic(DailyMinTemperature);

    // Should work with negative values
    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).props.minValue = -50;

    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).on('get', _this.getCurrentTemperature.bind(_this));

    _this.service.getCharacteristic(_this.Characteristic.CurrentRelativeHumidity).on('get', _this.getCurrentHumidity.bind(_this));

    _this.service.getCharacteristic(DailyMaxTemperature).on('get', _this.getDailyMaxTemperature.bind(_this));

    _this.service.getCharacteristic(DailyMinTemperature).on('get', _this.getDailyMinTemperature.bind(_this));

    _this.meta.setCharacteristic(_this.Characteristic.Model, "TemperatureSensor");

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
          return 'sensor' + sensor.id === _this2.id;
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
    key: 'getDailyMaxTemperature',
    value: function getDailyMaxTemperature(callback) {
      var _this4 = this;

      this.db.serialize(function () {
        _this4.db.each('SELECT MAX(value) as value\n         FROM sensor \n         WHERE sensor_id = \'' + _this4.id + '\'\n         AND datetime > datetime(\'now\',\'start of day\')', function (err, row) {
          callback(null, row.value);
        });
      });
    }
  }, {
    key: 'getDailyMinTemperature',
    value: function getDailyMinTemperature(callback) {
      var _this5 = this;

      this.db.serialize(function () {
        _this5.db.each('SELECT MIN(value) as value\n         FROM sensor \n         WHERE sensor_id = \'' + _this5.id + '\'\n         AND datetime > datetime(\'now\',\'start of day\')', function (err, row) {
          callback(null, row.value);
        });
      });
    }
  }, {
    key: 'respondToEvent',
    value: function respondToEvent(type, value) {
      var _this6 = this;

      if (type == 1) {
        (function () {
          _this6.log('Got temperatur update: ' + value + ' for ' + _this6.name);
          _this6.service.getCharacteristic(_this6.Characteristic.CurrentTemperature).setValue(parseFloat(value));
          var datetime = new Date().toISOString();
          _this6.db.serialize(function () {
            _this6.db.run('INSERT INTO sensor(sensor_id, type , datetime, value)\n                      VALUES(\'' + _this6.id + '\', \'temperatur\', datetime(\'' + datetime + '\'), ' + value + ')');
          });
        })();
      } else {
        this.log('Got humidity update: ' + value + ' for ' + this.name);
        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity).setValue(parseFloat(value));
      }
    }
  }]);

  return TelldusTemperature;
}(TelldusAccessory);

// select min(value) from sensor where sensor_id = 'sensor12' and datetime > datetime('now','start of day')


module.exports = TelldusTemperature;