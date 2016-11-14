'use strict'

const telldus = require('telldus');
const TelldusAccessory = require('./telldus-accessory')
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
    this.id = "humsensor" + data.id
    this.service = new this.Service.HumiditySensor(this.name)

    this.service
    .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
    .on('get', this.getCurrentHumidity.bind(this))

    this.meta
    .setCharacteristic(this.Characteristic.Model, "HumiditySensor")

    let listener = telldus.addSensorEventListener(this.listenToHumidity.bind(this))

  }

  /**
   * Get the temperatur
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getCurrentHumidity(callback) {
    this.log("Getting humidity...");

      telldus.getSensors((err, sensors) => {
        if (!!err) callback(err, null)
        let humiditySensor = sensors.find((sensor) => "humsensor" + sensor.id === this.id)
        let humidity = humiditySensor.data.find((data) => data.type === "HUMIDITY").value
        this.log("Humidity is: " + humidity)
        callback(null, parseFloat(humidity))
      })
  }

  listenToHumidity(deviceId,protocol,model,type,value,timestamp) {
    if("humsensor" + deviceId == this.id && type == 2){
      this.log(`Got humidity update: ${value} for ${this.name}`)
      this.service
      .getCharacteristic(this.Characteristic.CurrentRelativeHumidity).setValue(parseFloat(value));
    }
  }

}

module.exports = TelldusTemperature
