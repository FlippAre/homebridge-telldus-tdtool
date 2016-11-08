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

var TelldusSwitch = function (_TelldusAccessory) {
  _inherits(TelldusSwitch, _TelldusAccessory);

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
  function TelldusSwitch(data, log, homebridge, config) {
    _classCallCheck(this, TelldusSwitch);

    var _this = _possibleConstructorReturn(this, (TelldusSwitch.__proto__ || Object.getPrototypeOf(TelldusSwitch)).call(this, data, log, homebridge, config));

    _this.service.getCharacteristic(_this.Characteristic.On).on('get', _this.getOnState.bind(_this)).on('set', _this.setOnState.bind(_this));

    return _this;
  }

  /**
   * Get the on-state of this Dimmer
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */


  _createClass(TelldusSwitch, [{
    key: 'getOnState',
    value: function getOnState(callback) {
      var _this2 = this;

      this.log("Getting On-state...");
      this.getState(function (err, state) {
        if (!!err) callback(err, null);
        _this2.log("State is: " + state.name);
        callback(null, state.name !== 'OFF');
      });
    }

    /**
     * Set the state of this Accessory with the given Characteristic.
     *
     * @param  {*}                  value          The value to set,
     *                                             corresponding to the passed
     *                                             Characteristic
     * @param  {Function}           callback       To be invoked when result is
     *                                             obtained.
     */

  }, {
    key: 'setOnState',
    value: function setOnState(value, callback) {
      this.log('Recieved set On-state request: ' + value);
      if (value) {
        // we would like it to return to old dim value
        telldus.turnOn(this.id, function (err) {
          if (!!err) callback(err, null);
          callback(null, value);
        });
      } else {
        telldus.turnOff(this.id, function (err) {
          if (!!err) callback(err, null);
          callback(null, value);
        });
      }
    }
  }]);

  return TelldusSwitch;
}(TelldusAccessory);

module.exports = TelldusSwitch;