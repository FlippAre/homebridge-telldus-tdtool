'use strict'

const telldus = require('telldus');
const TelldusAccessory = require('./telldus-accessory')
/**
 * An Accessory convenience wrapper.
 */
class TelldusSwitch extends TelldusAccessory {

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
    super(data, log, homebridge, config)

    this.service
    .getCharacteristic(this.Characteristic.On)
    .on('get', this.getOnState.bind(this))
    .on('set', this.setOnState.bind(this));


  }

  /**
   * Get the on-state of this Dimmer
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getOnState(callback) {
    this.log("Getting On-state...");
      this.getState((err,state) => {
        if (!!err) callback(err, null)
        this.log("State is: " + state.name)
        callback(null, state.name !== 'OFF')
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
}

module.exports = TelldusSwitch
