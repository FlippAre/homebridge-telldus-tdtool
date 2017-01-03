'use strict'

const telldus =           require('telldus')
const TelldusAccessory =  require('./telldus-accessory')
const RateLimiter =       require('limiter').RateLimiter
/**
 * An Accessory convenience wrapper.
 */
class TelldusTemperature extends TelldusAccessory {

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
    this.id = "sensor" + data.id
    this.service = new this.Service.TemperatureSensor(this.name)

    this.service
    .getCharacteristic(this.Characteristic.CurrentTemperature)
    .on('get', this.getCurrentTemperature.bind(this))

    this.meta
    .setCharacteristic(this.Characteristic.Model, "TemperatureSensor")

    this.limiter = new RateLimiter(1, 30*1000) //limit to once ever 30s

  }

  /**
   * Get the temperatur
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getCurrentTemperature(callback) {
    this.log("Getting temperature...");

      telldus.getSensors((err, sensors) => {
        if (!!err) callback(err, null)
        let temperaturSensor = sensors.find((sensor) => "sensor" + sensor.id === this.id)
        let temperature = temperaturSensor.data.find((data) => data.type === "TEMPERATURE").value
        this.log("Temperatur is: " + temperature)
        callback(null, parseFloat(temperature))
      })
  }

  respondToEvent(value) {
    this.limiter.removeTokens(1, () => {
      this.log(`Got temperatur update: ${value} for ${this.name}`)
      this.service.getCharacteristic(
        this.Characteristic.CurrentTemperature).setValue(parseFloat(value)
      )
    })
  }

}

module.exports = TelldusTemperature
