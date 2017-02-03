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
    var Characteristic = _this.homebridge.Characteristic;

    var DailyMaxTemperature = function DailyMaxTemperature() {
      Characteristic.call(DailyMaxTemperature, 'Current Temperature', '0000FA87-0000-1000-8000-0026BB765291');
      DailyMaxTemperature.setProps({
        format: Characteristic.Formats.FLOAT,
        unit: Characteristic.Units.CELSIUS,
        maxValue: 100,
        minValue: 0,
        minStep: 0.1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
      });
      DailyMaxTemperature.value = DailyMaxTemperature.getDefaultValue();
    };
    inherits(DailyMaxTemperature, Characteristic);

    DailyMaxTemperature.displayName = 'Daily Max Temperature';
    DailyMaxTemperature.UUID = '0000FF11-0000-1000-8000-0026BB765291';

    //DailyMaxTemperature.prototype.displayName = "Daily Max Temperature"
    console.log(DailyMaxTemperature);

    _this.service.addCharacteristic(_this.Characteristic.CurrentRelativeHumidity);
    _this.service.addCharacteristic(DailyMaxTemperature);

    console.log(_this.service.getCharacteristic(DailyMaxTemperature));

    // Should work with negative values
    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).props.minValue = -50;

    _this.service.getCharacteristic(_this.Characteristic.CurrentTemperature).on('get', _this.getCurrentTemperature.bind(_this));

    _this.service.getCharacteristic(_this.Characteristic.CurrentRelativeHumidity).on('get', _this.getCurrentHumidity.bind(_this));

    _this.service.getCharacteristic(DailyMaxTemperature).on('get', _this.getDailyMaxTemperature.bind(_this));

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
      callback(null, 10);
    }
  }, {
    key: 'respondToEvent',
    value: function respondToEvent(type, value) {
      var _this4 = this;

      if (type == 1) {
        (function () {
          _this4.log('Got temperatur update: ' + value + ' for ' + _this4.name);
          _this4.service.getCharacteristic(_this4.Characteristic.CurrentTemperature).setValue(parseFloat(value));
          var datetime = new Date().toISOString();
          _this4.db.serialize(function () {
            _this4.db.run('INSERT INTO sensor(sensor_id, type , datetime, value)\n                      VALUES(\'' + _this4.id + '\', \'temperatur\', datetime(\'' + datetime + '\'), ' + value + ')');
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