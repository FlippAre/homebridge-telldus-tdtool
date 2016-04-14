'use strict'

const telldus = require('telldus');

// Convert 0-255 to 0-100
const bitsToPercentage = value => Math.round(value * 100 / 255)
// Convert 0-100 to 0-255
const percentageToBits = value => Math.round(value * 255 / 100)


/**
 * An Accessory convenience wrapper.
 */
class TelldusSwitch {

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
    this.name = data.name
    this.id = data.id

    // Split manufacturer and model
    const modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A']
    this.model = modelPair[0]
    this.manufacturer = modelPair[1]

    this.Service = homebridge.hap.Service
    this.Characteristic = homebridge.hap.Characteristic

    this.service = new this.Service.Lightbulb(this.name)
    this.service
    .getCharacteristic(this.Characteristic.On)
    .on('get', this.getOnState.bind(this))
    .on('set', this.setOnState.bind(this));

    // Device log
    this.log = string => log(`[${this.name}]: ${string}`)

  }


  /**
   * Get the on-state of this Dimmer
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getOnState(callback) {
    this.log("Getting On-state...");

      telldus.getDevices((err,devices) => {
        if (!!err) callback(err, null)
        const device = devices.find(d => d.id === this.id)
        this.log("State is: " + device.status.name)
        callback(null, device.status.name !== 'OFF')
      })
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
   setOnState(value, callback) {
     this.log('Recieved set On-state request: ' + value)
         if(value){
           // we would like it to return to old dim value
           telldus.turnOn(this.id, (err) => {
               if (!!err) callback(err, null)
               callback(null, value)
           });
         }else{
           telldus.turnOff(this.id, (err) => {
               if (!!err) callback(err, null)
               callback(null, value)
           })
         }
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
    return [this.service]
  }
}

module.exports = TelldusSwitch
