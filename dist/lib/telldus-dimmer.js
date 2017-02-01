'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var telldus = require('telldus');
var TelldusAccessory = require('./telldus-accessory');
var path = require('path');
//var TelldusStorage = require('node-persist')

// Convert 0-255 to 0-100
var bitsToPercentage = function bitsToPercentage(value) {
  return Math.round(value * 100 / 255);
};
// Convert 0-100 to 0-255
var percentageToBits = function percentageToBits(value) {
  return Math.round(value * 255 / 100);
};

/**
 * An Accessory convenience wrapper.
 */

var TelldusDimmer = function (_TelldusAccessory) {
  _inherits(TelldusDimmer, _TelldusAccessory);

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
  function TelldusDimmer(data, log, homebridge, config, db) {
    _classCallCheck(this, TelldusDimmer);

    var _this = _possibleConstructorReturn(this, (TelldusDimmer.__proto__ || Object.getPrototypeOf(TelldusDimmer)).call(this, data, log, homebridge, config));

    _this.db = db;
    db.serialize(function () {
      _this.db.run('INSERT OR IGNORE INTO dimmer(dimmer_id, value) VALUES(' + _this.id + ', 0)');
    });

    _this.service.getCharacteristic(_this.Characteristic.On).on('get', _this.getOnState.bind(_this)).on('set', _this.setOnState.bind(_this));

    _this.service.getCharacteristic(_this.Characteristic.Brightness).on('get', _this.getDimState.bind(_this)).on('set', _this.setDimState.bind(_this));

    // Presist dim value. Can't get the value from Telldus, so let's
    // cache it. Presists to disk
    return _this;
  }

  /**
   * Get the on-state of this Dimmer
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */


  _createClass(TelldusDimmer, [{
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
     * Get the on-state of this Dimmer
     *
     * @param  {Function}           callback       To be invoked when result is
     *                                             obtained.
     */

  }, {
    key: 'getDimState',
    value: function getDimState(callback) {
      var _this3 = this;

      this.log("Getting Dim-state...");
      this.getState(function (err, state) {
        if (!!err) callback(err, null);
        if (state.name == 'OFF') {
          _this3._getPersistedDimValue(function (value) {
            _this3.log("Lightbulb is off and last brightness: " + value);
            callback(null, value);
          });
        } else {
          _this3.log("Lightbulb is on, brightness: " + bitsToPercentage(state.level) + "%");
          callback(null, bitsToPercentage(state.level));
        }
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
      var _this4 = this;

      this.log('Recieved set On-state request: ' + value);
      if (value) {
        // we would like it to return to old dim value
        this._getPersistedDimValue(function (value) {
          telldus.dim(_this4.id, percentageToBits(value), function (err) {
            if (!!err) callback(err, null);
            callback(null, value);
          });
        });
      } else {
        telldus.turnOff(this.id, function (err) {
          if (!!err) callback(err, null);
          callback(null, value);
        });
      }
    }

    /**
     * Set the Dim-state of this Dimmer
     *
     * @param  {*}                  value          The value to set,
     *                                             corresponding to the passed
     *                                             Characteristic
     * @param  {Function}           callback       To be invoked when result is
     *                                             obtained.
     */

  }, {
    key: 'setDimState',
    value: function setDimState(value, callback) {
      var _this5 = this;

      this.log('Recieved set Dim-state request: ' + value);
      telldus.dim(this.id, percentageToBits(value), function (err) {
        if (!!err) callback(err, null);
        _this5._persistDimValue(value);
        //Let's set On-state to true
        _this5.service.setCharacteristic(_this5.Characteristic.On, true);
        callback(null, value);
      });
    }
  }, {
    key: '_getPersistedDimValue',
    value: function _getPersistedDimValue(callback) {
      var _this6 = this;

      db.serialize(function () {
        _this6.db.each('SELECT value FROM dimmer WHERE dimmer_id = ' + _this6.id, function (err, row) {
          callback(row.value);
        });
      });
    }
  }, {
    key: '_persistDimValue',
    value: function _persistDimValue(value) {
      var _this7 = this;

      db.serialize(function () {
        _this7.db.run('UPDATE dimmer set value = ' + value + ' WHERE dimmer_id = ' + _this7.id);
      });
    }
  }]);

  return TelldusDimmer;
}(TelldusAccessory);

module.exports = TelldusDimmer;