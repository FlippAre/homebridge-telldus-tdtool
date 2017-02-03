'use strict'

const telldus                             = require('telldus')
const TelldusAccessory                    = require('./telldus-accessory')
const inherits                            = require('util').inherits;

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
  constructor(data, log, homebridge, config, db) {
    super(data, log, homebridge, config)
    this.id = "sensor" + data.id
    this.service = new this.Service.TemperatureSensor(this.name)
    this.db = db
    
    class DailyMaxTemperature extends this.Characteristic.CurrentTemperature {
        constructor(displayName, UUID){
          super(displayName, UUID)
        }
    }
    DailyMaxTemperature.displayName = 'Daily Max Temperature'
    DailyMaxTemperature.UUID = '0000FF11-0000-1000-8000-0026BB765291'
    
    //DailyMaxTemperature.prototype.displayName = "Daily Max Temperature"
    console.log(DailyMaxTemperature);

    this.service.addCharacteristic(this.Characteristic.CurrentRelativeHumidity)
    this.service.addCharacteristic(DailyMaxTemperature)

    console.log(this.service
    .getCharacteristic(DailyMaxTemperature))

    // Should work with negative values
    this.service
    .getCharacteristic(this.Characteristic.CurrentTemperature)
    .props.minValue = -50;

    this.service
    .getCharacteristic(this.Characteristic.CurrentTemperature)
    .on('get', this.getCurrentTemperature.bind(this))

    this.service
    .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
    .on('get', this.getCurrentHumidity.bind(this))

    this.service
    .getCharacteristic(DailyMaxTemperature)
    .on('get', this.getDailyMaxTemperature.bind(this))

    this.meta
    .setCharacteristic(this.Characteristic.Model, "TemperatureSensor")

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
        let temperaturSensor = sensors.find((sensor) => `sensor${sensor.id}` === this.id)
        let temperature = temperaturSensor.data.find((data) => data.type === "TEMPERATURE").value
        this.log("Temperatur is: " + temperature)
        callback(null, parseFloat(temperature))
      })
  }

    /**
   * Get the humidity
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getCurrentHumidity(callback) {
    this.log("Getting humidity...");

      telldus.getSensors((err, sensors) => {
        if (!!err) callback(err, null)
        let temperaturSensor = sensors.find((sensor) => "sensor" + sensor.id === this.id)
        let humidity = temperaturSensor.data.find((data) => data.type === "HUMIDITY").value
        this.log("Humidity is: " + humidity)
        callback(null, parseFloat(humidity))
      })
  }

  getDailyMaxTemperature(callback){
    callback(null, 10)
  }

  respondToEvent(type, value) {
      if(type == 1){ 
        this.log(`Got temperatur update: ${value} for ${this.name}`)
        this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
          .setValue(parseFloat(value)
        )
        let datetime = new Date().toISOString()
        this.db.serialize(() => {
          this.db.run(`INSERT INTO sensor(sensor_id, type , datetime, value)
                      VALUES('${this.id}', 'temperatur', datetime('${datetime}'), ${value})`);
        })
      }else{
        this.log(`Got humidity update: ${value} for ${this.name}`)
        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
          .setValue(parseFloat(value)
        )
      }
  }

}



// select min(value) from sensor where sensor_id = 'sensor12' and datetime > datetime('now','start of day')
module.exports = TelldusTemperature
