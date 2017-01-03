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

var TelldusDoor = function (_TelldusAccessory) {
  _inherits(TelldusDoor, _TelldusAccessory);

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
  function TelldusDoor(data, log, homebridge, config) {
    _classCallCheck(this, TelldusDoor);

    var _this = _possibleConstructorReturn(this, (TelldusDoor.__proto__ || Object.getPrototypeOf(TelldusDoor)).call(this, data, log, homebridge, config));

    _this.service = new _this.Service.Door(_this.name);
    _this.service.addCharacteristic(_this.Characteristic.ContactSensorState);
    //this.service.removeCharacteristic(this.Characteristic.PositionState)
    //this.service.removeCharacteristic(this.Characteristic.TargetPosition)

    _this.service.getCharacteristic(_this.Characteristic.ContactSensorState).on('get', _this.getContactSensorState.bind(_this));

    _this.meta.setCharacteristic(_this.Characteristic.Model, "Door");

    return _this;
  }

  /**
   * Translates ON/OFF to open or closed
   *
   * @param  {string}           state           String, ON or OFF
   *
   */

  _createClass(TelldusDoor, [{
    key: '_translateStateToDoorStateCharacteristic',
    value: function _translateStateToDoorStateCharacteristic(state) {
      if (state.name === 'ON') {
        return this.Characteristic.CurrentDoorState.OPEN;
      } else {
        return this.Characteristic.CurrentDoorState.CLOSED;
      }
    }
  }, {
    key: '_translateOpenStateToCurrentPosition',
    value: function _translateOpenStateToCurrentPosition(state) {
      if (state.name === 'ON') {
        return 100;
      } else {
        return 0;
      }
    }
  }, {
    key: '_translateStateToPosition',
    value: function _translateStateToPosition(state) {
      if (state.name === 'ON') {
        return this.Characteristic.PositionState.STOPPED;
      } else {
        return this.Characteristic.PositionState.STOPPED;
      }
    }

    /**
     * Get the contact sensor-state of this door
     *
     * @param  {Function}           callback       To be invoked when result is
     *                                             obtained.
     */

  }, {
    key: 'getContactSensorState',
    value: function getContactSensorState(callback) {
      var _this2 = this;

      this.log("Getting Door-state...");

      this.getState(function (err, state) {
        if (!!err) callback(err, null);
        _this2.log("Door is: " + state.name);
        if (state.name === 'ON') {
          callback(null, _this2.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
        } else {
          callback(null, _this2.Characteristic.ContactSensorState.CONTACT_DETECTED);
        }
      });
    }
  }, {
    key: 'respondToEvent',
    value: function respondToEvent(state) {
      if (state.name === 'ON') {
        this.service.getCharacteristic(this.Characteristic.ContactSensorState).setValue(this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
      } else {
        this.service.getCharacteristic(this.Characteristic.ContactSensorState).setValue(this.Characteristic.ContactSensorState.CONTACT_DETECTED);
      }
    }
  }]);

  return TelldusDoor;
}(TelldusAccessory);

module.exports = TelldusDoor;