'use strict'

const telldus = require('telldus');
const TelldusAccessory = require('./telldus-accessory')
/**
 * An Accessory convenience wrapper.
 */
class TelldusDoor extends TelldusAccessory {

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

    this.service = new this.Service.Door(this.name)
    this.service.addCharacteristic(this.Characteristic.ContactSensorState)
    //this.service.removeCharacteristic(this.Characteristic.PositionState)
    //this.service.removeCharacteristic(this.Characteristic.TargetPosition)

    this.service
    .getCharacteristic(this.Characteristic.ContactSensorState)
    .on('get', this.getContactSensorState.bind(this))

    this.meta
    .setCharacteristic(this.Characteristic.Model, "Door")

  }

  /**
   * Translates ON/OFF to open or closed
   *
   * @param  {string}           state           String, ON or OFF
   *
   */

  _translateStateToDoorStateCharacteristic(state){
    if(state.name === 'ON'){
      return this.Characteristic.CurrentDoorState.OPEN
    }else{
      return this.Characteristic.CurrentDoorState.CLOSED
    }
  }

  _translateOpenStateToCurrentPosition(state){
    if (state.name === 'ON'){
      return 100
    }else {
       return 0
    }
  }

  _translateStateToPosition(state){
    if (state.name === 'ON'){
      return this.Characteristic.PositionState.STOPPED
    }else {
       return this.Characteristic.PositionState.STOPPED
    }
  }

  /**
   * Get the contact sensor-state of this door
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getContactSensorState(callback) {
    this.log("Getting Door-state...");

      this.getState((err, state) => {
        if (!!err) callback(err, null)
        this.log("Door is: " + state.name)
        if(state.name === 'ON'){
          callback(null, this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED)
        }else{
          callback(null, this.Characteristic.ContactSensorState.CONTACT_DETECTED)
        }
      })
  }

  respondToEvent(state){
    if(state.name === 'ON'){
      this.service
        .getCharacteristic(this.Characteristic.ContactSensorState)
        .setValue(this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED)
    }else{
      this.service
        .getCharacteristic(this.Characteristic.ContactSensorState)
        .setValue(this.Characteristic.ContactSensorState.CONTACT_DETECTED)
    }
  }
  

}

module.exports = TelldusDoor
