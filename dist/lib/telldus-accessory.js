const telldus = require('telldus');

class TelldusAccessory {

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
  constructor(data, log, homebridge, config) {
    this.name = data.name;
    this.id = data.id;

    // Split manufacturer and model
    const modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A'];
    this.model = modelPair[0];
    this.manufacturer = modelPair[1];

    this.Service = homebridge.hap.Service;
    this.Characteristic = homebridge.hap.Characteristic;

    this.service = new this.Service.Lightbulb(this.name);
    this.meta = new this.Service.AccessoryInformation();
    this.meta.setCharacteristic(this.Characteristic.Manufacturer, this.manufacturer);
    this.meta.setCharacteristic(this.Characteristic.Model, this.model);

    // Device log
    this.log = string => log(`[${ this.name }]: ${ string }`);
  }

  /**
   * Return the State this Accessory.
   * @param  {Function} callback Invoked when status has been found.
   */
  getState(callback) {
    telldus.getDevices((err, devices) => {
      if (!!err) callback(err, null);
      callback(null, devices.find(d => d.id === this.id).status);
    });
  }

  /**
   * No action done at this moment.
   *
   * @param  {Function} callback Invoked when logging has been done.
   */
  identify(callback) {
    this.log('Identify called.');
    callback();
  }

  /**
   * Return the supported services by this Accessory.
   * @return {Array} An array of services supported by this accessory.
   */
  getServices() {
    return [this.service, this.meta];
  }

}

module.exports = TelldusAccessory;