'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var telldus = require('telldus');

var TelldusAccessory = function () {

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

  function TelldusAccessory(data, log, homebridge, config) {
    var _this = this;

    _classCallCheck(this, TelldusAccessory);

    this.name = data.name;
    this.id = data.id;

    // Split manufacturer and model
    var modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A'];
    this.model = modelPair[0];
    this.manufacturer = modelPair[1];

    this.Service = homebridge.hap.Service;
    this.Characteristic = homebridge.hap.Characteristic;

    this.service = new this.Service.Lightbulb(this.name);
    this.meta = new this.Service.AccessoryInformation();
    this.meta.setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer);
    this.meta.setCharacteristic(this.Characteristic.Model, this.model);

    // Device log
    this.log = function (string) {
      return log('[' + _this.name + ']: ' + string);
    };
  }

  /**
   * Return the State this Accessory.
   * @param  {Function} callback Invoked when status has been found.
   */


  _createClass(TelldusAccessory, [{
    key: 'getState',
    value: function getState(callback) {
      var _this2 = this;

      telldus.getDevices(function (err, devices) {
        if (!!err) callback(err, null);
        callback(null, devices.find(function (d) {
          return d.id === _this2.id;
        }).status);
      });
    }

    /**
     * No action done at this moment.
     *
     * @param  {Function} callback Invoked when logging has been done.
     */

  }, {
    key: 'identify',
    value: function identify(callback) {
      this.log('Identify called.');
      callback();
    }

    /**
     * Return the supported services by this Accessory.
     * @return {Array} An array of services supported by this accessory.
     */

  }, {
    key: 'getServices',
    value: function getServices() {
      return [this.service, this.meta];
    }
  }]);

  return TelldusAccessory;
}();

module.exports = TelldusAccessory;